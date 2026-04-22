"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import api from '@/lib/api';

export default function AccountingJournalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await api.get(`/accounting-journals/${params.id}`);
        setJournal(res.data);
      } catch (error) {
        console.error('Error fetching journal details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchJournal();
    }
  }, [params.id]);

  const handleExportCsv = async () => {
    try {
      const response = await api.get(`/accounting-journals/${params.id}/export-csv`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `asiento-${params.id}.csv`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) link.parentNode.removeChild(link);
    } catch (err) {
      alert("Ocurrió un error al descargar el archivo CSV");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(val);

  if (loading) {
    return <AppLayout><div className="p-6">Cargando...</div></AppLayout>;
  }

  if (!journal) {
    return <AppLayout><div className="p-6">Asiento no encontrado.</div></AppLayout>;
  }

  const isBalanced = Math.abs(parseFloat(journal.totalDebit) - parseFloat(journal.totalCredit)) < 0.01;

  return (
    <AppLayout>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <Button icon="pi pi-arrow-left" label="Volver" className="p-button-text p-button-secondary pl-0 mb-2" onClick={() => router.push('/payroll/accounting-journals')} />
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Detalle del Asiento Contable</h1>
          </div>
          <div className="flex gap-2">
            <Button label="Exportar a CSV" icon="pi pi-file-excel" severity="success" onClick={handleExportCsv} />
            <Button label="Imprimir" icon="pi pi-print" severity="secondary" onClick={() => window.print()} />
          </div>
        </div>

        <div className="print-section bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Comprobante de Diario</h2>
              <p className="text-gray-500 mt-1">Origen: {journal.payrollPeriod?.name}</p>
              <p className="text-gray-500 mt-1 text-sm">Fecha Contable: {new Date(journal.date).toLocaleDateString('es-VE', {timeZone: 'UTC'})}</p>
            </div>
            <div className="text-right">
              <Tag value={journal.status} severity={journal.status === 'POSTED' ? 'success' : 'warning'} className="text-lg px-3 py-1 mb-2 no-print" />
              <p className="text-gray-500 text-sm">ID Sistema: {journal.id.substring(0,8)}</p>
              <p className="text-gray-500 text-sm">Creado: {new Date(journal.createdAt).toLocaleString('es-VE')}</p>
            </div>
          </div>

          {!isBalanced && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 no-print">
              <i className="pi pi-exclamation-triangle mr-2"></i>
              <strong>Aviso:</strong> El asiento contable está descuadrado. Revise las cuentas y los conceptos.
            </div>
          )}

          <div className="overflow-hidden">
            <DataTable value={journal.lines} emptyMessage="No hay líneas en este comprobante" className="p-datatable-sm">
              <Column field="accountingCode" header="Cuenta Contable" className="font-mono text-sm" />
              <Column field="costCenterCode" header="Centro de Costo" body={(r) => r.costCenterCode || '-'} />
              <Column field="description" header="Descripción" />
              <Column header="Débito" body={(r) => <span className="font-medium text-gray-800">{formatCurrency(r.debitAmount)}</span>} />
              <Column header="Crédito" body={(r) => <span className="font-medium text-gray-800">{formatCurrency(r.creditAmount)}</span>} />
            </DataTable>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-4 flex justify-between px-10">
            <div className="font-bold text-gray-700 text-lg uppercase">Totales</div>
            <div className="flex gap-16 font-mono text-lg font-bold">
              <div className="text-indigo-900 border-b-2 border-indigo-200">
                {formatCurrency(journal.totalDebit)}
              </div>
              <div className="text-indigo-900 border-b-2 border-indigo-200">
                {formatCurrency(journal.totalCredit)}
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 flex justify-around no-print opacity-0 print:opacity-100 print:flex">
             <div className="text-center">
               <div className="w-48 border-t border-gray-400 mb-2"></div>
               <p className="text-gray-600 font-bold">Elaborado por (RRHH)</p>
             </div>
             <div className="text-center">
               <div className="w-48 border-t border-gray-400 mb-2"></div>
               <p className="text-gray-600 font-bold">Revisado y Aprobado por (Contabilidad)</p>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
