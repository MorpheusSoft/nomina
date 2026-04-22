"use client";

import { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import api from '@/lib/api';

interface CatalogItem {
  id: string;
  category: string;
  value: string;
}

export default function CatalogsSettingsPage() {
  const [nationalities, setNationalities] = useState<CatalogItem[]>([]);
  const [absenceReasons, setAbsenceReasons] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('NATIONALITY');
  const [newValue, setNewValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [resNat, resAbs] = await Promise.all([
        api.get('/general-catalogs?category=NATIONALITY'),
        api.get('/general-catalogs?category=ABSENCE_REASON')
      ]);
      setNationalities(resNat.data);
      setAbsenceReasons(resAbs.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    try {
      await api.post('/general-catalogs', {
        category: activeCategory,
        value: newValue.trim()
      });
      setShowAddModal(false);
      setNewValue('');
      setErrorMsg('');
      loadData();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al guardar el valor.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este valor del catálogo?')) {
      try {
        await api.delete(`/general-catalogs/${id}`);
        loadData();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Catálogos Auxiliares</h1>
            <p className="text-gray-500 mt-1">Configuración y mantenimiento de listas de selección (Dropdowns).</p>
          </div>
        </div>

        <TabView className="mt-4">
          <TabPanel header="Nacionalidades">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  <i className="pi pi-globe text-indigo-500 mr-2"></i>
                  Nacionalidades
                </h2>
                <Button 
                  label="Agregar Nacionalidad" 
                  icon="pi pi-plus" 
                  className="p-button-outlined p-button-sm"
                  onClick={() => { setActiveCategory('NATIONALITY'); setNewValue(''); setErrorMsg(''); setShowAddModal(true); }}
                />
              </div>

              <DataTable 
                value={nationalities} 
                loading={loading} 
                emptyMessage="No hay nacionalidades registradas."
                stripedRows
              >
                <Column field="value" header="Valor (Mostrado en Selector)" className="font-medium" />
                <Column header="Acciones" body={(r) => (
                  <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(r.id)} />
                )} style={{ width: '6rem' }} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Motivos de Ausencia">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  <i className="pi pi-calendar-minus text-rose-500 mr-2"></i>
                  Motivos de Permisos y Faltas
                </h2>
                <Button 
                  label="Agregar Motivo" 
                  icon="pi pi-plus" 
                  className="p-button-outlined p-button-sm p-button-danger"
                  onClick={() => { setActiveCategory('ABSENCE_REASON'); setNewValue(''); setErrorMsg(''); setShowAddModal(true); }}
                />
              </div>

              <DataTable 
                value={absenceReasons} 
                loading={loading} 
                emptyMessage="El catálogo está vacío. El sistema proveerá opciones básicas por defecto si no agerega nada."
                stripedRows
              >
                <Column field="value" header="Valor (Mostrado en Formularios)" className="font-medium" />
                <Column header="Acciones" body={(r) => (
                  <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(r.id)} />
                )} style={{ width: '6rem' }} />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>

      <Dialog 
        header={`Añadir al Catálogo: ${activeCategory === 'NATIONALITY' ? 'Nacionalidad' : 'Motivo de Ausencia'}`} 
        visible={showAddModal}  
        style={{ width: '400px' }} 
        onHide={() => setShowAddModal(false)}
      >
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-sm font-medium text-gray-700">Nombre / Valor</label>
          <InputText 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)} 
            placeholder={activeCategory === 'NATIONALITY' ? "Ej: Colombiano, Peruano..." : "Ej: Reposo Médico, Falta Injustificada..."} 
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          {errorMsg && <small className="text-red-500">{errorMsg}</small>}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" text onClick={() => setShowAddModal(false)} />
            <Button label="Guardar" onClick={handleAdd} />
          </div>
        </div>
      </Dialog>
    </AppLayout>
  );
}
