import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { useForm, Controller } from 'react-hook-form';
import api from '@/lib/api';

interface WorkerBankTabProps {
  worker: any;
  onUpdate: () => void;
}

export default function WorkerBankTab({ worker, onUpdate }: WorkerBankTabProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get('/banks');
        setBanks(res.data);
      } catch (error) {
        console.error('Error fetching banks', error);
      }
    };
    fetchBanks();
  }, []);

  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      bankId: '',
      accountType: 'Corriente',
      accountNumber: '',
      isPrimary: false
    }
  });

  const openNew = () => {
    setEditingId(null);
    reset({
      bankId: '',
      accountType: 'Corriente',
      accountNumber: '',
      isPrimary: worker.bankAccounts?.length === 0
    });
    setShowEditDialog(true);
  };

  const openEdit = (account: any) => {
    setEditingId(account.id);
    reset({
      bankId: account.bankId,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      isPrimary: account.isPrimary
    });
    setShowEditDialog(true);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.patch(`/workers/${worker.id}/bank-accounts/${editingId}`, data);
      } else {
        await api.post(`/workers/${worker.id}/bank-accounts`, data);
      }
      setShowEditDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al guardar cuenta bancaria: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta cuenta?')) return;
    try {
      await api.delete(`/workers/${worker.id}/bank-accounts/${accountId}`);
      onUpdate();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al eliminar la cuenta: ${msg}`);
    }
  };

  const setPrimary = async (account: any) => {
    if (account.isPrimary) return;
    try {
      await api.patch(`/workers/${worker.id}/bank-accounts/${account.id}`, {
        ...account,
        isPrimary: true
      });
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const actionTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2">
        {!rowData.isPrimary && (
          <Button icon="pi pi-star" rounded text severity="warning" aria-label="Hacer Principal" onClick={() => setPrimary(rowData)} tooltip="Marcar como Principal" tooltipOptions={{ position: 'top' }} />
        )}
        <Button icon="pi pi-pencil" rounded text severity="info" aria-label="Editar" onClick={() => openEdit(rowData)} />
        <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Eliminar" onClick={() => deleteAccount(rowData.id)} />
      </div>
    );
  };

  const primaryTemplate = (rowData: any) => {
    return rowData.isPrimary ? <Tag severity="success" value="Principal" icon="pi pi-check" /> : null;
  };

  return (
    <div className="p-6 h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-lg font-semibold text-gray-800">Cuentas para Depósito de Nómina</h3>
        <Button 
          label="Añadir Cuenta" 
          icon="pi pi-plus" 
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-semibold transition-colors flex items-center gap-2"
          unstyled
          pt={{ root: { className: 'px-4 py-2 rounded-lg flex items-center gap-2' }}}
        />
      </div>

      {!worker.bankAccounts || worker.bankAccounts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <i className="pi pi-wallet text-4xl text-slate-300 mb-3"></i>
          <p className="text-slate-500 font-medium">No hay cuentas bancarias registradas para este trabajador.</p>
          <p className="text-sm text-slate-400 mt-1">Presiona "Añadir Cuenta" para vincular una.</p>
          
          {/* Legacy Fallback UI if data hasn't been migrated yet */}
          {worker.bankAccountNumber && (
            <div className="mt-6 p-4 bg-orange-50 text-orange-800 rounded-lg max-w-md mx-auto text-left text-sm border border-orange-100">
              <i className="pi pi-info-circle mr-2"></i>
              <strong>Dato heredado detectado:</strong> Se encontró el número <code>{worker.bankAccountNumber}</code> ({worker.bankName}) guardado en la ficha antigua. Por favor añádelo como una nueva cuenta usando el botón superior para migrarlo.
            </div>
          )}
        </div>
      ) : (
        <DataTable value={worker.bankAccounts} className="p-datatable-sm" emptyMessage="No hay cuentas registradas" showGridlines={false} stripedRows>
          <Column field="bank.name" header="Entidad Bancaria" body={(r) => <span className="font-semibold text-slate-800">{r.bank?.name || 'Desconocido'}</span>}></Column>
          <Column field="accountType" header="Tipo"></Column>
          <Column field="accountNumber" header="Número de Cuenta" body={(r) => <span className="font-mono tracking-wider">{r.accountNumber}</span>}></Column>
          <Column header="Estado" body={primaryTemplate} align="center"></Column>
          <Column body={actionTemplate} align="right" style={{ width: '150px' }}></Column>
        </DataTable>
      )}

      <Dialog 
        header={editingId ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"} 
        visible={showEditDialog} 
        style={{ width: '90vw', maxWidth: '500px' }} 
        onHide={() => setShowEditDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Entidad Bancaria</label>
            <Controller name="bankId" control={control} rules={{ required: true }} render={({ field }) => (
              <Dropdown 
                {...field} 
                options={banks.map(b => ({ label: b.name, value: b.id }))} 
                placeholder="Seleccione un Banco" 
                filter
                className={errors.bankId ? 'p-invalid w-full' : 'w-full'} 
              />
            )} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Cuenta</label>
            <Controller name="accountType" control={control} rules={{ required: true }} render={({ field }) => (
              <Dropdown 
                 {...field} 
                 options={[{label: 'Corriente', value: 'Corriente'}, {label: 'Ahorros', value: 'Ahorros'}, {label: 'Nómina', value: 'Nómina'}, {label: 'Digital', value: 'Digital'}]} 
                 placeholder="Seleccione..." 
                 className="w-full"
              />
            )} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Número de Cuenta</label>
            <Controller name="accountNumber" control={control} rules={{ required: true }} render={({ field }) => (
              <InputText {...field} placeholder="0134-..." className={errors.accountNumber ? 'p-invalid font-mono tracking-wider w-full' : 'font-mono tracking-wider w-full'} />
            )} />
          </div>

          <div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Controller name="isPrimary" control={control} render={({ field }) => (
              <InputSwitch checked={field.value} onChange={(e) => field.onChange(e.value)} />
            )} />
            <div>
              <div className="text-sm font-semibold text-slate-800">Cuenta Principal (Nómina)</div>
              <div className="text-xs text-slate-500">Usar esta cuenta para los pagos automáticos de nómina y utilidades.</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" severity="secondary" outlined onClick={() => setShowEditDialog(false)} disabled={isSubmitting} />
            <Button type="submit" label={isSubmitting ? "Guardando..." : "Guardar Cuenta"} className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-semibold" disabled={isSubmitting} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
