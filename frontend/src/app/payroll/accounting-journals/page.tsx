"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Dialog from '@/components/ui/Dialog';
import Dropdown from '@/components/ui/Dropdown';
import { Tag } from 'primereact/tag';
import { useForm, Controller } from 'react-hook-form';
import api from '@/lib/api';

export default function AccountingJournalsPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<any[]>([]);
  const [closedPeriods, setClosedPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { periodId: null }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [journalsRes, periodsRes] = await Promise.all([
        api.get('/accounting-journals'),
        api.get('/payroll-periods')
      ]);
      setJournals(journalsRes.data);
      setClosedPeriods(periodsRes.data.filter((p: any) => p.status === 'CLOSED').map((p: any) => ({ label: p.name, value: p.id })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    reset({ periodId: null });
    setShowDialog(true);
  };

  const onSubmit = async (data: any) => {
    if (!data.periodId) {
      alert('Debe seleccionar un período de nómina.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post(`/accounting-journals/generate/period/${data.periodId}`);
      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error generating journal:', error);
      alert(error.response?.data?.message || 'Error al generar comprobante contable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'warning';
      case 'POSTED': return 'success';
      case 'EXPORTED': return 'info';
      default: return 'warning';
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(val);

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2 justify-end">
        <Button icon="pi pi-eye" rounded outlined severity="info" aria-label="Ver Detalles" title="Ver y Exportar" onClick={() => router.push(`/payroll/accounting-journals/${rowData.id}`)} />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80 flex items-center">
        <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
        <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar asientos..." className="w-full border-gray-200 focus:border-indigo-500 rounded-lg" style={{ paddingLeft: '2.5rem' }} />
      </div>
      <Button label="Generar Asiento" icon="pi pi-plus" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors" onClick={openNew} />
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Integración Contable</h1>
          <p className="mt-2 text-sm text-gray-500">Genera, previsualiza y exporta los comprobantes contables o asientos de diario a partir de nóminas cerradas.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable value={journals} paginator rows={10} loading={loading} globalFilter={globalFilter} header={header} 
            emptyMessage="No hay comprobantes contables registrados."
            className="p-datatable-sm" rowHover>
            <Column field="payrollPeriod.name" header="Nómina de Origen" sortable className="font-semibold text-gray-900" />
            <Column header="Fecha Contable" body={(r) => new Date(r.date).toLocaleDateString('es-VE', {timeZone: 'UTC'})} sortable />
            <Column header="Total Débitos" body={(r) => formatCurrency(r.totalDebit)} />
            <Column header="Total Créditos" body={(r) => formatCurrency(r.totalCredit)} />
            <Column field="status" header="Estado" body={(r) => <Tag value={r.status} severity={getStatusSeverity(r.status)} />} sortable />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '6rem' }} />
          </DataTable>
        </div>

        <Dialog visible={showDialog} style={{ width: '450px' }} header="Generar Asiento Contable" modal className="p-fluid" onHide={() => setShowDialog(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccione Nómina Cerrada</label>
              <Controller name="periodId" control={control} render={({ field }) => (
                <Dropdown id={field.name} value={field.value} options={closedPeriods} onChange={(e) => field.onChange(e.value)} placeholder="Nóminas procesadas..." className={`w-full ${errors.periodId ? 'p-invalid' : ''}`} filter />
              )} />
              {errors.periodId && <small className="text-red-500 mt-1">*{errors.periodId.message as string}</small>}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-4">
               <p className="text-xs text-blue-700">Este proceso consolidará todos los recibos y generará un resumen agrupado por cuenta contable y centro de costo. Si la nómina ya tiene un asiento DRAFT, éste se regenerará.</p>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text text-gray-600 hover:text-gray-900" type="button" />
              <Button label="Generar" icon="pi pi-check" type="submit" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2 rounded-lg font-medium" />
            </div>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
