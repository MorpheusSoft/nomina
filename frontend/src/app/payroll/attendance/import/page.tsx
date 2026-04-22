"use client";

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { parseISO, isValid } from 'date-fns';
import api from '../../../../lib/api';

export default function ImportAttendancePage() {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const onFileUpload = (e: any) => {
    const file = e.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const parsedData = [];

      // Auto-detect if first line is a header by checking if it contains a valid date in the second column
      const firstLineCols = lines[0].split(',');
      const hasHeader = firstLineCols.length > 1 && isNaN(Date.parse(firstLineCols[1].trim()));
      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) { 
        const line = lines[i].trim();
        if (!line) continue;
        
        // Expected format: Cédula, Fecha (YYYY-MM-DD), Hora (HH:MM), Tipo (IN/OUT)
        // Ejemplo: V-1234567, 2026-03-26, 08:15, IN
        const [identity, dateStr, timeStr, typeStr] = line.split(',').map(s => s.trim());
        
        if (identity && dateStr && timeStr && typeStr) {
          // Fix formatting like "7:05" to "07:05" so the ISO string doesn't break
          const formattedTime = timeStr.length === 4 && timeStr.includes(':') ? '0' + timeStr : timeStr;
          
          // Parse as local time. Browsers treat YYYY-MM-DDTHH:MM:SS without 'Z' as local time.
          const localDate = new Date(`${dateStr}T${formattedTime}:00`);
          const timestampStr = localDate.toISOString();

          parsedData.push({
            identityNumber: identity.trim().toUpperCase(),
            date: dateStr,
            time: formattedTime,
            timestamp: timestampStr,
            type: typeStr.toUpperCase() === 'IN' ? 'IN' : 'OUT',
            source: 'EXCEL_IMPORT'
          });
        }
      }

      setDataPreview(parsedData);
      toast.current?.show({ severity: 'success', summary: 'Archivo Leído', detail: `Se encontraron ${parsedData.length} registros para importar.` });
    };
    
    reader.readAsText(file);
  };

  const processImport = async () => {
    if (dataPreview.length === 0) return;
    
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const tenantId = user?.tenantId;
      
      const response = await api.post('/attendance-punches/bulk', {
        tenantId,
        punches: dataPreview
      });

      if (response.data) {
        toast.current?.show({ severity: 'success', summary: 'Importación Exitosa', detail: `${response.data.count} marcas importadas a la base de datos.` });
        setDataPreview([]); // Clear after success
      } else {
        throw new Error('Error al importar en el servidor');
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || 'Verifique que las cédulas existan en la base de datos';
      toast.current?.show({ severity: 'error', summary: 'Error de Importación', detail: typeof serverMsg === 'string' ? serverMsg : (serverMsg.join ? serverMsg.join(', ') : 'Error inesperado') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="flex flex-col gap-6 max-w-5xl mx-auto min-w-0">
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Importación Masiva de Asistencia</h1>
          <p className="text-sm text-slate-500 mt-2 mb-6 max-w-2xl">
            Sube un archivo de Excel o CSV con las entradas y salidas de los trabajadores. 
            Formato requerido: <code className="bg-slate-100 px-2 py-1 rounded text-pink-600">Cédula, Fecha (YYYY-MM-DD), Hora (HH:MM), Acción (IN/OUT)</code>
          </p>

          <FileUpload 
            mode="advanced" 
            name="demo[]" 
            accept=".csv" 
            maxFileSize={1000000} 
            customUpload 
            uploadHandler={onFileUpload}
            chooseLabel="Seleccionar CSV"
            uploadLabel="Leer Archivo"
            cancelLabel="Cancelar"
            className="w-full text-sm"
          />
        </div>

        {dataPreview.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Previsualización de Datos ({dataPreview.length})</h2>
              <Button 
                label="Confirmar Importación" 
                icon="pi pi-check" 
                loading={loading}
                onClick={processImport} 
                className="p-button-success" 
              />
            </div>
            
            <DataTable value={dataPreview} paginator rows={10} className="p-datatable-sm" size="small">
              <Column field="identityNumber" header="Cédula Empleado" className="font-mono text-slate-600 font-bold" />
              <Column field="date" header="Fecha Marcaje" />
              <Column field="time" header="Hora" />
              <Column field="type" header="Tipo de Movimiento" body={(r) => r.type === 'IN' ? '✅ Entrada (IN)' : '🚪 Salida (OUT)'} />
            </DataTable>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
