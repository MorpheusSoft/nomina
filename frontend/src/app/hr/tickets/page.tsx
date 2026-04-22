"use client";

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import api from '@/lib/api';
import AppLayout from "@/components/layout/AppLayout";

export default function HrTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [resolveDialog, setResolveDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [hrNotes, setHrNotes] = useState('');
  
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
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/worker-tickets');
      // Sort: Pendings first
      const sorted = res.data.sort((a: any, b: any) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTickets(sorted);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets' });
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

  const openResolve = (ticket: any) => {
    setSelectedTicket(ticket);
    setHrNotes(ticket.hrNotes || '');
    setResolveDialog(true);
  };

  const changeStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await api.patch(`/worker-tickets/${selectedTicket.id}`, { status });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: `Ticket ${status === 'APPROVED' ? 'Aprobado' : status === 'REJECTED' ? 'Rechazado' : 'Actualizado'}` });
      setResolveDialog(false);
      fetchTickets();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cambiar estatus' });
    }
  };

  const sendComment = async () => {
    if (!hrNotes.trim() || !selectedTicket) return;
    try {
      await api.post(`/worker-tickets/${selectedTicket.id}/comments`, { text: hrNotes });
      toast.current?.show({ severity: 'success', summary: 'Enviado', detail: 'Respuesta registrada correctamente.' });
      
      // Actualizar local
      setSelectedTicket((prev: any) => {
         const meta = prev.jsonMetadata || {};
         const comments = meta.comments || [];
         return { ...prev, jsonMetadata: { ...meta, comments: [...comments, { authorName: 'Tú (Analista)', authorType: 'ADMIN', text: hrNotes, createdAt: new Date().toISOString() }] } };
      });
      setHrNotes('');
      fetchTickets(); // refresca tabla en el fondo
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al enviar comentario' });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Toast ref={toast} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
             <i className="pi pi-inbox text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Taquilla de Requerimientos</h1>
            <p className="text-slate-500 mt-1">Gestione las solicitudes, quejas y permisos emitidos por los trabajadores.</p>
          </div>
        </div>
        <Button icon="pi pi-refresh" outlined onClick={fetchTickets} />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <DataTable value={tickets} loading={loading} paginator rows={15} className="p-datatable-sm" emptyMessage="La taquilla está vacía" stripedRows>
          <Column field="worker.primaryIdentityNumber" header="Cédula" className="font-bold text-slate-700" />
          <Column header="Trabajador" body={(r) => `${r.worker?.firstName} ${r.worker?.lastName}`} />
          <Column header="Categoría" body={typeTemplate} />
          <Column field="title" header="Asunto" />
          <Column header="Fecha" body={(r) => new Date(r.createdAt).toLocaleDateString('es-ES')} />
          <Column header="Estatus" body={statusTemplate} />
          <Column body={(r) => (
             <Button 
                icon="pi pi-eye" 
                rounded text severity="info" 
                onClick={() => openResolve(r)} 
             />
          )} />
        </DataTable>
      </div>

      <Dialog header="Resolución de Ticket" visible={resolveDialog} style={{ width: '800px' }} modal onHide={() => setResolveDialog(false)}>
        {selectedTicket && (
          <div className="space-y-6 mt-4">
            {/* Header Trabajador */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                 <Tag severity="info" value={TICKET_TYPES.find(t => t.value === selectedTicket.type)?.label || selectedTicket.type} />
                 {statusTemplate(selectedTicket)}
               </div>
               <h4 className="font-bold text-slate-800 text-lg mb-1">{selectedTicket.title}</h4>
               <p className="text-sm text-slate-600"><strong>Trabajador:</strong> {selectedTicket.worker?.firstName} {selectedTicket.worker?.lastName} ({selectedTicket.worker?.primaryIdentityNumber})</p>
               <p className="text-sm text-slate-600"><strong>Fecha de emisión:</strong> {new Date(selectedTicket.createdAt).toLocaleString('es-ES')}</p>
            </div>

            {/* Metadatos (Ej: Fechas de vacaciones o permisos) */}
            {selectedTicket.jsonMetadata?.startDate && selectedTicket.jsonMetadata?.endDate && (
              <div className="flex gap-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 text-sm">
                 <div>
                   <span className="font-bold opacity-70 block text-xs">Desde</span>
                   <span>{new Date(selectedTicket.jsonMetadata.startDate).toLocaleDateString('es-ES')}</span>
                 </div>
                 <div>
                   <span className="font-bold opacity-70 block text-xs">Hasta</span>
                   <span>{new Date(selectedTicket.jsonMetadata.endDate).toLocaleDateString('es-ES')}</span>
                 </div>
              </div>
            )}

            {/* Descripción */}
            <div>
               <h5 className="font-bold text-slate-700 mb-2">Mensaje del Trabajador</h5>
               <div className="bg-white p-4 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap text-sm">
                  {selectedTicket.description}
               </div>
            </div>

            {/* Archivos Adjuntos */}
            {selectedTicket.jsonMetadata?.attachments && selectedTicket.jsonMetadata.attachments.length > 0 && (
              <div>
                 <h5 className="font-bold text-slate-700 mb-2">Archivos Adjuntos ({selectedTicket.jsonMetadata.attachments.length})</h5>
                 <div className="flex flex-wrap gap-3">
                    {selectedTicket.jsonMetadata.attachments.map((url: string, index: number) => {
                        const isPdf = url.endsWith('.pdf');
                        const serverUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1').replace('/api/v1', '');
                        const finalUrl = `${serverUrl}${url}`;
                        return (
                          <a key={index} href={finalUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center justify-center w-20 h-20 bg-slate-100 border border-slate-300 rounded-lg hover:border-teal-500 transition-colors overflow-hidden">
                             {isPdf ? (
                               <i className="pi pi-file-pdf text-red-500 text-3xl"></i>
                             ) : (
                               <img src={finalUrl} alt={`Soporte ${index + 1}`} className="object-cover w-full h-full" />
                             )}
                          </a>
                        )
                    })}
                 </div>
              </div>
            )}

            {/* Bitácora de Gestión */}
            <div className="border-t border-slate-200 pt-5 mt-4">
               <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><i className="pi pi-list text-indigo-500"></i> Bitácora de Seguimiento</h5>
               
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-64 overflow-y-auto mb-4">
                  {(!selectedTicket.jsonMetadata?.comments || selectedTicket.jsonMetadata.comments.length === 0) && (
                     <div className="text-center text-slate-400 text-sm mt-8">El registro de gestión está vacío. Comience el seguimiento de este requerimiento.</div>
                  )}
                  {selectedTicket.jsonMetadata?.comments?.length > 0 && (
                     <div className="relative border-l-2 border-indigo-100 ml-2 space-y-5">
                       {selectedTicket.jsonMetadata.comments.map((comment: any, idx: number) => {
                           const isAdmin = comment.authorType === 'ADMIN';
                           return (
                             <div key={idx} className="relative pl-6">
                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-teal-500'}`}></div>
                                <div className="text-[11px] font-bold text-slate-500 mb-1">
                                  <span className={isAdmin ? 'text-indigo-600' : 'text-teal-600'}>{isAdmin ? 'Gestión de RRHH' : 'Observación del Empleado'}</span> • {comment.authorName} • {new Date(comment.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
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
                   value={hrNotes} 
                   onChange={(e) => setHrNotes(e.target.value)} 
                   rows={2} 
                   className="w-full text-sm rounded-xl resize-none" 
                   placeholder="Añadir una nota o registro a la bitácora..."
                   disabled={selectedTicket.status !== 'PENDING' && selectedTicket.status !== 'IN_PROGRESS'}
                   autoResize
                 />
                 <Button 
                   icon="pi pi-verified" 
                   label="Registrar"
                   className="bg-indigo-600 border-none rounded-xl flex-shrink-0" 
                   disabled={!hrNotes.trim() || (selectedTicket.status !== 'PENDING' && selectedTicket.status !== 'IN_PROGRESS')}
                   onClick={sendComment}
                 />
               </div>
            </div>

            {/* Botonera de Acción */}
            {(selectedTicket.status === 'PENDING' || selectedTicket.status === 'IN_PROGRESS') ? (
              <div className="flex justify-end gap-3 pt-2">
                 <Button label="Rechazar" severity="danger" outlined icon="pi pi-times" onClick={() => changeStatus('REJECTED')} />
                 <Button label="Dejar En Proceso" severity="secondary" outlined onClick={() => changeStatus('IN_PROGRESS')} />
                 <Button label="Aprobar Ticket" severity="success" icon="pi pi-check" onClick={() => changeStatus('APPROVED')} />
              </div>
            ) : (
              <div className="bg-slate-100 p-3 rounded-lg text-center text-sm text-slate-600">
                 Este ticket ya se encuentra clausurado.
              </div>
            )}
            
          </div>
        )}
      </Dialog>
    </div>
    </AppLayout>
  );
}
