"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useForm as useReactHookForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: { id: string, name: string };
  createdAt: string;
}

const schema = yup.object().shape({
  firstName: yup.string().required('El nombre es requerido'),
  lastName: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  roleId: yup.string().required('Debe asignarle un nivel de acceso'),
  password: yup.string()
});

export default function InternalUsersPage() {
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const toast = useRef<Toast>(null);
  
  const { control, handleSubmit, reset, setValue } = useReactHookForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
      password: ''
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles')
      ]);
      setUsersList(usersRes.data);
      setRoles(rolesRes.data.map((r: any) => ({ label: r.name, value: r.id })));
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al sincronizar datos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !currentUser.permissions?.includes('ALL_ACCESS')) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [currentUser]);

  const openNew = () => {
    setEditingUser(null);
    reset();
    setDialogVisible(true);
  };

  const editUser = (user: UserData) => {
    if (user.id === currentUser?.id) {
       toast.current?.show({ severity: 'info', summary: 'Hey', detail: 'Tu perfil lo editas desde Tu Cuenta.' });
       return;
    }
    setEditingUser(user);
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('email', user.email);
    setValue('roleId', user.role.id);
    setDialogVisible(true);
  };

  const deleteUser = async (user: UserData) => {
    if (user.id === currentUser?.id) {
      toast.current?.show({ severity: 'error', summary: 'Imposible', detail: 'No puedes Auto-Eliminarte papu.' });
      return;
    }
    
    if (window.confirm('¿Seguro de revocar el acceso y borrar este usuario? Esta acción es permanente.')) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchData();
        toast.current?.show({ severity: 'success', summary: 'Despedido', detail: 'Acceso revocado correctamente' });
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar' });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingUser) {
        // Solo enviar el password si lo escribieron
        if (!data.password) delete data.password;
        await api.patch(`/users/${editingUser.id}`, data);
      } else {
        await api.post('/users', data);
      }
      setDialogVisible(false);
      fetchData();
      toast.current?.show({ severity: 'success', summary: 'Aprobado', detail: `Usuario ${editingUser ? 'actualizado' : 'invitado'} a Nebula Pay.` });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Operación fallida', detail: error.response?.data?.message || 'Error de procesamiento.' });
    }
  };

  const roleBodyTemplate = (rowData: UserData) => {
    const isDios = rowData.role.name === 'Super Administrador';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${isDios ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
        <i className={`pi ${isDios ? 'pi-star-fill' : 'pi-id-card'} mr-2 text-[10px]`}></i>
        {rowData.role.name}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Toast ref={toast} position="bottom-right" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mi Equipo Empresarial</h1>
            <p className="text-gray-500 text-sm mt-1">Invita a tu equipo de RRHH y Contabilidad y entrégales sus Roles.</p>
          </div>
          <Button label="Invitar Nuevo Empleado" icon="pi pi-user-plus" className="bg-indigo-600 border-none shadow-md hover:bg-indigo-700" onClick={openNew} />
        </div>

      <DataTable value={usersList} loading={loading} className="p-datatable-sm" stripedRows responsiveLayout="scroll">
        <Column field="firstName" header="Nombre" className="font-semibold text-gray-700" />
        <Column field="lastName" header="Apellido" className="font-semibold text-gray-700" />
        <Column field="email" header="Correo Corporativo" className="text-gray-600 text-sm" />
        <Column field="role.name" header="Nivel de Acceso Asignado" body={roleBodyTemplate} />
        <Column body={(rowData) => (
          <div className="flex justify-end gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editUser(rowData)} disabled={rowData.id === currentUser?.id} />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteUser(rowData)} disabled={rowData.id === currentUser?.id} />
          </div>
        )} />
      </DataTable>

      <Dialog visible={dialogVisible} style={{ width: '500px' }} header={editingUser ? 'Actualizar Credenciales' : 'Conceder Nuevo Acceso'} modal className="p-fluid" onHide={() => setDialogVisible(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="font-bold text-gray-700 mb-2 block text-sm">Nombre</label>
              <Controller name="firstName" control={control} render={({ field, fieldState }) => (
                <>
                  <InputText id={field.name} {...field} className={fieldState.invalid ? 'p-invalid' : ''} />
                </>
              )} />
            </div>
            <div className="field">
              <label className="font-bold text-gray-700 mb-2 block text-sm">Apellido</label>
              <Controller name="lastName" control={control} render={({ field, fieldState }) => (
                <>
                  <InputText id={field.name} {...field} className={fieldState.invalid ? 'p-invalid' : ''} />
                </>
              )} />
            </div>
          </div>

          <div className="field">
            <label className="font-bold text-gray-700 mb-2 block text-sm">Correo Electrónico (Login)</label>
            <Controller name="email" control={control} render={({ field, fieldState }) => (
              <>
                <div className="relative w-full">
                  <i className="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <InputText id={field.name} type="email" style={{ paddingLeft: '3rem' }} {...field} className={fieldState.invalid ? 'p-invalid w-full' : 'w-full'} />
                </div>
                {fieldState.error && <small className="p-error block mt-1">{fieldState.error.message}</small>}
              </>
            )} />
          </div>

          <div className="field">
             <label className="font-bold text-gray-700 mb-2 block text-sm">Contraseña Asignada</label>
             <Controller name="password" control={control} render={({ field, fieldState }) => (
               <Password 
                 id={field.name} {...field} toggleMask feedback={false}
                 placeholder={editingUser ? "Dejar en blanco para mantener actual" : "Requerido"}
                 inputClassName={fieldState.invalid ? 'p-invalid w-full' : 'w-full'} className="w-full"
               />
             )} />
          </div>

          <div className="field border-t border-gray-100 pt-4 mt-4">
             <label className="font-bold text-indigo-600 mb-2 block text-sm"><i className="pi pi-key mr-2"></i>Nivel de Seguridad</label>
             <Controller name="roleId" control={control} render={({ field, fieldState }) => (
               <>
                 <Dropdown 
                    id={field.name} value={field.value} onChange={(e) => field.onChange(e.value)} 
                    options={roles} optionLabel="label" 
                    placeholder="Selecciona el alcance de permisos..." 
                    className={`w-full ${fieldState.invalid ? 'p-invalid' : ''} border-indigo-200`} 
                 />
                 {fieldState.error && <small className="p-error block mt-1">{fieldState.error.message}</small>}
               </>
             )} />
          </div>

          <div className="flex justify-end pt-5 gap-2 border-t border-gray-100 mt-2">
            <Button label="Cancelar" icon="pi pi-times" text onClick={() => setDialogVisible(false)} type="button" severity="secondary" />
            <Button label={editingUser ? "Aplicar Cambios" : "Crear y Enviar Acceso"} icon="pi pi-check" className="bg-indigo-600 border-none" type="submit" />
          </div>
        </form>
      </Dialog>
      </div>
    </AppLayout>
  );
}
