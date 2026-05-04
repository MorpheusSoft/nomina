"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { get, set } from 'idb-keyval';
import api from '@/lib/api';
import CameraCapture from '@/components/pwa/CameraCapture';

export default function PWASupervisorPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [locations, setLocations] = useState<{label: string, value: string}[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);
  const [pendingPunches, setPendingPunches] = useState<any[]>([]);
  
  const [cameraDialog, setCameraDialog] = useState(false);
  const [activeWorkerId, setActiveWorkerId] = useState<string | null>(null);

  const toast = useRef<Toast>(null);
  const router = useRouter();

  useEffect(() => {
    // Determine online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Load available locations if online
    if (navigator.onLine) {
      api.get('/work-locations').then(res => {
         setLocations(res.data.map((l: any) => ({ label: l.name, value: l.id })));
      }).catch(e => console.error(e));
    }

    // Load offline data from IDB
    get('offline_crews').then(val => {
       if (val) setWorkers(val);
    });
    get('offline_location').then(val => {
       if (val && val.id) setSelectedLocation(val.id);
    });
    get('pending_punches').then(val => {
       if (val) setPendingPunches(val);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!selectedLocation) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Selecciona una locación para descargar.' });
      return;
    }
    setSyncing(true);
    try {
      const res = await api.get(`/work-locations/${selectedLocation}/sync-data`);
      const { location, crews } = res.data;
      
      await set('offline_location', location);
      await set('offline_crews', crews);
      
      setWorkers(crews);
      toast.current?.show({ severity: 'success', summary: 'Sincronización Exitosa', detail: 'Obreros descargados para uso Offline.' });
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo sincronizar.' });
    } finally {
      setSyncing(false);
    }
  };

  const openCamera = (workerId: string) => {
    setActiveWorkerId(workerId);
    setCameraDialog(true);
  };

  const handleCapture = async (dataUrl: string, location: {lat: number, lng: number} | null) => {
    setCameraDialog(false);
    if (!activeWorkerId) return;

    const newPunch = {
      workerId: activeWorkerId,
      timestamp: new Date().toISOString(),
      latitude: location?.lat,
      longitude: location?.lng,
      photoBase64: dataUrl
    };

    // Update local state
    const updatedCrews = workers.map(crew => {
      const updatedWorkers = crew.workers.map((w: any) => 
        w.id === activeWorkerId ? { ...w, status: 'PUNCHED', punchTime: new Date() } : w
      );
      return { ...crew, workers: updatedWorkers };
    });
    setWorkers(updatedCrews);
    await set('offline_crews', updatedCrews);

    // Save to pending punches
    const updatedPending = [...pendingPunches, newPunch];
    setPendingPunches(updatedPending);
    await set('pending_punches', updatedPending);

    toast.current?.show({ severity: 'info', summary: 'Marcaje Registrado', detail: 'Se guardó en la caché local y está listo para envío.' });
  };

  const handleUploadPunches = async () => {
    if (pendingPunches.length === 0) return;
    setSyncing(true);
    try {
      // Basic loop to send punches. Can be optimized to a batch endpoint.
      for (const p of pendingPunches) {
         await api.post('/attendance-punches', {
            workerId: p.workerId,
            timestamp: p.timestamp,
            latitude: p.latitude,
            longitude: p.longitude,
            source: 'MOBILE'
         });
      }
      setPendingPunches([]);
      await set('pending_punches', []);
      toast.current?.show({ severity: 'success', summary: 'Enviado', detail: 'Todos los marcajes fueron enviados al servidor.' });
    } catch (e) {
       toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al enviar los marcajes.' });
    } finally {
       setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Toast ref={toast} position="bottom-center" />
      
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <i className="pi pi-compass text-2xl"></i>
          <h1 className="font-bold text-lg leading-tight">Nebula<br/><span className="text-xs font-normal text-indigo-200">Quiosco Supervisor</span></h1>
        </div>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Tag severity="success" icon="pi pi-wifi" value="Online" rounded></Tag>
          ) : (
            <Tag severity="danger" icon="pi pi-wifi" value="Offline" rounded></Tag>
          )}
          <Button icon="pi pi-sign-out" rounded text className="text-white hover:bg-indigo-600" onClick={() => router.push('/pwa/login')} />
        </div>
      </header>

      {/* Sync Section */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Sincronización de Cuadrillas</h2>
        <div className="flex flex-col gap-2">
          <Dropdown 
            options={locations} 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.value)} 
            placeholder="Seleccionar Locación de Trabajo" 
            className="w-full rounded-xl"
            disabled={!isOnline}
          />
          <Button 
            label="Descargar Cuadrillas (Offline)" 
            icon="pi pi-cloud-download" 
            severity="secondary" 
            loading={syncing} 
            onClick={handleSync}
            disabled={!isOnline || !selectedLocation}
            className="w-full rounded-xl"
          />
          {!isOnline && <small className="text-red-500 text-center mt-1"><i className="pi pi-info-circle mr-1"></i>Conéctate a internet para sincronizar datos nuevos.</small>}
        </div>
      </div>

      {/* Workers List Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {workers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <i className="pi pi-users text-5xl mb-4 opacity-50"></i>
            <p className="text-center px-4">No hay cuadrillas descargadas. Sincroniza una locación para comenzar el pase de lista.</p>
          </div>
        ) : (
          <>
            <span className="p-input-icon-left w-full mb-4 sticky top-0 z-10">
              <i className="pi pi-search" />
              <InputText 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Buscar por nombre o cédula..." 
                className="w-full p-3 rounded-xl shadow-sm border-gray-300" 
              />
            </span>

            <Accordion multiple activeIndex={[0, 1]}>
              {workers.map((crew) => {
                const filteredWorkers = crew.workers.filter((w: any) => 
                  w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  w.identity.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredWorkers.length === 0) return null;

                return (
                  <AccordionTab key={crew.id} header={<span className="font-bold text-gray-800">{crew.costCenterName} <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-2">{filteredWorkers.length}</span></span>} contentClassName="p-0">
                    <ul className="divide-y divide-gray-100 bg-white">
                      {filteredWorkers.map((worker: any) => (
                        <li key={worker.id} className="p-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{worker.name}</span>
                            <span className="text-sm text-gray-500 font-mono">{worker.identity}</span>
                          </div>
                          
                          {worker.status === 'PUNCHED' ? (
                            <div className="flex flex-col items-end">
                              <Tag severity="success" value="Presente" rounded icon="pi pi-check" className="mb-1"></Tag>
                              <span className="text-xs text-gray-400">{new Date(worker.punchTime || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          ) : (
                            <Button 
                              icon="pi pi-camera" 
                              rounded 
                              severity="help" 
                              aria-label="Marcar" 
                              onClick={() => openCamera(worker.id)}
                              size="large"
                              className="shadow-md"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionTab>
                );
              })}
            </Accordion>
          </>
        )}
      </div>

      {/* Footer Status */}
      <div className="bg-white border-t border-gray-200 p-3 text-center flex justify-between items-center text-xs text-gray-500 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <span><i className="pi pi-database mr-1"></i>{pendingPunches.length} Marcajes Pendientes</span>
        <Button label="Subir al Servidor" icon="pi pi-cloud-upload" size="small" rounded severity={pendingPunches.length > 0 ? "success" : "secondary"} disabled={!isOnline || pendingPunches.length === 0} loading={syncing} onClick={handleUploadPunches} />
      </div>

      <Dialog header="Validación Biométrica" visible={cameraDialog} style={{ width: '90vw', maxWidth: '400px' }} onHide={() => setCameraDialog(false)}>
        {cameraDialog && <CameraCapture onCapture={handleCapture} onCancel={() => setCameraDialog(false)} />}
      </Dialog>
    </div>
  );
}
