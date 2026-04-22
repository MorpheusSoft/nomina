"use client";

import { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Worker {
  id: string;
  primaryIdentityNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function WorkersPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error("Error loading workers", error);
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value as any;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 m-0">Nómina Base</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto flex items-center">
            <i className="pi pi-search absolute left-3 text-gray-400 z-10" />
            <InputText 
              value={globalFilterValue} 
              onChange={onGlobalFilterChange} 
              placeholder="Buscar trabajador..." 
              className="w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <Button 
            label="Nuevo Trabajador" 
            icon="pi pi-user-plus" 
            onClick={() => router.push('/workers/new')} 
            className="w-full md:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white px-5 py-2 font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
          />
        </div>
      </div>
    );
  };

  const dateBodyTemplate = (rowData: Worker) => {
    if (!rowData.birthDate) return '-';
    // Se aísla la fecha estricta para evitar desfase de zona horaria
    return new Date(rowData.birthDate.split('T')[0] + 'T00:00:00').toLocaleDateString('es-ES');
  };

  const actionBodyTemplate = (rowData: Worker) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-user-edit" rounded text severity="info" aria-label="Edit Profile" tooltip="Ver Perfil & Carga Familiar" tooltipOptions={{ position: 'top' }} onClick={() => router.push(`/workers/${rowData.id}`)} />
      </div>
    );
  };

  const activeBodyTemplate = (rowData: any) => {
    const state = rowData.computedState || 'Activo';
    
    if (state === 'Activo') return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold"><i className="pi pi-check-circle mr-1" style={{fontSize: '0.7rem'}}></i>Activo</span>;
    if (state === 'Vacaciones') return <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full font-bold"><i className="pi pi-sun mr-1" style={{fontSize: '0.7rem'}}></i>Vacaciones</span>;
    if (state === 'Suspendido') return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold"><i className="pi pi-exclamation-triangle mr-1" style={{fontSize: '0.7rem'}}></i>Suspendido</span>;
    
    return <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold"><i className="pi pi-minus-circle mr-1" style={{fontSize: '0.7rem'}}></i>Inactivo</span>;
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <DataTable 
            value={workers} 
            paginator 
            rows={10} 
            loading={loading} 
            dataKey="id" 
            filters={filters}
            globalFilterFields={['firstName', 'lastName', 'primaryIdentityNumber']}
            header={renderHeader()}
            emptyMessage="No se encontraron trabajadores en esta empresa."
            showGridlines={false}
            stripedRows
            className="p-datatable-sm"
          >
            <Column field="primaryIdentityNumber" header="Identidad" style={{ minWidth: '10rem' }}></Column>
            <Column field="firstName" header="Nombres" sortable style={{ minWidth: '12rem' }}></Column>
            <Column field="lastName" header="Apellidos" sortable style={{ minWidth: '12rem' }}></Column>
            <Column field="birthDate" header="Nacimiento" body={dateBodyTemplate} style={{ minWidth: '10rem' }}></Column>
            <Column header="Estado" body={activeBodyTemplate}></Column>
            <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '10rem' }}></Column>
          </DataTable>
        </div>
      </div>
    </AppLayout>
  );
}
