"use client";

import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import api from '@/lib/api';

export default function AbsencesApprovalPage() {
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null);
  
  const [isJustified, setIsJustified] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const res = await api.get('/worker-absences');
      // Mostramos ordenadas, sugerimos pendientes primero
      const sorted = res.data.sort((a: any, b: any) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setAbsences(sorted);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las solicitudes' });
    } finally {
      setLoading(false);
    }
  };

  const statusTemplate = (rowData: any) => {
    switch (rowData.status) {
      case 'APPROVED': return <Tag severity="success" value="Aprobada" />;
      case 'REJECTED': return <Tag severity="danger" value="Rechazada" />;
      default: return <Tag severity="warning" value="Pendiente" />;
    }
  };

  const openReview = (absence: any) => {
    setSelectedAbsence(absence);
    setIsJustified(absence.isJustified || false);
    setIsPaid(absence.isPaid || false);
    setReviewDialog(true);
  };

  const changeStatus = async (status: string) => {
    if (!selectedAbsence) return;
    try {
      await api.patch(`/worker-absences/${selectedAbsence.id}/status`, {
        status,
        isJustified,
        isPaid
      });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: `Solicitud ${status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}` });
      setReviewDialog(false);
      fetchAbsences();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cambiar estatus' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Toast ref={toast} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bandeja de Permisos</h1>
          <p className="text-slate-500 mt-1 px-1">Audite y apruebe las solicitudes de reposos y ausencias del personal.</p>
        </div>
        <Button icon="pi pi-refresh" outlined onClick={fetchAbsences} />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <DataTable value={absences} loading={loading} paginator rows={10} className="p-datatable-sm" emptyMessage="No hay solicitudes en la bandeja">
          <Column field="worker.primaryIdentityNumber" header="Cédula" className="font-bold text-slate-700" />
          <Column header="Trabajador" body={(r) => `${r.worker?.firstName} ${r.worker?.lastName}`} />
          <Column field="reason" header="Motivo" />
          <Column header="Fechas" body={(r) => `${new Date(r.startDate).toLocaleDateString('es-ES')} - ${new Date(r.endDate).toLocaleDateString('es-ES')}`} />
          <Column header="Estatus" body={statusTemplate} />
          <Column body={(r) => (
             <Button 
                icon="pi pi-search" 
                rounded text severity="info" 
                onClick={() => openReview(r)} 
                disabled={!r.worker} 
             />
          )} />
        </DataTable>
      </div>

      <Dialog header="Revisión de Solicitud" visible={reviewDialog} style={{ width: '450px' }} modal onHide={() => setReviewDialog(false)}>
        {selectedAbsence && (
          <div className="space-y-6 mt-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
               <p className="text-sm text-slate-500 mb-1">Trabajador Solicitante:</p>
               <h4 className="font-bold text-slate-800 text-lg">{selectedAbsence.worker?.firstName} {selectedAbsence.worker?.lastName}</h4>
               <div className="flex gap-4 mt-3">
                 <div>
                    <span className="text-xs text-slate-400 block">Identidad</span>
                    <span className="font-medium">{selectedAbsence.worker?.primaryIdentityNumber}</span>
                 </div>
                 <div>
                    <span className="text-xs text-slate-400 block">Motivo</span>
                    <span className="font-medium">{selectedAbsence.reason}</span>
                 </div>
               </div>
            </div>

            {selectedAbsence.observations && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm italic border border-amber-100">
                "{selectedAbsence.observations}"
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-b border-slate-100 py-4">
               <div className="flex justify-between items-center">
                  <div>
                     <h5 className="font-bold text-slate-700">Falta Justificada</h5>
                     <p className="text-xs text-slate-500">¿El trabajador entregó comprobante?</p>
                  </div>
                  <InputSwitch checked={isJustified} onChange={(e) => setIsJustified(e.value || false)} disabled={selectedAbsence.status !== 'PENDING'} />
               </div>
               
               <div className="flex justify-between items-center">
                  <div>
                     <h5 className="font-bold text-slate-700">Permiso Remunerado</h5>
                     <p className="text-xs text-slate-500">¿Esta ausencia será pagada en nómina?</p>
                  </div>
                  <InputSwitch checked={isPaid} onChange={(e) => setIsPaid(e.value || false)} disabled={selectedAbsence.status !== 'PENDING'} />
               </div>
            </div>

            {selectedAbsence.status === 'PENDING' ? (
              <div className="flex justify-end gap-3 pt-4">
                 <Button label="Rechazar" severity="danger" icon="pi pi-times" outlined onClick={() => changeStatus('REJECTED')} />
                 <Button label="Aprobar Permiso" severity="success" icon="pi pi-check" onClick={() => changeStatus('APPROVED')} />
              </div>
            ) : (
              <div className="bg-slate-100 p-4 rounded text-center">
                 <Tag severity={selectedAbsence.status === 'APPROVED' ? 'success' : 'danger'} value={`Solicitud ${selectedAbsence.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}`} className="mb-2" />
                 <p className="text-xs text-slate-500">Esta solicitud ya fue procesada y clausurada.</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
