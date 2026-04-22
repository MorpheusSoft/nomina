"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export default function PortalTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState('');
  
  const [formDialog, setFormDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [workerComment, setWorkerComment] = useState('');
  const [ticketType, setTicketType] = useState<string>('ABSENCE_OR_LEAVE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Json Metadata custom fields
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const toast = useRef<Toast>(null);

  const TICKET_TYPES = [
    { label: 'Permisos / Reposos', value: 'ABSENCE_OR_LEAVE' },
    { label: 'Vacaciones', value: 'VACATION' },
    { label: 'Adelanto de Fideicomiso', value: 'TRUST_ADVANCE' },
    { label: 'Reclamos de Nómina', value: 'PAYROLL_CLAIM' },
    { label: 'Solicitud de Constancias', value: 'DOCUMENT_REQUEST' },
    { label: 'Reembolso de Gastos', value: 'EXPENSE_REIMBURSEMENT' }
  ];

  useEffect(() => {
    const wId = localStorage.getItem('portal_worker_id');
    if (!wId) {
      router.push('/portal/login');
      return;
    }
    setWorkerId(wId);
    fetchTickets(wId);
  }, []);

  const fetchTickets = async (wId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/portal/worker-tickets/${wId}`);
      setTickets(res.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar sus requerimientos' });
    } finally {
      setLoading(false);
    }
  };

  const statusTemplate = (rowData: any) => {
    switch (rowData.status) {
      case 'APPROVED': return <Tag severity="success" value="Aprobado" />;
      case 'REJECTED': return <Tag severity="danger" value="Rechazado" />;
      case 'IN_PROGRESS': return <Tag severity="info" value="En Proceso" />;
      default: return <Tag severity="warning" value="Pendiente" />;
    }
  };

  const typeTemplate = (rowData: any) => {
    const found = TICKET_TYPES.find(t => t.value === rowData.type);
    return <span className="font-medium text-slate-700">{found ? found.label : rowData.type}</span>;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title || !description) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios' });
      return;
    }
    if ((ticketType === 'ABSENCE_OR_LEAVE' || ticketType === 'VACATION') && (!startDate || !endDate)) {
        toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe especificar el rango de fechas' });
        return;
    }

    try {
      setSubmitting(true);
      let attachmentsUrl: string[] = [];

      // Subida previa de archivos si existen
      if (selectedFiles && selectedFiles.length > 0) {
          const formData = new FormData();
          selectedFiles.forEach((file) => {
              formData.append('files', file);
          });
          const uploadRes = await axios.post(`${BASE_URL}/portal/worker-tickets/upload/${workerId}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
              attachmentsUrl = uploadRes.data.urls;
          }
      }

      const payload: any = {
          workerId,
          type: ticketType,
          title,
          description,
          jsonMetadata: {
             attachments: attachmentsUrl
          }
      };

      if (ticketType === 'ABSENCE_OR_LEAVE' || ticketType === 'VACATION') {
          payload.jsonMetadata.startDate = startDate?.toISOString();
          payload.jsonMetadata.endDate = endDate?.toISOString();
      }

      await axios.post(`${BASE_URL}/portal/worker-tickets/${workerId}`, payload);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Requerimiento enviado correctamente' });
      setFormDialog(false);
      fetchTickets(workerId);
      // Reset form
      setTitle(''); setDescription(''); setStartDate(null); setEndDate(null); setTicketType('ABSENCE_OR_LEAVE');
      setSelectedFiles([]);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket. (Peso o Formato Invalido)' });
    } finally {
      setSubmitting(false);
    }
  };

  const openTicketView = (ticket: any) => {
    setSelectedTicket(ticket);
    setWorkerComment('');
    setViewDialog(true);
  };

  const sendWorkerComment = async () => {
     if (!workerComment.trim() || !selectedTicket) return;
     try {
       await axios.post(`${BASE_URL}/portal/worker-tickets/${workerId}/comments/${selectedTicket.id}`, { text: workerComment });
       toast.current?.show({ severity: 'success', summary: 'Enviado', detail: 'Tu mensaje ha sido enviado' });
       
       setSelectedTicket((prev: any) => {
         const meta = prev.jsonMetadata || {};
         const comments = meta.comments || [];
         return { ...prev, jsonMetadata: { ...meta, comments: [...comments, { authorName: 'Tú', authorType: 'WORKER', text: workerComment, createdAt: new Date().toISOString() }] } };
       });
       setWorkerComment('');
       fetchTickets(workerId);
     } catch (e) {
       toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la respuesta' });
     }
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      
      <div className="flex items-center gap-4 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/portal/dashboard')}>
         <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
            <i className="pi pi-arrow-left"></i>
         </div>
         <h2 className="text-xl font-bold text-slate-800">Volver al Panel</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                <i className="pi pi-ticket text-xl"></i>
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-800">Taquilla de Requerimientos</h3>
               <p className="text-sm text-slate-500 font-medium">Gestione permisos, vacaciones, reclamos y solicitudes.</p>
             </div>
           </div>
           
           <Button label="Crear Solicitud" icon="pi pi-plus" className="bg-teal-600 text-white border-none hover:bg-teal-700" onClick={() => setFormDialog(true)} />
        </div>

        <DataTable value={tickets} loading={loading} emptyMessage="No ha emitido ningún ticket de atención." className="p-datatable-sm" stripedRows>
          <Column header="Categoría" body={typeTemplate} />
          <Column field="title" header="Asunto" className="font-bold text-slate-800" />
          <Column header="Fecha de Creación" body={(r) => new Date(r.createdAt).toLocaleDateString('es-ES')} />
          <Column header="Estatus" body={statusTemplate} />
          <Column body={(r) => (
             <Button 
                icon="pi pi-eye" 
                rounded text severity="info" 
                onClick={() => openTicketView(r)} 
             />
          )} />
        </DataTable>
      </div>

      <Dialog header="Nueva Solicitud" visible={formDialog} style={{ width: '500px' }} modal onHide={() => setFormDialog(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">¿Qué necesita solicitar? *</label>
            <Dropdown value={ticketType} options={TICKET_TYPES} onChange={(e) => setTicketType(e.value)} placeholder="Seleccione Categoría" className="w-full" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">Asunto Breve *</label>
            <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Solicitud de Constancia para Banco" required />
          </div>

          {(ticketType === 'ABSENCE_OR_LEAVE' || ticketType === 'VACATION') && (
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex flex-col gap-2">
                   <label className="font-semibold text-slate-700 text-sm">Desde *</label>
                   <Calendar value={startDate} onChange={(e) => setStartDate(e.value as Date)} dateFormat="dd/mm/yy" required />
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="font-semibold text-slate-700 text-sm">Hasta *</label>
                   <Calendar value={endDate} onChange={(e) => setEndDate(e.value as Date)} dateFormat="dd/mm/yy" required minDate={startDate || undefined} />
                 </div>
              </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">Describa su solicitud *</label>
            <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Detalle toda la información pertinente para que RRHH procese su requerimiento." required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 text-sm">Adjuntar Comprobantes (Opcional)</label>
            <FileUpload 
              mode="advanced"
              multiple 
              accept="image/*,application/pdf" 
              maxFileSize={2000000} 
              customUpload
              uploadHandler={() => {}} // We override submit later
              onSelect={(e) => setSelectedFiles(e.files)}
              onRemove={(e) => setSelectedFiles(selectedFiles.filter(f => f.name !== e.file.name))}
              onClear={() => setSelectedFiles([])}
              chooseLabel="Añadir Soporte"
              cancelLabel="Cancelar"
              emptyTemplate={<p className="text-sm text-slate-500 m-0">Arrastre y suelte hasta 3 imágenes o PDFs (Max 2MB).</p>}
              className="w-full text-sm"
              headerStyle={{ padding: '0.5rem', background: '#f8fafc' }}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
             <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-text text-slate-600" onClick={() => setFormDialog(false)} />
             <Button type="submit" label="Enviar Ticket" icon="pi pi-send" loading={submitting} className="bg-teal-600 border-none" />
          </div>
        </form>
      </Dialog>

      {/* Ticket History / Chat Viewer Dialog */}
      <Dialog header="Detalles del Requerimiento" visible={viewDialog} style={{ width: '600px' }} modal onHide={() => setViewDialog(false)}>
        {selectedTicket && (
          <div className="space-y-6 mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                 <Tag severity="info" value={TICKET_TYPES.find(t => t.value === selectedTicket.type)?.label || selectedTicket.type} />
                 {statusTemplate(selectedTicket)}
               </div>
               <h4 className="font-bold text-slate-800 text-lg mb-1">{selectedTicket.title}</h4>
               <p className="text-sm text-slate-600"><strong>Generado el:</strong> {new Date(selectedTicket.createdAt).toLocaleString('es-ES')}</p>
            </div>

            <div>
               <h5 className="font-bold text-slate-700 mb-2">Descripción Inicial</h5>
               <div className="bg-white p-4 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap text-sm">
                  {selectedTicket.description}
               </div>
            </div>

            {/* Archivos Adjuntos */}
            {selectedTicket.jsonMetadata?.attachments && selectedTicket.jsonMetadata.attachments.length > 0 && (
              <div>
                 <h5 className="font-bold text-slate-700 mb-2">Soportes Enviados</h5>
                 <div className="flex flex-wrap gap-3">
                    {selectedTicket.jsonMetadata.attachments.map((url: string, index: number) => {
                        const isPdf = url.endsWith('.pdf');
                        const serverUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1').replace('/api/v1', '');
                        const finalUrl = `${serverUrl}${url}`;
                        return (
                          <a key={index} href={finalUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center justify-center w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg hover:border-teal-500 transition-colors overflow-hidden">
                             {isPdf ? (
                               <i className="pi pi-file-pdf text-red-500 text-2xl"></i>
                             ) : (
                               <img src={finalUrl} alt={`Soporte`} className="object-cover w-full h-full" />
                             )}
                          </a>
                        )
                    })}
                 </div>
              </div>
            )}

            {/* Bitácora de Gestión */}
            <div className="border-t border-slate-200 pt-5 mt-4">
               <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><i className="pi pi-list text-teal-500"></i> Bitácora de Seguimiento</h5>
               
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-64 overflow-y-auto mb-4">
                  {(!selectedTicket.jsonMetadata?.comments || selectedTicket.jsonMetadata.comments.length === 0) && (
                     <div className="text-center text-slate-400 text-sm mt-8">Aún no existen registros de gestión sobre este requerimiento.</div>
                  )}
                  {selectedTicket.jsonMetadata?.comments?.length > 0 && (
                     <div className="relative border-l-2 border-slate-200 ml-2 space-y-5">
                       {selectedTicket.jsonMetadata.comments.map((comment: any, idx: number) => {
                           const isAdmin = comment.authorType === 'ADMIN';
                           return (
                             <div key={idx} className="relative pl-6">
                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-teal-500'}`}></div>
                                <div className="text-[11px] font-bold text-slate-500 mb-1">
                                  <span className={isAdmin ? 'text-indigo-600' : 'text-teal-600'}>{isAdmin ? 'Gestión de RRHH' : 'Tu Observación'}</span> • {comment.authorName} • {new Date(comment.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                                <div className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                  {comment.text}
                                </div>
                             </div>
                           )
                       })}
                     </div>
                  )}
               </div>

               <div className="flex gap-2">
                 <InputTextarea 
                   value={workerComment} 
                   onChange={(e) => setWorkerComment(e.target.value)} 
                   rows={2} 
                   className="w-full text-sm rounded-xl resize-none border-teal-200 focus:ring-teal-500" 
                   placeholder="Escribir una duda o añadir información al seguimiento..."
                   disabled={selectedTicket.status !== 'PENDING' && selectedTicket.status !== 'IN_PROGRESS'}
                   autoResize
                 />
                 <Button 
                   icon="pi pi-plus" 
                   label="Añadir"
                   className="bg-teal-600 border-none rounded-xl flex-shrink-0 hover:bg-teal-700" 
                   disabled={!workerComment.trim() || (selectedTicket.status !== 'PENDING' && selectedTicket.status !== 'IN_PROGRESS')}
                   onClick={sendWorkerComment}
                 />
               </div>
            </div>

          </div>
        )}
      </Dialog>
    </div>
  );
}
