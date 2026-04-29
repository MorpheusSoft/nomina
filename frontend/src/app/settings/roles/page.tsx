"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { useForm as useReactHookForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: 'ALL_ACCESS', label: 'Acceso Total (Dios)' },
  { id: 'WORKERS_VIEW', label: 'Ver Trabajadores' },
  { id: 'WORKERS_EDIT', label: 'Editar Trabajadores' },
  { id: 'SALARY_EDIT', label: 'Modificar Salario / Aumentos' },
  { id: 'PAYROLL_VIEW', label: 'Ver Nóminas' },
  { id: 'PAYROLL_EXECUTE', label: 'Ejecutar Nómina' },
  { id: 'PAYROLL_APPROVE', label: 'Aprobar Cierre Nomina' },
  { id: 'CONFIDENTIAL_VIEW', label: 'Ver Datos Confidenciales' },
  { id: 'SETTINGS_MANAGE', label: 'Gestionar Configuraciones' },
  { id: 'USE_ORACLE', label: 'Consultar Oráculo de IA' },
];

const schema = yup.object().shape({
  name: yup.string().required('El nombre del rol es requerido'),
  permissions: yup.array().of(yup.string()).min(1, 'Selecciona al menos un permiso'),
});

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  
  const toast = useRef<Toast>(null);
  
  const { control, handleSubmit, reset, setValue } = useReactHookForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      permissions: [] as string[]
    }
  });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !user.permissions?.includes('ALL_ACCESS')) {
      router.push('/dashboard');
      return;
    }
    fetchRoles();
  }, [user]);

  const openNew = () => {
    setEditingRole(null);
    reset();
    setDialogVisible(true);
  };

  const editRole = (role: Role) => {
    if (role.permissions.includes('ALL_ACCESS') && role.name === 'Super Administrador') {
      toast.current?.show({ severity: 'warn', summary: 'Acceso Denegado', detail: 'El Rol Padre "Super Administrador" es Intocable por seguridad.' });
      return;
    }
    
    setEditingRole(role);
    setValue('name', role.name);
    // @ts-ignore
    setValue('permissions', role.permissions);
    setDialogVisible(true);
  };

  const deleteRole = async (role: Role) => {
    if (role.permissions.includes('ALL_ACCESS') && role.name === 'Super Administrador') {
      toast.current?.show({ severity: 'error', summary: 'Prohibido', detail: 'No puedes borrar el Rol Padre.' });
      return;
    }
    
    if (window.confirm('¿Seguro de borrar este rol? Los usuarios asignados a este rol perderán sus accesos.')) {
      try {
        await api.delete(`/roles/${role.id}`);
        fetchRoles();
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado correctamente' });
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar' });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingRole) {
        await api.patch(`/roles/${editingRole.id}`, data);
      } else {
        await api.post('/roles', data);
      }
      setDialogVisible(false);
      fetchRoles();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: `Rol ${editingRole ? 'actualizado' : 'creado'} correctamente` });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al procesar la solicitud' });
    }
  };

  const permissionsBodyTemplate = (rowData: Role) => {
    if (rowData.permissions.includes('ALL_ACCESS')) {
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200 shadow-sm"><i className="pi pi-shield mr-1"></i>DIOS</span>
    }
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.permissions.map(p => (
          <span key={p} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium border border-indigo-100">{p}</span>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Toast ref={toast} position="bottom-right" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cápsulas de Roles</h1>
            <p className="text-gray-500 text-sm mt-1">Configura las llaves maestras y niveles de acceso de tu equipo.</p>
          </div>
          <Button label="Crear Nuevo Rol" icon="pi pi-plus" className="bg-indigo-600 border-none shadow-md hover:bg-indigo-700" onClick={openNew} />
        </div>

        <DataTable value={roles} loading={loading} className="p-datatable-sm" stripedRows>
          <Column field="name" header="Nombre del Nivel" className="font-bold text-gray-700" />
          <Column header="Llaves Asignadas (Permisos)" body={permissionsBodyTemplate} />
          <Column body={(rowData) => (
            <div className="flex justify-end gap-2">
              <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editRole(rowData)} />
              <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteRole(rowData)} />
            </div>
          )} />
        </DataTable>

        <Dialog visible={dialogVisible} style={{ width: '450px' }} header={editingRole ? 'Editar Rol' : 'Crear Rol'} modal className="p-fluid" onHide={() => setDialogVisible(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            <div className="field">
              <label className="font-bold text-gray-700 mb-2 block">Nombre Visual</label>
              <Controller name="name" control={control} render={({ field, fieldState }) => (
                <>
                  <InputText id={field.name} {...field} className={fieldState.invalid ? 'p-invalid w-full' : 'w-full'} placeholder="Ejem: Analista Senior" />
                  {fieldState.error && <small className="p-error block border-red-500 mt-1">{fieldState.error.message}</small>}
                </>
              )} />
            </div>

            <div className="field">
               <label className="font-bold text-gray-700 mb-3 block">Matriz de Permisos</label>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-60 overflow-y-auto space-y-3 shadow-inner">
                 <Controller name="permissions" control={control} render={({ field, fieldState }) => (
                   <>
                     {AVAILABLE_PERMISSIONS.map(perm => (
                       <div key={perm.id} className="flex items-center">
                         <Checkbox 
                           inputId={perm.id} 
                           name="permissions" 
                           value={perm.id} 
                           onChange={(e) => {
                             let _permissions = [...(field.value || [])];
                             if (e.checked) _permissions.push(e.value);
                             else _permissions = _permissions.filter(p => p !== e.value);
                             field.onChange(_permissions);
                           }} 
                           checked={(field.value || []).includes(perm.id)} 
                         />
                         <label htmlFor={perm.id} className="ml-2 cursor-pointer font-medium text-gray-600 text-sm">{perm.label} <span className="text-gray-400 text-xs ml-1 font-normal">({perm.id})</span></label>
                       </div>
                     ))}
                     {fieldState.error && <small className="p-error block mt-2 font-bold">{fieldState.error.message}</small>}
                   </>
                 )} />
               </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button label="Cancelar" icon="pi pi-times" text onClick={() => setDialogVisible(false)} type="button" />
              <Button label="Guardar Configuración" icon="pi pi-check" className="bg-indigo-600 border-none" type="submit" />
            </div>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
