import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import Dialog from '@/components/ui/Dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Cargando mapa...</div> });

export default function WorkLocationsManager({ onSave }: { onSave?: () => void }) {
  const [locations, setLocations] = useState<any[]>([]);
  const [locationDialog, setLocationDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>({ name: '', latitude: null, longitude: null, allowedRadius: 100 });
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/work-locations');
      setLocations(response.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las locaciones' });
    }
  };

  const saveLocation = async () => {
    if (!currentLocation?.name?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio.' });
      return;
    }
    try {
      if (currentLocation.id) {
        await api.patch(`/work-locations/${currentLocation.id}`, currentLocation);
      } else {
        await api.post('/work-locations', currentLocation);
      }
      setLocationDialog(false);
      loadData();
      if (onSave) onSave();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Locación guardada' });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Fallo al guardar locación' });
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await api.delete(`/work-locations/${id}`);
      loadData();
      if (onSave) onSave();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Locación eliminada' });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Fallo al eliminar' });
    }
  };

  return (
    <div className="w-full">
      <Toast ref={toast} />
      <Toolbar 
        className="mb-4 bg-white border border-gray-200 rounded-xl"
        start={<Button label="Nueva Locación" icon="pi pi-map-marker" severity="success" onClick={() => { setCurrentLocation({ name: '', latitude: null, longitude: null, allowedRadius: 100 }); setLocationDialog(true); }} />}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable 
          value={locations} 
          dataKey="id"
          emptyMessage="No hay locaciones registradas."
        >
          <Column field="name" header="Nombre" className="font-semibold text-primary" />
          <Column header="Coordenadas" body={(r) => r.latitude ? <span className="text-gray-500 font-mono text-sm">{r.latitude}, {r.longitude}</span> : <span className="italic text-gray-400">Sin definir</span>} />
          <Column header="Radio Permitido" body={(r) => <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">{r.allowedRadius} mts</span>} />
          <Column body={(rowData) => (
            <div className="flex gap-2 justify-end">
              <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => { setCurrentLocation(rowData); setLocationDialog(true); }} />
              <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteLocation(rowData.id)} />
            </div>
          )} />
        </DataTable>
      </div>

      <Dialog visible={locationDialog} onHide={() => setLocationDialog(false)} header={currentLocation?.id ? 'Editar Locación' : 'Nueva Locación'} className="w-full md:w-[800px]">
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-semibold">Nombre de la Locación</label>
              <InputText value={currentLocation?.name || ''} onChange={(e) => setCurrentLocation({...currentLocation, name: e.target.value})} placeholder="Ej. Muelle Los Haticos" />
            </div>
            <div className="w-full md:w-48 flex flex-col gap-1">
              <label className="text-sm font-semibold">Radio (metros)</label>
              <InputNumber value={currentLocation?.allowedRadius} onValueChange={(e) => setCurrentLocation({...currentLocation, allowedRadius: e.value || 100})} min={10} max={5000} suffix=" mts" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-sm font-semibold text-indigo-700">Ubicar en el Mapa</label>
            <small className="text-gray-500 mb-2">Haz clic en el mapa para establecer o actualizar la coordenada exacta.</small>
            <div className="border border-gray-300 rounded-lg p-1 bg-gray-50">
                <MapPicker 
                    latitude={currentLocation.latitude} 
                    longitude={currentLocation.longitude} 
                    radius={currentLocation.allowedRadius}
                    onChange={(lat, lng) => setCurrentLocation({...currentLocation, latitude: lat, longitude: lng})}
                />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" text onClick={() => setLocationDialog(false)} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveLocation} disabled={!currentLocation.latitude} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
