"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import Dialog from '@/components/ui/Dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import Dropdown from '@/components/ui/Dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import api from '@/lib/api';

export default function OrganizationSettingsPage() {
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | any[] | undefined>(undefined);
  const [expandedDeptRows, setExpandedDeptRows] = useState<DataTableExpandedRows | any[] | undefined>(undefined);
  
  const [costCenterDialog, setCostCenterDialog] = useState(false);
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [crewDialog, setCrewDialog] = useState(false);

  const [currentCostCenter, setCurrentCostCenter] = useState<any>({ name: '', accountingCode: '' });
  const [currentDepartment, setCurrentDepartment] = useState<any>({ name: '', costCenterId: '' });
  const [currentCrew, setCurrentCrew] = useState<any>({ name: '', departmentId: '', shiftPatternId: null, patternAnchor: null });

  const [costCenterVars, setCostCenterVars] = useState<any[]>([]);
  const [currentCCVar, setCurrentCCVar] = useState<any>({ code: '', name: '', value: 0, validFrom: new Date('2000-01-01T00:00:00') });

  const [shifts, setShifts] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadData();
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const resp = await api.get('/shift-patterns');
      setShifts(resp.data.map((s: any) => ({ label: s.name, value: s.id })));
    } catch (error) {
      console.error('Error loading shift-patterns', error);
    }
  };

  const loadData = async () => {
    try {
      const response = await api.get('/cost-centers');
      setCostCenters(response.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el organigrama' });
    }
  };

  // --- CRUD Cost Center ---
  const saveCostCenter = async () => {
    if (!currentCostCenter?.name?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'El nombre del Centro de Costo es obligatorio.' });
      return;
    }
    try {
      if (currentCostCenter.id) {
        await api.patch(`/cost-centers/${currentCostCenter.id}`, currentCostCenter);
      } else {
        await api.post('/cost-centers', currentCostCenter);
      }
      setCostCenterDialog(false);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Centro de costo guardado' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al guardar centro de costo' });
    }
  };

  const deleteCostCenter = async (id: string) => {
    try {
      await api.delete(`/cost-centers/${id}`);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Centro de costo eliminado' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al eliminar' });
    }
  };

  // --- CRUD Cost Center Variables ---
  const loadCostCenterVars = async (costCenterId: string) => {
    try {
      const resp = await api.get(`/cost-centers/${costCenterId}/variables`);
      setCostCenterVars(resp.data);
    } catch (error) {
      console.error('Error loading cc vars', error);
    }
  };

  const saveCostCenterVar = async () => {
    if (!currentCCVar?.code?.trim() || !currentCostCenter?.id) {
       toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Código de variable requerido.' });
       return;
    }
    try {
      if (currentCCVar.id) {
        await api.patch(`/cost-centers/${currentCostCenter.id}/variables/${currentCCVar.id}`, currentCCVar);
      } else {
        await api.post(`/cost-centers/${currentCostCenter.id}/variables`, currentCCVar);
      }
      loadCostCenterVars(currentCostCenter.id);
      setCurrentCCVar({ code: '', name: '', value: 0, validFrom: new Date('2000-01-01T00:00:00') });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Variable local guardada' });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Fallo al guardar variable';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), life: 7000 });
    }
  };

  const deleteCostCenterVar = async (varId: string) => {
    if (!currentCostCenter?.id) return;
    try {
      await api.delete(`/cost-centers/${currentCostCenter.id}/variables/${varId}`);
      loadCostCenterVars(currentCostCenter.id);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Variable eliminada' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al eliminar' });
    }
  };

  // --- CRUD Department ---
  const saveDepartment = async () => {
    if (!currentDepartment?.name?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'El nombre del Departamento es obligatorio.' });
      return;
    }
    try {
      const payload = {
        name: currentDepartment.name,
        costCenterId: currentDepartment.costCenterId,
        monthlyBudget: currentDepartment.monthlyBudget ? Number(currentDepartment.monthlyBudget) : null
      };

      if (currentDepartment.id) {
        await api.patch(`/departments/${currentDepartment.id}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      setDepartmentDialog(false);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Departamento guardado' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al guardar departamento' });
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      await api.delete(`/departments/${id}`);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Departamento eliminado' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al eliminar' });
    }
  };

  // --- CRUD Crew ---
  const saveCrew = async () => {
    if (!currentCrew?.name?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'El nombre de la Cuadrilla es obligatorio.' });
      return;
    }
    
    // Fix Timezone Drift for patternAnchor
    let payload = { ...currentCrew };
    if (payload.patternAnchor && payload.patternAnchor instanceof Date) {
      const yStr = payload.patternAnchor.getFullYear();
      const mStr = String(payload.patternAnchor.getMonth() + 1).padStart(2, '0');
      const dStr = String(payload.patternAnchor.getDate()).padStart(2, '0');
      payload.patternAnchor = `${yStr}-${mStr}-${dStr}T00:00:00.000Z`;
    }

    try {
      if (payload.id) {
        await api.patch(`/crews/${payload.id}`, payload);
      } else {
        await api.post('/crews', payload);
      }
      setCrewDialog(false);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cuadrilla guardada' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al guardar cuadrilla' });
    }
  };

  const deleteCrew = async (id: string) => {
    try {
      await api.delete(`/crews/${id}`);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cuadrilla eliminada' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al eliminar' });
    }
  };

  // --- Render Expansion: Department Level ---
  const rowExpansionTemplate = (costCenter: any) => {
    return (
      <div className="p-3 bg-gray-50 rounded-lg ml-8 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-gray-700 m-0">Departamentos de {costCenter.name}</h5>
          <Button icon="pi pi-plus" size="small" label="Agregar Depto" onClick={() => { setCurrentDepartment({ name: '', costCenterId: costCenter.id }); setDepartmentDialog(true); }} />
        </div>
        <DataTable value={costCenter.departments} expandedRows={expandedDeptRows} onRowToggle={(e) => setExpandedDeptRows(e.data)} rowExpansionTemplate={deptExpansionTemplate} dataKey="id" size="small" emptyMessage="No hay departamentos registrados.">
          <Column expander style={{ width: '3rem' }} />
          <Column field="name" header="Nombre del Departamento" />
          <Column header="Presupuesto Mensual" body={(r) => r.monthlyBudget ? <span className="text-green-600 font-bold">${parseFloat(r.monthlyBudget).toLocaleString()}</span> : <span className="text-gray-400 text-xs italic">Ilimitado</span>} />
          <Column body={(rowData) => (
            <div className="flex gap-2 justify-end">
              <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => { setCurrentDepartment(rowData); setDepartmentDialog(true); }} />
              <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteDepartment(rowData.id)} />
            </div>
          )} />
        </DataTable>
      </div>
    );
  };

  // --- Render Expansion: Crew Level ---
  const deptExpansionTemplate = (department: any) => {
    return (
      <div className="p-3 bg-indigo-50 rounded-lg ml-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-indigo-800 m-0">Cuadrillas / Guardias de {department.name}</h5>
          <Button icon="pi pi-plus" size="small" severity="secondary" label="Agregar Cuadrilla" onClick={() => { setCurrentCrew({ name: '', departmentId: department.id }); setCrewDialog(true); }} />
        </div>
        <DataTable value={department.crews} dataKey="id" size="small" emptyMessage="No hay cuadrillas registradas.">
          <Column field="name" header="Nombre de la Cuadrilla/Guardia" />
          <Column header="Turno Maestro" body={(r) => r.shiftPattern ? <span className="text-teal-700 font-medium"><i className="pi pi-clock mr-1 text-xs"></i>{r.shiftPattern.name}</span> : <span className="text-gray-400 italic">Libre (Sin Turno)</span>} />
          <Column body={(rowData) => (
            <div className="flex gap-2 justify-end">
              <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => { setCurrentCrew(rowData); setCrewDialog(true); }} />
              <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteCrew(rowData.id)} />
            </div>
          )} />
        </DataTable>
      </div>
    );
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estructura Organizacional</h1>
        <p className="text-gray-600 mb-6">Administra los Centros de Costo, Departamentos y Cuadrillas de la empresa.</p>

        <Toolbar 
          className="mb-4 bg-white border border-gray-200 rounded-xl"
          start={<Button label="Nuevo Centro de Costo (Sucursal)" icon="pi pi-plus" severity="success" onClick={() => { setCurrentCostCenter({ name: '', accountingCode: '' }); setCostCenterDialog(true); }} />}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable 
            value={costCenters} 
            expandedRows={expandedRows} 
            onRowToggle={(e) => setExpandedRows(e.data)} 
            rowExpansionTemplate={rowExpansionTemplate} 
            dataKey="id"
            emptyMessage="No hay Centros de Costo registrados."
          >
            <Column expander style={{ width: '3rem' }} />
            <Column field="name" header="Centro de Costo / Sucursal" className="font-semibold text-primary" />
            <Column field="accountingCode" header="Terminal Contable" body={(r) => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{r.accountingCode}</span>} />
            <Column body={(rowData) => (
              <div className="flex gap-2 justify-end">
                <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => { 
                  setCurrentCostCenter(rowData); 
                  loadCostCenterVars(rowData.id);
                  setCostCenterDialog(true); 
                }} />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteCostCenter(rowData.id)} />
              </div>
            )} />
          </DataTable>
        </div>
      </div>

      {/* Cost Center Dialog */}
      <Dialog visible={costCenterDialog} onHide={() => setCostCenterDialog(false)} header={currentCostCenter?.id ? 'Centro de Costo / Sucursal' : 'Nuevo Centro de Costo'} className="w-full md:w-[700px]">
        
        <TabView>
          <TabPanel header="Datos Generales" leftIcon="pi pi-building">
            <div className="flex flex-col gap-4 mt-2 p-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Nombre de la Sucursal</label>
                <InputText value={currentCostCenter?.name || ''} onChange={(e) => setCurrentCostCenter({...currentCostCenter, name: e.target.value})} placeholder="Ej. Tienda Haticos" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Código o Sufijo Contable</label>
                <InputText value={currentCostCenter?.accountingCode || ''} onChange={(e) => setCurrentCostCenter({...currentCostCenter, accountingCode: e.target.value})} placeholder="Ej. -01" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setCostCenterDialog(false)} />
                <Button label="Guardar" icon="pi pi-check" onClick={saveCostCenter} />
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header="Variables Locales" leftIcon="pi pi-hashtag" disabled={!currentCostCenter?.id}>
             <div className="p-2">
                <p className="text-sm text-gray-500 mb-4">
                  Asigna valores numéricos que sólo aplicarán a los trabajadores ubicados en esta sucursal o centro de costo.
                  Ejemplo: <span className="font-mono text-xs bg-gray-100 px-1 rounded">TIEMPO_VIAJE = 120</span>
                </p>

                <div className="flex gap-2 items-end mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Código (VAR_NAME)</label>
                    <InputText value={currentCCVar.code} onChange={(e) => setCurrentCCVar({...currentCCVar, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')})} placeholder="TIEMPO_VIAJE" className="w-full text-sm font-mono uppercase" disabled={!!currentCCVar.id} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Descripción</label>
                    <InputText value={currentCCVar.name} onChange={(e) => setCurrentCCVar({...currentCCVar, name: e.target.value})} placeholder="Minutos de viaje" className="w-full text-sm" />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold mb-1">Valor</label>
                    <InputNumber value={currentCCVar.value} onValueChange={(e) => setCurrentCCVar({...currentCCVar, value: e.value || 0})} mode="decimal" minFractionDigits={0} maxFractionDigits={4} className="w-full" inputClassName="w-full text-sm" />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-semibold mb-1">Vigencia</label>
                    <Calendar value={currentCCVar.validFrom ? new Date(currentCCVar.validFrom) : null} onChange={(e) => setCurrentCCVar({...currentCCVar, validFrom: e.value})} dateFormat="dd/mm/yy" className="w-full p-inputtext-sm" />
                  </div>
                  <Button icon={currentCCVar.id ? "pi pi-save" : "pi pi-plus"} label={currentCCVar.id ? "Guardar" : "Agregar"} onClick={saveCostCenterVar} severity="success" className="p-button-sm whitespace-nowrap" />
                  {currentCCVar.id && (
                    <Button icon="pi pi-times" onClick={() => setCurrentCCVar({ code: '', name: '', value: 0, validFrom: new Date('2000-01-01T00:00:00') })} severity="secondary" text className="p-button-sm" title="Cancelar edición" />
                  )}
                </div>

                <DataTable value={costCenterVars} dataKey="id" emptyMessage="No hay variables asignadas a este centro de costo." size="small">
                  <Column field="code" header="Código" className="font-mono text-indigo-700 font-semibold text-xs" />
                  <Column field="name" header="Descripción" />
                  <Column field="value" header="Valor" body={(r) => <span className="font-bold">{Number(r.value)}</span>} />
                  <Column body={(rowData) => (
                    <div className="flex gap-2 justify-end">
                      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => setCurrentCCVar(rowData)} />
                      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteCostCenterVar(rowData.id)} />
                    </div>
                  )} />
                </DataTable>
             </div>
          </TabPanel>
        </TabView>
      </Dialog>

      {/* Department Dialog */}
      <Dialog visible={departmentDialog} onHide={() => setDepartmentDialog(false)} header={currentDepartment?.id ? 'Editar Departamento' : 'Nuevo Departamento'} className="w-full md:w-[450px]">
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nombre del Departamento</label>
            <InputText value={currentDepartment?.name || ''} onChange={(e) => setCurrentDepartment({...currentDepartment, name: e.target.value})} placeholder="Ej. Panadería" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Presupuesto Mensual ($)</label>
            <InputNumber value={currentDepartment?.monthlyBudget ? parseFloat(currentDepartment.monthlyBudget) : null} onValueChange={(e) => setCurrentDepartment({...currentDepartment, monthlyBudget: e.value})} mode="currency" currency="USD" locale="en-US" placeholder="Ej. 15000" />
            <small className="text-gray-500">Déjalo en blanco si no tiene límite presupuestario.</small>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" text onClick={() => setDepartmentDialog(false)} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveDepartment} />
          </div>
        </div>
      </Dialog>

      {/* Crew Dialog */}
      <Dialog visible={crewDialog} onHide={() => setCrewDialog(false)} header={currentCrew?.id ? 'Editar Cuadrilla' : 'Nueva Cuadrilla'} className="w-full md:w-[450px]">
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nombre de la Cuadrilla/Guardia</label>
            <InputText value={currentCrew?.name || ''} onChange={(e) => setCurrentCrew({...currentCrew, name: e.target.value})} placeholder="Ej. Guardia Diurna 7am-3pm" />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-sm font-semibold">Turno Maestro (Opcional)</label>
            <Dropdown options={shifts} value={currentCrew?.shiftPatternId || null} onChange={(e) => setCurrentCrew({...currentCrew, shiftPatternId: e.target.value})} placeholder="Seleccione Matriz o deje vacío" showClear />
            <small className="text-gray-500">Deje en blanco si esta cuadrilla no ficha turno (Ej. Directiva).</small>
          </div>
          {currentCrew?.shiftPatternId && (
             <div className="flex flex-col gap-1 mt-1">
               <label className="text-sm font-semibold text-indigo-700">Fecha Ancla (Alineación DÍA 1)</label>
               <Calendar 
                 value={
                   currentCrew?.patternAnchor 
                     ? (typeof currentCrew.patternAnchor === 'string' 
                          ? new Date(Number(currentCrew.patternAnchor.substring(0,4)), Number(currentCrew.patternAnchor.substring(5,7))-1, Number(currentCrew.patternAnchor.substring(8,10)))
                          : currentCrew.patternAnchor) 
                     : null
                 } 
                 onChange={(e) => setCurrentCrew({...currentCrew, patternAnchor: e.value})} 
                 showIcon 
                 dateFormat="dd/mm/yy" 
                 placeholder="Ej. 01/01/2024" 
               />
               <small className="text-indigo-500 font-medium">Elija CUALQUIER fecha del pasado donde el turno haya caído en "Día 1". Cuidado, un error aquí desfasará la rotación.</small>
             </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" text onClick={() => setCrewDialog(false)} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveCrew} />
          </div>
        </div>
      </Dialog>

    </AppLayout>
  );
}
