"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import api from '@/lib/api';

export default function ConsultantsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Cargar Usuarios del Root Node (excluyendo al dueño supremo)
      const resUsers = await api.get('/users');
      const rootUsers = resUsers.data.filter((u: any) => u.email !== 'admin@nebulapayrolls.com');
      setUsers(rootUsers);

      // 2. Cargar lista de Empresas (Tenants)
      const resTenants = await api.get('/tenants');
      setTenants(resTenants.data);
    } catch (err) {
      console.error('Error cargando data', err);
    }
  };

  const openAssignModal = (user: any) => {
    setSelectedUser(user);
    setSelectedTenant(null);
    setSuccess('');
    setError('');
    setIsDialogVisible(true);
  };

  const handleAssign = async () => {
    if (!selectedTenant) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/tenants/${selectedTenant.id}/consultants/assign`, {
        consultantUserId: selectedUser.id
      });
      setSuccess(`Consultor asignado con éxito al cliente.`);
      setTimeout(() => {
        setIsDialogVisible(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar.');
    } finally {
      setIsLoading(false);
    }
  };

  const tenantTemplate = (option: any) => {
    return (
      <div className="flex items-center">
        <div>
          <div className="font-bold">{option.name}</div>
          <div className="text-xs text-gray-500">RIF: {option.taxId}</div>
        </div>
      </div>
    );
  };

  const assignedTenantsTemplate = (rowData: any) => {
    if (!rowData.tenantAccesses || rowData.tenantAccesses.length === 0) {
      return <span className="text-gray-400 text-xs italic">Ninguna vinculada</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.tenantAccesses.map((acc: any, i: number) => (
          <Tag key={i} severity="success" value={acc.tenant.name} className="text-[10px]" />
        ))}
      </div>
    );
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <Button 
        icon="pi pi-link" 
        rounded 
        text 
        severity="success" 
        tooltip="Vincular a Cliente"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openAssignModal(rowData)}
      />
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <i className="pi pi-briefcase text-emerald-500 text-3xl"></i>
            Gestión de Consultores Especialistas
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Delega permisos a tu equipo para asistir a empresas cliente.</p>
        </div>
      </div>

      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm font-medium border border-yellow-200 flex items-start mb-6">
          <i className="pi pi-info-circle mt-0.5 mr-3 text-lg"></i>
          <div>
            <strong>¿Cómo crear nuevos consultores?</strong><br />
            Para crear un nuevo empleado que asista a tus clientes, ve al panel principal de tu sistema (`Ir a App Clientes`), navega a <span className="font-mono bg-yellow-100 px-1 rounded">Configuración {'>'} Mi Equipo</span> y crea el usuario allí. Una vez creado, aparecerá en esta lista automáticamente para que puedas vincularlo.
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable 
          value={users} 
          paginator 
          rows={10} 
          dataKey="id" 
          emptyMessage="No tienes consultores registrados en la Sede Central."
          className="p-datatable-sm"
          rowHover
        >
          <Column field="firstName" header="Nombre" className="font-bold text-gray-800" sortable />
          <Column field="lastName" header="Apellido" className="text-gray-800" sortable />
          <Column field="email" header="Correo Electrónico" className="text-gray-600 font-mono text-sm" />
          <Column body={assignedTenantsTemplate} header="Clientes Vinculados" />
          <Column body={actionBodyTemplate} exportable={false} style={{ width: '5rem' }} />
        </DataTable>
      </div>

      <Dialog 
        header="Asignar Cartera de Cliente" 
        visible={isDialogVisible} 
        style={{ width: '30vw' }} 
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        onHide={() => !isLoading && setIsDialogVisible(false)}
        className="p-fluid rounded-2xl"
      >
        <div className="pt-2 space-y-4">
          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg"><i className="pi pi-exclamation-triangle mr-2"></i>{error}</div>}
          {success && <div className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded-lg"><i className="pi pi-check-circle mr-2"></i>{success}</div>}

          {selectedUser && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
              <p className="text-sm text-slate-500 mb-1">Consultor Seleccionado:</p>
              <p className="font-bold text-slate-800 text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Selecciona la Empresa Destino</label>
            <Dropdown 
              value={selectedTenant} 
              onChange={(e) => setSelectedTenant(e.value)} 
              options={tenants} 
              optionLabel="name" 
              placeholder="Buscar Empresa Cliente..." 
              filter 
              itemTemplate={tenantTemplate}
              className="w-full rounded-xl border-gray-200" 
            />
            <small className="text-gray-500 block mt-2">
              Al asignar, este consultor recibirá un rol interno y protegido ("Consultor de Soporte") en la base de datos del cliente, dándole la capacidad de ayudar con configuraciones.
            </small>
          </div>

          <Button 
            onClick={handleAssign}
            label={isLoading ? "Vinculando..." : "Otorgar Permisos de Soporte"} 
            icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-link"} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 mt-4 rounded-xl border-none shadow-lg" 
            disabled={isLoading || !selectedTenant}
          />
        </div>
      </Dialog>
    </div>
  );
}
