"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { Message } from 'primereact/message';
import { FilterMatchMode } from 'primereact/api';
import { format } from 'date-fns';
import api from '../../../../lib/api';

export default function PunchesPage() {
  const [punches, setPunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<any>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Tab B states
  const [workers, setWorkers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string>('');

  const fetchPunches = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        console.error('Tenant ID no encontrado en localStorage user');
        return;
      }
      setTenantId(tenantId);
      
      const response = await api.get(`/attendance-punches?tenantId=${tenantId}`);
      if (response.data) {
        const formattedData = response.data.map((punch: any) => ({
          ...punch,
          workerName: `${punch.worker?.firstName} ${punch.worker?.lastName}`,
          workerIdNumber: punch.worker?.primaryIdentityNumber,
        }));
        setPunches(formattedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      if (!u?.tenantId) return;
      
      const [wRes, pRes] = await Promise.all([
        api.get(`/workers?tenantId=${u.tenantId}`),
        api.get(`/payroll-periods?tenantId=${u.tenantId}`)
      ]);
      if (wRes.data) {
        setWorkers(wRes.data.map((w: any) => ({ ...w, label: `${w.firstName} ${w.lastName} - ${w.primaryIdentityNumber}` })));
      }
      if (pRes.data) {
        setPeriods(pRes.data.map((p: any) => ({ ...p, label: `${p.name} (${format(new Date(p.startDate), 'dd/MM/yyyy')} - ${format(new Date(p.endDate), 'dd/MM/yyyy')})` })));
      }
    } catch(e) {}
  };

  useEffect(() => {
    fetchPunches();
    fetchOptions();
  }, []);

  const fetchAuditData = async () => {
    if (!selectedWorkerId || !selectedPeriodId || !tenantId) return;
    try {
      setAuditLoading(true);
      const response = await api.get(`/attendance-summaries/audit/${tenantId}?workerId=${selectedWorkerId}&payrollPeriodId=${selectedPeriodId}`);
      setAuditData(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWorkerId && selectedPeriodId) {
      fetchAuditData();
    }
  }, [selectedWorkerId, selectedPeriodId]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value as any;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const filteredPunches = useMemo(() => {
    let result = punches;

    if (dateRange) {
      if (Array.isArray(dateRange)) {
        const start = dateRange[0] ? new Date(dateRange[0]) : null;
        const end = dateRange[1] ? new Date(dateRange[1]) : start;

        if (start && end) {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          result = result.filter(p => {
            const d = new Date(p.timestamp);
            return d >= start && d <= end;
          });
        }
      } else {
        const start = new Date(dateRange);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange);
        end.setHours(23, 59, 59, 999);
        result = result.filter(p => {
          const d = new Date(p.timestamp);
          return d >= start && d <= end;
        });
      }
    }

    return result;
  }, [punches, dateRange]);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-2 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-slate-800">Marcas Crudas Recibidas</h2>
        <div className="flex gap-4 items-center">
          <Calendar
            value={dateRange}
            onChange={(e) => setDateRange(e.value)}
            selectionMode="range"
            readOnlyInput
            hideOnRangeSelection
            placeholder="Filtrar por fechas..."
            className="w-64"
            showIcon
            showButtonBar
          />
          <span className="relative w-72">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar empleado..."
            className="w-full"
            style={{ paddingLeft: '2.5rem' }}
          />
          </span>
        </div>
      </div>
    );
  };

  const typeBodyTemplate = (rowData: any) => {
    return (
      <Tag 
        value={rowData.type} 
        severity={rowData.type === 'IN' ? 'success' : 'danger'} 
        rounded
        className="px-3 py-1 font-bold text-[11px] tracking-wider"
      />
    );
  };

  const sourceBodyTemplate = (rowData: any) => {
    let icon = 'pi pi-check';
    let label = 'Desconocido';
    let severity: "info" | "success" | "warning" | "danger" | "secondary" | "contrast" | undefined = 'info';

    switch (rowData.source) {
      case 'BIOMETRIC':
        icon = 'pi pi-id-card';
        label = 'Biométrico';
        severity = 'info';
        break;
      case 'EXCEL_IMPORT':
        icon = 'pi pi-file-excel';
        label = 'Carga Masiva';
        severity = 'success';
        break;
      case 'MANUAL':
        icon = 'pi pi-user-edit';
        label = 'Manual';
        severity = 'warning';
        break;
    }

    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <i className={`${icon} ${
          severity === 'info' ? 'text-blue-500' : 
          severity === 'success' ? 'text-emerald-500' : 
          'text-amber-500'
        }`}></i>
        <span className="font-medium">{label}</span>
      </div>
    );
  };

  const dateBodyTemplate = (rowData: any) => {
    return (
      <div className="text-sm">
        <div className="font-semibold text-slate-800">{format(new Date(rowData.timestamp), 'dd MMM yyyy')}</div>
        <div className="text-slate-500 text-xs">{format(new Date(rowData.timestamp), 'hh:mm:ss a')}</div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registro de Entradas y Salidas</h1>
            <p className="text-sm text-slate-500 mt-1">Histórico de marcas puras (inalterables) registradas por el personal.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              icon="pi pi-refresh" 
              className="p-button-outlined p-button-secondary bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              onClick={fetchPunches}
              tooltip="Actualizar marcas"
            />
          </div>
        </div>

        <TabView className="mt-2">
          <TabPanel header="Marcas Crudas Recibidas" leftIcon="pi pi-clock mr-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full overflow-x-auto mt-4">
              <DataTable
                value={filteredPunches}
                paginator
                rows={15}
                loading={loading}
                dataKey="id"
                filters={filters}
                globalFilterFields={['workerName', 'workerIdNumber', 'type', 'source']}
                header={renderHeader()}
                emptyMessage="No se han encontrado registros de marcas."
                className="p-datatable-sm text-sm"
                rowHover
                stripedRows
              >
                <Column field="workerIdNumber" header="Cédula" className="font-mono text-slate-600 w-[12%]" />
                <Column field="workerName" header="Trabajador" className="font-bold text-slate-800" sortable />
                <Column header="Fecha y Hora" body={dateBodyTemplate} sortable sortField="timestamp" className="w-[18%]" />
                <Column field="type" header="Acción" body={typeBodyTemplate} className="w-[15%]" />
                <Column field="source" header="Origen de Marca" body={sourceBodyTemplate} className="w-[20%]" />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Auditoría Forense de Jornadas" leftIcon="pi pi-search mr-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trabajador</label>
                  <Dropdown 
                    value={selectedWorkerId}
                    options={workers}
                    onChange={(e) => setSelectedWorkerId(e.value)}
                    optionLabel="label"
                    optionValue="id"
                    filter
                    placeholder="Seleccione un trabajador"
                    className="w-full shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Período de Nómina</label>
                  <Dropdown 
                    value={selectedPeriodId}
                    options={periods}
                    onChange={(e) => setSelectedPeriodId(e.value)}
                    optionLabel="label"
                    optionValue="id"
                    placeholder="Seleccione un período"
                    className="w-full shadow-sm"
                  />
                </div>
              </div>

              {!selectedWorkerId || !selectedPeriodId ? (
                <div className="mt-8 mb-4">
                  <Message severity="info" text="Seleccione un trabajador y un período estructurado validado para auditar sus jornadas." className="w-full border shadow-sm" />
                </div>
              ) : (
                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                  <DataTable 
                    value={auditData} 
                    loading={auditLoading}
                    emptyMessage="No se encontraron jornadas procesables en este período"
                    className="p-datatable-sm"
                    rowHover
                    stripedRows
                    footer={
                      auditData.length > 0 && (
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-b-lg border-t border-slate-200 text-sm">
                          <span className="font-bold text-slate-600">Total Auditado:</span>
                          <div className="flex gap-6">
                            <span className="flex items-center gap-2">
                              <i className="pi pi-sun text-orange-500"></i>
                              <b className="text-slate-800">{auditData.reduce((acc, curr) => acc + curr.dayHrs, 0).toFixed(2)} Hrs Diurnas</b>
                            </span>
                            <span className="flex items-center gap-2">
                              <i className="pi pi-moon text-indigo-500"></i>
                              <b className="text-slate-800">{auditData.reduce((acc, curr) => acc + curr.nightHrs, 0).toFixed(2)} Hrs Nocturnas</b>
                            </span>
                          </div>
                        </div>
                      )
                    }
                  >
                    <Column field="date" header="Día Consultado" body={(r) => <span className="font-bold text-slate-700">{format(new Date(r.date + 'T00:00:00'), 'EEE dd MMM yyyy')}</span>} />
                    <Column field="shift" header="Tramo de Esfuerzo" body={(r) => <span className="font-mono text-slate-800 bg-slate-100/80 border border-slate-200 px-2 py-1 rounded shadow-sm">{r.shift}</span>} />
                    <Column header="Hrs Diurnas" body={(r) => r.dayHrs > 0 ? <span className="text-orange-600 font-black"><i className="pi pi-sun mr-1 text-[10px]"></i>{r.dayHrs}</span> : <span className="text-slate-300">-</span>} />
                    <Column header="Hrs Locales" body={(r) => r.nightHrs > 0 ? <span className="text-indigo-600 font-black"><i className="pi pi-moon mr-1 text-[10px]"></i>{r.nightHrs}</span> : <span className="text-slate-300">-</span>} />
                    <Column field="status" header="Clasificación" body={(r) => {
                      let sev: any = 'info';
                      let icon = 'pi-clock';
                      if (r.status === 'WORK') { sev = 'success'; icon = 'pi-briefcase' }
                      if (r.status === 'FÍSICO') { sev = 'warning'; icon = 'pi-check-circle' }
                      if (r.status === 'REST') { sev = 'danger'; icon = 'pi-home' }
                      if (r.status === 'HOLIDAY') { sev = 'secondary'; icon = 'pi-star' }
                      return <Tag value={r.status} severity={sev} rounded icon={`pi ${icon}`} className="px-3" />
                    }} />
                    <Column field="source" header="Ingesta" body={(r) => (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-fit">
                        <i className={r.source === 'VIRTUAL' ? 'pi pi-server text-blue-500' : 'pi pi-id-card text-green-500'}></i>
                        {r.source}
                      </span>
                    )} />
                  </DataTable>
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>
      </div>
    </AppLayout>
  );
}
