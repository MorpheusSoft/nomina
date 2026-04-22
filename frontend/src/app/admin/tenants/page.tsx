"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { Calendar } from 'primereact/calendar';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Tag } from 'primereact/tag';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  
  // Create Form State
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    hasWorkerPortalAccess: false,
    hasOracleAccess: false,
    logoUrl: '',
    logoFile: null as File | null,
    contactPhone: '',
    serviceEndDate: null as Date | null
  });
  
  // Edit Form State
  const [editData, setEditData] = useState<any>({ 
    id: '', maxActiveWorkers: 0, isActive: true, user: null,
    hasWorkerPortalAccess: false, hasOracleAccess: false, logoUrl: '', logoFile: null as File | null, contactPhone: '', serviceEndDate: null as Date | null
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (user?.email === 'admin@nebulapayrolls.com' && token) {
      loadTenants(token);
    }
  }, [user]);

  const loadTenants = async (token: string) => {
    try {
      const res = await api.get('/tenants');
      setTenants(res.data);
    } catch (error) {
      console.error("Error cargando tenants", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const authRes = await api.post('/auth/register', formData);
      const newTenantId = authRes.data?.user?.tenantId;

      if (formData.logoFile && newTenantId) {
        const fileData = new FormData();
        fileData.append('file', formData.logoFile);
        await api.post(`/tenants/${newTenantId}/logo`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(`¡Empresa ${formData.companyName} creada con éxito!`);
      setFormData({ companyName: '', taxId: '', firstName: '', lastName: '', email: '', password: '', hasWorkerPortalAccess: false, hasOracleAccess: false, logoUrl: '', logoFile: null, contactPhone: '', serviceEndDate: null });
      setIsDialogVisible(false);
      if (token) loadTenants(token); // Reload table

    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión. Revisa los datos ingresados.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (tenant: any) => {
    // Buscar primero si en el equipo hay un Super Admin o Dueño para exhibirlo como la cabeza de la cuenta. 
    // Si no, recaer en el primer usuario registrado.
    const adminUser = tenant.users?.find((u: any) => u.role?.name === 'Super Administrador' || u.role?.name?.includes('Dueño')) || (tenant.users && tenant.users.length > 0 ? tenant.users[0] : null);

    setEditData({
      id: tenant.id,
      maxActiveWorkers: tenant.maxActiveWorkers,
      isActive: tenant.isActive,
      hasWorkerPortalAccess: tenant.hasWorkerPortalAccess ?? false,
      hasOracleAccess: tenant.hasOracleAccess ?? false,
      oraclePrompt: tenant.oraclePrompt || "Asume el rol de un Consultor Experto en Nómina Venezolana e IA de Nebula.\nPara comunicarte con el usuario, escribe en un Español Corporativo y Pragmático, usando terminología de leyes venezolanas (LOTT, IVSS, FAOV, ISLR) pero yendo directamente al grano de la solución y omitiendo teoría extensa.",
      logoUrl: tenant.logoUrl || '',
      logoFile: null,
      contactPhone: tenant.contactPhone || '',
      serviceEndDate: tenant.serviceEndDate ? new Date(tenant.serviceEndDate) : null,
      user: adminUser
    });
    setError('');
    setSuccess('');
    setIsEditDialogVisible(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const { logoFile, user, ...restPayload } = editData;
      const payload = {
        ...restPayload,
        maxActiveWorkers: Number(restPayload.maxActiveWorkers)
      };
      await api.patch(`/tenants/${editData.id}`, payload);
      
      if (editData.logoFile) {
        const fileData = new FormData();
        fileData.append('file', editData.logoFile);
        await api.post(`/tenants/${editData.id}/logo`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(`Registros actualizados con éxito.`);
      setIsEditDialogVisible(false);
      if (token) loadTenants(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setIsLoading(false);
    }
  };

  const workersBodyTemplate = (rowData: any) => {
    const active = rowData._count?.workers || 0;
    const max = rowData.maxActiveWorkers;
    const pct = (active / max) * 100;
    
    let severity = 'success';
    if (pct > 80) severity = 'warning';
    if (pct > 95) severity = 'danger';

    return (
      <div className="flex items-center gap-2">
        <span className="font-bold">{active}</span>
        <span className="text-gray-400 text-sm">/ {max}</span>
        {pct >= 100 && <Tag severity="danger" value="LÍMITE ALCANZADO" className="text-[10px]" />}
      </div>
    );
  };

  const statusBodyTemplate = (rowData: any) => {
    return <Tag severity={rowData.isActive ? 'success' : 'danger'} value={rowData.isActive ? 'ACTIVO' : 'SUSPENDIDO'} />;
  };

  const portalStatusBodyTemplate = (rowData: any) => {
    if (rowData.hasWorkerPortalAccess) {
      return <Tag severity="info" value="PORTAL ACTIVO" icon="pi pi-desktop" />;
    }
    return <Tag severity="warning" value="BÁSICO" />;
  };

  const expirationBodyTemplate = (rowData: any) => {
    if (!rowData.serviceEndDate) return <span className="text-gray-400 font-medium whitespace-nowrap"><i className="pi pi-infinity mr-2 text-xs"></i>Ilimitado</span>;
    // Agregamos un ajuste de tiempo (12 horas al medio día) para obviar cualquier diferencia por Timezones locales e internacionales.
    const rawDate = new Date(rowData.serviceEndDate);
    const date = new Date(rawDate.getTime() + (new Date().getTimezoneOffset() * 60000) + (12 * 3600000));
    const isExpired = date.getTime() < Date.now();
    return (
      <Tag 
        severity={isExpired ? 'danger' : 'success'} 
        value={date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} 
        icon={isExpired ? 'pi pi-ban' : 'pi pi-calendar'}
      />
    );
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <Button 
        icon="pi pi-pencil" 
        rounded 
        text 
        severity="info" 
        aria-label="Editar" 
        onClick={() => openEditDialog(rowData)}
        tooltip="Ajustar Licencias"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  if (user?.email !== 'admin@nebulapayrolls.com') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Acceso Denegado. Esta consola es exclusiva del Dueño de la Plataforma.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <i className="pi pi-globe text-emerald-500 text-3xl"></i>
              Portal Multi-Empresa (SaaS)
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Control global de inquilinos y gestión de suscripciones</p>
          </div>
          <Button 
            label="Nuevo Cliente" 
            icon="pi pi-plus" 
            className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold shadow-md px-6 py-3 rounded-xl"
            onClick={() => setIsDialogVisible(true)}
          />
        </div>

        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-200 flex items-center">
             <i className="pi pi-check-circle mr-3 text-xl"></i>
             <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable 
            value={tenants} 
            paginator 
            rows={10} 
            dataKey="id" 
            emptyMessage="No se encontraron empresas registradas."
            className="p-datatable-sm"
            rowHover
          >
            <Column field="name" header="Empresa (Razón Social)" className="font-bold text-gray-800" />
            <Column field="taxId" header="RIF" className="text-gray-600 font-mono text-sm" />
            <Column header="Plan" body={portalStatusBodyTemplate} />
            <Column header="Vencimiento" body={expirationBodyTemplate} />
            <Column header="Trabajadores Activos (Licencias)" body={workersBodyTemplate} />
            <Column header="Estado" body={statusBodyTemplate} />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '5rem' }} />
          </DataTable>
        </div>

        {/* Modal para Crear Empresa */}
        <Dialog 
          header="Alta de Nuevo Cliente" 
          visible={isDialogVisible} 
          style={{ width: '50vw' }} 
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
          onHide={() => setIsDialogVisible(false)}
          className="p-fluid rounded-3xl overflow-hidden"
          headerClassName="bg-slate-900 text-white p-6"
        >
          <div className="p-4 mt-2">
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start">
                 <i className="pi pi-exclamation-circle mt-0.5 mr-2"></i>
                 <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">1. Entidad Corporativa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Razón Social</label>
                    <InputText 
                      name="companyName" value={formData.companyName} onChange={handleChange} 
                      className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" 
                      placeholder="Ej. Pegaso Corporation C.A." required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">RIF / Identificador Fiscal</label>
                    <InputText 
                      name="taxId" value={formData.taxId} onChange={handleChange} 
                      className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" 
                      placeholder="J-12345678-9" required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">2. Administrador Principal (SuperAdmin)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                    <InputText 
                      name="firstName" value={formData.firstName} onChange={handleChange} 
                      className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500" placeholder="Neo" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Apellido</label>
                    <InputText 
                      name="lastName" value={formData.lastName} onChange={handleChange} 
                      className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500" placeholder="Anderson" required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                    <div className="relative w-full">
                      <i className="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                      <InputText 
                        type="email" name="email" value={formData.email} onChange={handleChange} 
                        className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500" 
                        style={{ paddingLeft: '3rem' }} placeholder="admin@empresa.com" required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña Segura</label>
                    <Password 
                      name="password" value={formData.password} onChange={handleChange} 
                      feedback={true} toggleMask minLength={6}
                      inputClassName="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500" 
                      className="w-full" placeholder="••••••••" required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">3. Configuración Comercial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono de Contacto</label>
                    <InputText 
                      name="contactPhone" value={formData.contactPhone} onChange={handleChange} 
                      className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500" 
                      placeholder="+58 412 0000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Logo (Opc. - máx 2MB JPG/PNG)</label>
                    <input 
                      type="file" accept="image/png, image/jpeg"
                      onChange={(e) => setFormData({...formData, logoFile: e.target.files?.[0] || null})} 
                      className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-emerald-500 bg-white" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Vencimiento</label>
                    <Calendar 
                      value={formData.serviceEndDate} 
                      onChange={(e: any) => setFormData({...formData, serviceEndDate: e.value})} 
                      className="w-full rounded-xl border-gray-200 focus:border-emerald-500" 
                      dateFormat="dd/mm/yy" placeholder="Sin expiración" showIcon 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 text-emerald-600 rounded cursor-pointer" 
                       checked={formData.hasWorkerPortalAccess} 
                       onChange={(e) => setFormData({...formData, hasWorkerPortalAccess: e.target.checked})} 
                     />
                     Habilitar Portal de Autogestión (Planes Premium)
                  </label>
                  <small className="text-gray-500 block mb-4">Si está activo, los empleados podrán ver sus recibos en línea.</small>

                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 text-indigo-600 rounded cursor-pointer" 
                       checked={formData.hasOracleAccess} 
                       onChange={(e) => setFormData({...formData, hasOracleAccess: e.target.checked})} 
                     />
                     Habilitar Oráculo IA (Copiloto de Conceptos)
                  </label>
                  <small className="text-gray-500 block">Permite a la empresa generar fórmulas de nómina con Inteligencia Artificial.</small>
                </div>
              </div>

              <Button 
                type="submit" 
                label={isLoading ? "Iniciando Despliegue..." : "Confirmar y Crear Espacio"} 
                icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-cloud-upload"} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl border-none shadow-lg transition-all text-lg" 
                disabled={isLoading || !formData.companyName || !formData.email || !formData.password}
              />
            </form>
          </div>
        </Dialog>

        {/* Modal Edit Licencias */}
        <Dialog 
          header="Ajustar Licencias Suscritas" 
          visible={isEditDialogVisible} 
          style={{ width: '30vw' }} 
          onHide={() => setIsEditDialogVisible(false)}
          className="p-fluid rounded-2xl"
        >
          <form onSubmit={handleUpdate} className="pt-4 space-y-5">
             {editData.user && (
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuario Administrador</h4>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-inner">
                     {editData.user.firstName?.charAt(0) || ''}{editData.user.lastName?.charAt(0) || ''}
                   </div>
                   <div>
                     <p className="font-bold text-slate-800">{editData.user.firstName} {editData.user.lastName}</p>
                     <p className="text-slate-500 text-sm">{editData.user.email}</p>
                   </div>
                 </div>
               </div>
             )}
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Máximo de Empleados Activos</label>
                <InputText 
                  type="number" 
                  value={editData.maxActiveWorkers} 
                  onChange={(e) => setEditData({...editData, maxActiveWorkers: e.target.value})} 
                  className="w-full py-3 rounded-xl border-gray-200 focus:border-emerald-500" 
                  required
                />
                <small className="text-gray-500 block mt-2">Esta es la cota de facturación de esta empresa.</small>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 text-emerald-600 rounded" 
                     checked={editData.isActive} 
                     onChange={(e) => setEditData({...editData, isActive: e.target.checked})} 
                   />
                   Cuenta Activa
                </label>
                <small className="text-gray-500 block mb-4">Si se desactiva, ningún usuario de esta empresa podrá iniciar sesión.</small>
             </div>

             <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Configuración Comercial y Addons</h4>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono Corporativo</label>
                  <InputText 
                    type="text" 
                    value={editData.contactPhone} 
                    onChange={(e) => setEditData({...editData, contactPhone: e.target.value})} 
                    className="w-full py-2 rounded-xl border-gray-200 focus:border-emerald-500" 
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Logo (Nueva Imagen)</label>
                  <input 
                    type="file" accept="image/png, image/jpeg"
                    onChange={(e) => setEditData({...editData, logoFile: e.target.files?.[0] || null})} 
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:border-emerald-500 bg-white" 
                  />
                  {editData.logoUrl && !editData.logoFile && <small className="text-gray-500 mt-1 block">Ya cuenta con un logo cargado.</small>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Vencimiento de Suscripción</label>
                  <Calendar 
                    value={editData.serviceEndDate} 
                    onChange={(e: any) => setEditData({...editData, serviceEndDate: e.value})} 
                    className="w-full rounded-xl border-gray-200 focus:border-emerald-500" 
                    dateFormat="dd/mm/yy" placeholder="Sin expiración" showIcon 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 text-emerald-600 rounded cursor-pointer" 
                       checked={editData.hasWorkerPortalAccess} 
                       onChange={(e) => setEditData({...editData, hasWorkerPortalAccess: e.target.checked})} 
                     />
                     Portal del Trabajador Activo
                  </label>
                  <small className="text-gray-500 block mb-4">Restringe o habilita el servicio de recibos en línea.</small>

                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 text-indigo-600 rounded cursor-pointer" 
                       checked={editData.hasOracleAccess} 
                       onChange={(e) => setEditData({...editData, hasOracleAccess: e.target.checked})} 
                     />
                     Oráculo IA (Copiloto de Conceptos)
                  </label>
                  <small className="text-gray-500 block mb-4">Módulo Premium de Inteligencia Artificial para RRHH.</small>

                  {editData.hasOracleAccess && (
                    <div className="mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                       <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                         <i className="pi pi-sparkles"></i> Prompt Tuning (Directrices Especiales)
                       </label>
                       <InputTextarea 
                         rows={4}
                         value={editData.oraclePrompt || ''} 
                         onChange={(e) => setEditData({...editData, oraclePrompt: e.target.value})} 
                         className="w-full p-3 text-sm rounded border-indigo-200 focus:border-indigo-500 bg-white font-mono" 
                         placeholder="Ej: Para comunicarte con el usuario, escribe en un Español Corporativo..."
                       />
                       <small className="text-indigo-600/70 font-medium block mt-2 leading-tight">Gobernanza de comportamiento IA para esta empresa. Por defecto asume leyes venezolanas.</small>
                    </div>
                  )}
                </div>
             </div>
             <Button 
                type="submit" 
                label={isLoading ? "Guardando..." : "Actualizar Límites"} 
                icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-save"} 
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 mt-4 rounded-xl border-none shadow-lg" 
                disabled={isLoading}
              />
          </form>
        </Dialog>

      </div>
    </>
  );
}
