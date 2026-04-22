import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useForm, Controller } from 'react-hook-form';
import api from '@/lib/api';

interface WorkerBankTabProps {
  worker: any;
  onUpdate: () => void;
}

export default function WorkerBankTab({ worker, onUpdate }: WorkerBankTabProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      bankName: worker.bankName || '',
      bankAccountType: worker.bankAccountType || '',
      bankAccountNumber: worker.bankAccountNumber || ''
    }
  });

  const openEdit = () => {
    reset({
      bankName: worker.bankName || '',
      bankAccountType: worker.bankAccountType || '',
      bankAccountNumber: worker.bankAccountNumber || ''
    });
    setShowEditDialog(true);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/workers/${worker.id}`, data);
      setShowEditDialog(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar cuenta bancaria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-lg font-semibold text-gray-800">Cuenta para Depósito de Nómina</h3>
        <Button 
          label={worker.bankAccountNumber ? "Actualizar Cuenta" : "Vincular Cuenta"} 
          icon="pi pi-pencil" 
          onClick={openEdit}
          className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-semibold transition-colors flex items-center gap-2"
          unstyled
          pt={{ root: { className: 'px-4 py-2 rounded-lg flex items-center gap-2' }}}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Entidad Bancaria</div>
          <div className="font-bold text-lg text-slate-800">{worker.bankName || <span className="text-slate-400 italic font-medium">Buscando banco...</span>}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tipo de Cuenta</div>
          <div className="font-bold text-lg text-slate-800">{worker.bankAccountType || <span className="text-slate-400 italic font-medium">No definido</span>}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Número de Cuenta Matriz</div>
          <div className="font-mono text-lg font-bold text-emerald-700 tracking-wider">
            {worker.bankAccountNumber ? worker.bankAccountNumber : <span className="text-slate-400 italic font-sans font-medium">Sin cuenta registrada</span>}
          </div>
        </div>
      </div>

      <Dialog 
        header="Datos Bancarios (Nómina)" 
        visible={showEditDialog} 
        style={{ width: '90vw', maxWidth: '500px' }} 
        onHide={() => setShowEditDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Entidad Bancaria</label>
            <Controller name="bankName" control={control} render={({ field }) => (
              <InputText {...field} placeholder="Ej. Banco Banesco" className={errors.bankName ? 'p-invalid' : ''} />
            )} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Cuenta</label>
            <Controller name="bankAccountType" control={control} render={({ field }) => (
              <Dropdown 
                 {...field} 
                 options={[{label: 'Corriente', value: 'Corriente'}, {label: 'Ahorros', value: 'Ahorros'}, {label: 'Nómina', value: 'Nómina'}, {label: 'Digital', value: 'Digital'}]} 
                 placeholder="Seleccione..." 
              />
            )} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Número de Cuenta</label>
            <Controller name="bankAccountNumber" control={control} render={({ field }) => (
              <InputText {...field} placeholder="0134-..." className={errors.bankAccountNumber ? 'p-invalid font-mono tracking-wider' : 'font-mono tracking-wider'} />
            )} />
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
