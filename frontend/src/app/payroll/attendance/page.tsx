"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import api from '../../../lib/api';

const SHIFT_TYPES = [
  { label: 'Diurna', value: 'DIURNA' },
  { label: 'Nocturna', value: 'NOCTURNA' },
  { label: 'Mixta', value: 'MIXTA' }
];

export default function AttendancePage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Bulk & Filters
  const [costCenterList, setCostCenterList] = useState<any[]>([]);
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  


  // Generator
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('REAL');

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const [res, ccRes] = await Promise.all([
        api.get('/payroll-periods'),
        api.get('/cost-centers')
      ]);
      setCostCenterList(ccRes.data);
      // Filtrar a nóminas Abiertas/Borrador para carga
      const openPeriods = res.data.filter((p: any) => p.status === 'DRAFT' || p.status === 'PRE_CALCULATED');
      setPeriods(openPeriods);
      if (openPeriods.length > 0) handlePeriodChange(openPeriods[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePeriodChange = async (period: any) => {
    setSelectedPeriod(period);
    setLoading(true);
    try {
      // 1. Check existing summaries for this period
      const summariesRes = await api.get(`/attendance-summaries/period/${period.id}`);
      const existingSummaries = summariesRes.data;

      // 2. We need ALL workers in the payroll group of this period to prepopulate the grid
      const workersRes = await api.get('/workers');
      // For a real SaaS, we'd query workers filtered by `employmentRecord.payrollGroupId = period.payrollGroupId`
      // Here we assume a simpler matching or fetch all for the demo.
      const allWorkers = workersRes.data;

      const mergedData = allWorkers.map((w: any) => {
        const found = existingSummaries.find((s: any) => s.workerId === w.id);
        const record = w.employmentRecords?.[0];
        return {
          workerId: w.id,
          payrollPeriodId: period.id,
          fullName: `${w.firstName} ${w.lastName}`,
          identity: w.primaryIdentityNumber,
          
          costCenterId: record?.costCenterId || null,
          costCenterName: record?.costCenter?.name || 'Sin Sucursal',
          departmentId: record?.departmentId || null,
          departmentName: record?.department?.name || 'Sin Área',
          crewId: record?.crewId || null,
          crewName: record?.crew?.name || '',
          
          shiftBaseHours: found ? Number(found.shiftBaseHours) : 8.0,
          shiftType: found ? found.shiftType : 'DIURNA',
          daysWorked: found ? Number(found.daysWorked) : 0,
          ordinaryHours: found ? Number(found.ordinaryHours) : 0,
          extraDayHours: found ? Number(found.extraDayHours) : 0,
          extraNightHours: found ? Number(found.extraNightHours) : 0,
          restDays: found ? Number(found.restDays) : 0,
          holidays: found ? Number(found.holidays) : 0,
          workedHolidays: found ? Number(found.workedHolidays) : 0,
          workedRestDays: found ? Number(found.workedRestDays) : 0,
          saturdaysWorked: found ? Number(found.saturdaysWorked) : 0,
          sundaysWorked: found ? Number(found.sundaysWorked) : 0,
          justifiedAbsences: found ? Number(found.justifiedAbsences) : 0,
          unjustifiedAbsences: found ? Number(found.unjustifiedAbsences) : 0,
          isModified: false // track dirty cells
        };
      });

      setAttendanceData(mergedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onCellEditComplete = async (e: any) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    if (newValue === rowData[field]) return;

    let updatedRow = { ...rowData, [field]: newValue, isModified: true };

    // Auto calculate ordinary hours if days or base hours changes
    if (field === 'daysWorked' || field === 'shiftBaseHours') {
        updatedRow.ordinaryHours = updatedRow.daysWorked * updatedRow.shiftBaseHours;
    }

    const newData = [...attendanceData];
    const index = newData.findIndex(item => item.workerId === rowData.workerId);
    newData[index] = updatedRow;
    setAttendanceData(newData);

    // Save to backend immediately (Auto-Save Timesheet)
    try {
      await api.post('/attendance-summaries/upsert', {
        payrollPeriodId: updatedRow.payrollPeriodId,
        workerId: updatedRow.workerId,
        shiftBaseHours: Number(updatedRow.shiftBaseHours),
        shiftType: updatedRow.shiftType,
        daysWorked: Number(updatedRow.daysWorked),
        ordinaryHours: Number(updatedRow.ordinaryHours),
        extraDayHours: Number(updatedRow.extraDayHours),
        extraNightHours: Number(updatedRow.extraNightHours),
        restDays: Number(updatedRow.restDays),
        holidays: Number(updatedRow.holidays),
        workedHolidays: Number(updatedRow.workedHolidays),
        workedRestDays: Number(updatedRow.workedRestDays),
        saturdaysWorked: Number(updatedRow.saturdaysWorked),
        sundaysWorked: Number(updatedRow.sundaysWorked),
        justifiedAbsences: Number(updatedRow.justifiedAbsences),
        unjustifiedAbsences: Number(updatedRow.unjustifiedAbsences)
      });
      // Mark as saved
      newData[index].isModified = false;
      setAttendanceData([...newData]);
    } catch (err) {
      console.error("Error saving attendance", err);
      alert("Error al guardar asistencia de " + updatedRow.fullName);
    }
  };



  const handleGenerateSummaries = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/attendance-summaries/generate/${selectedPeriod.id}?type=${generationType}`);
      let msg = `Consolidación completada. Se generaron resúmenes para ${response.data.count} trabajadores.`;
      if (response.data.skippedWorkers && response.data.skippedWorkers > 0) {
         msg += `\n\n⚠️ Omitidos: ${response.data.skippedWorkers} trabajadores fueron ignorados por no tener Cuadrilla, Matriz de Turnos o Fecha Ancla configurada en su perfil.`;
      }
      alert(msg);
      // Refresh the grid
      await handlePeriodChange(selectedPeriod);
    } catch (e) {
      console.error(e);
      alert("Error al intentar procesar la asistencia diaria del período.");
    } finally {
      setIsGenerating(false);
    }
  };

  const costCenterOptions = [{ label: 'Todas las Sucursales', value: null }, ...costCenterList.map((cc) => ({ label: cc.name, value: cc.id }))];
  const departmentOptions = [{ label: 'Todos los Dptos', value: null }, ...(costCenterList.find((cc) => cc.id === selectedCostCenterId)?.departments.map((d: any) => ({ label: d.name, value: d.id })) || [])];
  const crewOptions = [{ label: 'Todas las Cuadrillas', value: null }, ...(costCenterList.find((cc) => cc.id === selectedCostCenterId)?.departments.find((d: any) => d.id === selectedDepartmentId)?.crews.map((c: any) => ({ label: c.name, value: c.id })) || [])];

  const filteredAttendanceData = attendanceData.filter(d => {
    if (selectedCostCenterId && d.costCenterId !== selectedCostCenterId) return false;
    if (selectedDepartmentId && d.departmentId !== selectedDepartmentId) return false;
    if (selectedCrewId && d.crewId !== selectedCrewId) return false;
    return true;
  });

  const numericEditor = (options: any) => {
    return (
      <InputNumber 
        value={options.value} 
        onValueChange={(e) => options.editorCallback(e.value)} 
        minFractionDigits={0} 
        maxFractionDigits={2} 
        mode="decimal" 
        className="w-full"
      />
    );
  };

  const shiftTypeEditor = (options: any) => {
    return (
      <Dropdown 
        value={options.value} 
        options={SHIFT_TYPES} 
        onChange={(e) => options.editorCallback(e.value)} 
        placeholder="Select a shift"
        className="w-full"
      />
    );
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-[100%] xl:max-w-[95%] 2xl:max-w-[1600px] mx-auto w-full">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Consolidación de Asistencia</h1>
            <p className="mt-2 text-sm text-gray-500">
              Aprueba y edita las horas extra, retardos y feriados <b>Auto-Calculados</b> por el motor antes de enviarlas a Nómina.
            </p>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-80">
            <label className="text-xs font-semibold text-gray-600">Período Abierto a Cargar</label>
            <Dropdown 
              value={selectedPeriod} 
              options={periods} 
              onChange={(e) => handlePeriodChange(e.value)} 
              optionLabel="name" 
              placeholder="Seleccione un período..." 
              className="w-full border-gray-200"
              emptyMessage="No hay períodos Abiertos."
            />
          </div>
        </div>

        {selectedPeriod && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
              <div className="flex flex-col gap-1 w-full md:w-1/3">
                <label className="text-xs font-semibold text-gray-600">Sucursal / Centro</label>
                <Dropdown
                   value={selectedCostCenterId}
                   options={costCenterOptions}
                   onChange={(e) => { setSelectedCostCenterId(e.value); setSelectedDepartmentId(null); setSelectedCrewId(null); }}
                   placeholder="Todas las Sucursales"
                   className="w-full p-inputtext-sm"
                />
              </div>
              <div className="flex flex-col gap-1 w-full md:w-1/3">
                <label className="text-xs font-semibold text-gray-600">Departamento</label>
                <Dropdown
                   value={selectedDepartmentId}
                   options={departmentOptions}
                   onChange={(e) => { setSelectedDepartmentId(e.value); setSelectedCrewId(null); }}
                   placeholder="Todos los Dptos"
                   disabled={!selectedCostCenterId}
                   className="w-full p-inputtext-sm"
                />
              </div>
              <div className="flex flex-col gap-1 w-full md:w-1/3">
                <label className="text-xs font-semibold text-gray-600">Cuadrilla / Guardia</label>
                <Dropdown
                   value={selectedCrewId}
                   options={crewOptions}
                   onChange={(e) => setSelectedCrewId(e.value)}
                   placeholder="Todas las Cuadrillas"
                   disabled={!selectedDepartmentId}
                   className="w-full p-inputtext-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end w-full md:w-auto p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
               <div className="flex flex-col gap-1 w-full md:w-auto">
                 <label className="text-xs font-semibold text-indigo-800">Motor de Consolidación Inteligente</label>
                 <div className="flex gap-3 items-center">
                   <Dropdown 
                     value={generationType} 
                     options={[{label: 'Desde Fichajes (Real)', value: 'REAL'}, {label: 'Proyección Ideal (Virtual)', value: 'VIRTUAL'}]}
                     onChange={(e) => setGenerationType(e.value)}
                     className="w-60 p-inputtext-sm shadow-sm"
                   />
                   <Button label="Generar Asistencia" icon="pi pi-bolt" onClick={handleGenerateSummaries} loading={isGenerating} className="p-button-success whitespace-nowrap shadow-sm" tooltip="Calcula la asistencia basado en el motor de turnos" tooltipOptions={{ position: 'top' }} />
                 </div>
               </div>
            </div>
          </div>
        )}

        {selectedPeriod ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
             <div className="bg-indigo-50 border-b border-indigo-100 p-4 rounded-t-xl flex justify-between items-center">
                 <div>
                     <Tag value={selectedPeriod.type} severity="info" className="mr-3"/>
                     <span className="font-semibold text-indigo-900">{selectedPeriod.name}</span>
                 </div>
                 <div className="text-sm text-indigo-700">
                     Haga clic en una celda para editar. Se auto-guardará inmediatamente.
                 </div>
             </div>
             
             <DataTable value={filteredAttendanceData} editMode="cell" className="p-datatable-sm text-sm" dataKey="workerId" loading={loading} emptyMessage="No hay trabajadores registrados en la plataforma." scrollable>
                 <Column field="identity" header="Cédula" style={{ minWidth: '90px' }} frozen></Column>
                 <Column field="fullName" header="Trabajador" style={{ minWidth: '200px' }} className="font-medium text-gray-900" frozen></Column>
                 <Column header="Organización" style={{ minWidth: '200px' }} body={(r) => (
                    <div className="flex flex-col">
                      <span className="font-semibold text-indigo-700 text-xs">{r.costCenterName}</span>
                      <span className="text-[10px] text-gray-500">{r.departmentName} {r.crewName ? `• ${r.crewName}` : ''}</span>
                    </div>
                 )}></Column>
                 
                 <Column field="daysWorked" header="Días" editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '80px' }} body={(r) => <span className="font-bold text-green-700">{r.daysWorked} Días</span>}></Column>
                 <Column field="restDays" header="Descansos" editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '85px' }} body={(r) => <span className="font-bold text-gray-500">{r.restDays} Días</span>}></Column>

                 <Column field="justifiedAbsences" header="Faltas Just." editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '95px' }} body={(r) => r.justifiedAbsences > 0 ? <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded">{r.justifiedAbsences}</span> : '0'}></Column>
                 <Column field="unjustifiedAbsences" header="Faltas Injust." editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '105px' }} body={(r) => r.unjustifiedAbsences > 0 ? <span className="text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">{r.unjustifiedAbsences}</span> : '0'}></Column>


                 <Column field="holidays" header="Fer." editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '70px' }} body={(r) => r.holidays > 0 ? <span className="text-blue-600 font-bold">{r.holidays}</span> : '0'}></Column>
                 <Column field="workedHolidays" header="Fer.Trab" editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '80px' }} body={(r) => r.workedHolidays > 0 ? <span className="text-red-500 font-bold">{r.workedHolidays}</span> : '0'}></Column>
                 <Column field="workedRestDays" header="Desc.Trab" editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '80px' }} body={(r) => r.workedRestDays > 0 ? <span className="text-orange-500 font-bold">{r.workedRestDays}</span> : '0'}></Column>
                 <Column field="saturdaysWorked" header="Sáb.Trab" editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '80px' }} body={(r) => r.saturdaysWorked > 0 ? <span className="text-purple-600 font-bold">{r.saturdaysWorked}</span> : '0'}></Column>
                 <Column field="sundaysWorked" header="Dom.Trab" editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '80px' }} body={(r) => r.sundaysWorked > 0 ? <span className="text-purple-600 font-bold">{r.sundaysWorked}</span> : '0'}></Column>
                 
                 <Column field="extraDayHours" header="H.E Diur." editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '90px' }} body={(r) => r.extraDayHours > 0 ? <span className="text-orange-600 font-bold">+{r.extraDayHours}</span> : '0'}></Column>
                 <Column field="extraNightHours" header="H.E Noct." editor={(options) => numericEditor(options)} onCellEditComplete={onCellEditComplete} style={{ minWidth: '90px' }} body={(r) => r.extraNightHours > 0 ? <span className="text-purple-600 font-bold">+{r.extraNightHours}</span> : '0'}></Column>
             </DataTable>
           </div>
        ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
                <i className="pi pi-calendar-times text-4xl mb-3 text-gray-400"></i>
                <p>No ha cargado ningún período de nómina abierto.<br/>Dirígete a "Nómina" para aperturar uno primero.</p>
            </div>
        )}
      </div>

      {/* Removed old CSV dialog as it is now in /payroll/attendance/import */}
    </AppLayout>
  );
}
