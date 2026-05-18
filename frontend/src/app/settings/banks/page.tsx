"use client";

import { useState, useEffect, useRef } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';

const fieldOptions = [
  { label: 'Constante (Texto Fijo)', value: 'CONSTANT' },
  { label: 'Fecha del Sistema (Generación)', value: 'system.currentDate' },
  { label: 'Fecha de Pago / Nómina', value: 'period.paymentDate' },
  { label: 'Cantidad de Trabajadores', value: 'period.totalWorkers' },
  { label: 'Monto Total General', value: 'period.totalAmount' },
  { label: 'RIF de la Empresa', value: 'company.rif' },
  { label: 'Nombre de la Empresa', value: 'company.name' },
  { label: 'Cuenta Emisora Empresa', value: 'company.accountNumber' },
  { label: 'Letra de Identidad (V/E/J)', value: 'worker.idType' },
  { label: 'Cédula Numérica', value: 'worker.idNumber' },
  { label: 'Nombre del Beneficiario', value: 'worker.fullName' },
  { label: 'Cuenta Receptora', value: 'worker.bankAccount' },
  { label: 'Monto a Pagar Individual', value: 'receipt.netPay' }
];

const formatOptions = [
  { label: 'Sin Formato', value: '' },
  { label: 'Sin Decimales (Ej. 15000)', value: 'NO_DECIMALS' },
  { label: 'Decimales (150,00)', value: 'DECIMALS_COMMA' },
  { label: 'Decimales (150.00)', value: 'DECIMALS_DOT' },
  { label: 'Fecha DDMMYYYY', value: 'DDMMYYYY' },
  { label: 'Fecha DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'Fecha YYYYMMDD', value: 'YYYYMMDD' },
  { label: 'Mayúsculas', value: 'UPPERCASE' },
  { label: 'Minúsculas', value: 'LOWERCASE' }
];

const SectionBuilder = ({ title, columns, onChange }: { title: string, columns: any[], onChange: (cols: any[]) => void }) => {
  const addColumn = () => {
    onChange([...columns, { type: 'FIELD', baseField: 'receipt.netPay', value: 'receipt.netPay', format: '', length: 10, paddingChar: ' ', align: 'LEFT' }]);
  };

  const updateColumn = (index: number, field: string, val: any) => {
    const newCols = [...columns];
    newCols[index][field] = val;
    
    if (field === 'baseField') {
       if (val === 'CONSTANT') {
         newCols[index].type = 'CONSTANT';
         newCols[index].value = '';
       } else {
         newCols[index].type = 'FIELD';
         newCols[index].value = val;
       }
    }
    onChange(newCols);
  };

  const removeColumn = (index: number) => {
    const newCols = [...columns];
    newCols.splice(index, 1);
    onChange(newCols);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newCols = [...columns];
    const temp = newCols[index - 1];
    newCols[index - 1] = newCols[index];
    newCols[index] = temp;
    onChange(newCols);
  };

  const moveDown = (index: number) => {
    if (index === columns.length - 1) return;
    const newCols = [...columns];
    const temp = newCols[index + 1];
    newCols[index + 1] = newCols[index];
    newCols[index] = temp;
    onChange(newCols);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">{title}</h4>
        <Button icon="pi pi-plus" size="small" outlined label="Añadir Campo" onClick={addColumn} type="button" className="p-button-sm bg-white" />
      </div>
      {columns.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No hay campos en esta sección.</p>}
      
      <div className="space-y-2">
        {columns.map((col, idx) => (
           <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-indigo-300">
             <div className="flex flex-col bg-slate-100 rounded p-1">
               <i className={`pi pi-angle-up cursor-pointer text-slate-400 hover:text-indigo-600 text-xs mb-1 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}`} onClick={() => moveUp(idx)}></i>
               <i className={`pi pi-angle-down cursor-pointer text-slate-400 hover:text-indigo-600 text-xs ${idx === columns.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`} onClick={() => moveDown(idx)}></i>
             </div>
             
             <div className="flex-1 flex flex-col gap-1">
               <Dropdown options={fieldOptions} value={col.baseField || (col.type === 'CONSTANT' ? 'CONSTANT' : col.value)} onChange={(e) => updateColumn(idx, 'baseField', e.value)} className="w-full text-sm" placeholder="Selecciona..." style={{ height: '36px', alignItems: 'center' }} />
               {col.type === 'CONSTANT' && (
                  <InputText value={col.value} onChange={(e) => updateColumn(idx, 'value', e.target.value)} placeholder="Ej: TXT01" className="w-full font-mono text-xs bg-indigo-50 border-indigo-200 text-indigo-800" style={{ height: '32px' }} />
               )}
             </div>

             <div className="w-48">
               <Dropdown editable options={formatOptions} value={col.format} onChange={(e) => updateColumn(idx, 'format', e.target.value)} className="w-full text-sm" placeholder="Formato..." style={{ height: '36px', alignItems: 'center' }} tooltip="Selecciona o escribe un formato propio (Ej. YYYY-MM)" />
             </div>

             <div className="w-20">
               <InputText value={col.length} onChange={(e) => updateColumn(idx, 'length', e.target.value)} className="w-full text-center" placeholder="Long." tooltip="Longitud Exacta" style={{ height: '36px' }} />
             </div>

             <div className="w-16">
               <InputText value={col.paddingChar} onChange={(e) => updateColumn(idx, 'paddingChar', e.target.value)} className="w-full text-center font-mono" placeholder="Rel." maxLength={1} tooltip="Relleno (Ej: 0 o espacio)" style={{ height: '36px' }} />
             </div>

             <div className="w-28">
               <Dropdown options={[{label: 'Izquierda', value: 'LEFT'}, {label: 'Derecha', value: 'RIGHT'}]} value={col.align} onChange={(e) => updateColumn(idx, 'align', e.value)} className="w-full text-sm" style={{ height: '36px', alignItems: 'center' }} />
             </div>

             <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeColumn(idx)} type="button" />
           </div>
        ))}
      </div>
    </div>
  );
};


export default function BanksSettingsPage() {
  const [banks, setBanks] = useState<any[]>([]);
  const [companyAccounts, setCompanyAccounts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBankModal, setShowBankModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [currentBank, setCurrentBank] = useState<any>({ name: '', code: '' });
  const [currentAccount, setCurrentAccount] = useState<any>({ bankId: '', accountNumber: '', accountType: 'CHECKING', alias: '', isActive: true });
  
  const [currentTemplate, setCurrentTemplate] = useState<any>({ 
    bankId: '', 
    name: '', 
    configJson: { header: [], detail: [], footer: [] } 
  });

  const toast = useRef<Toast>(null);

  const accountTypes = [
    { label: 'Corriente (CHECKING)', value: 'CHECKING' },
    { label: 'Ahorros (SAVINGS)', value: 'SAVINGS' },
    { label: 'Nómina (CURRENT)', value: 'CURRENT' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [resBanks, resAccounts, resTemplates] = await Promise.all([
        api.get('/banks'),
        api.get('/company-bank-accounts'),
        api.get('/bank-file-templates')
      ]);
      setBanks(resBanks.data);
      setCompanyAccounts(resAccounts.data);
      setTemplates(resTemplates.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al cargar datos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveBank = async () => {
    if (!currentBank.name || !currentBank.code) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Nombre y código son obligatorios.' });
      return;
    }
    try {
      if (currentBank.id) {
        toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Edición no soportada. Elimine y cree uno nuevo.' });
      } else {
        await api.post('/banks', currentBank);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Banco creado correctamente.' });
        setShowBankModal(false);
        loadData();
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el banco.' });
    }
  };

  const deleteBank = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este banco? Esto afectará cuentas asociadas.')) {
      try {
        await api.delete(`/banks/${id}`);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Banco eliminado.' });
        loadData();
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el banco.' });
      }
    }
  };

  const saveAccount = async () => {
    if (!currentAccount.bankId || !currentAccount.accountNumber) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Banco y Cuenta son obligatorios.' });
      return;
    }
    const payload = {
      bankId: currentAccount.bankId,
      accountNumber: currentAccount.accountNumber,
      accountType: currentAccount.accountType,
      alias: currentAccount.alias,
      isActive: currentAccount.isActive
    };
    try {
      if (currentAccount.id) {
        await api.put(`/company-bank-accounts/${currentAccount.id}`, payload);
      } else {
        await api.post('/company-bank-accounts', payload);
      }
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cuenta guardada correctamente.' });
      setShowAccountModal(false);
      loadData();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la cuenta.' });
    }
  };

  const deleteAccount = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta cuenta?')) {
      try {
        await api.delete(`/company-bank-accounts/${id}`);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cuenta eliminada.' });
        loadData();
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cuenta.' });
      }
    }
  };

  const saveTemplate = async () => {
    if (!currentTemplate.bankId || !currentTemplate.name) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Banco y Nombre son obligatorios.' });
      return;
    }
    const payload = {
      bankId: currentTemplate.bankId,
      name: currentTemplate.name,
      configJson: currentTemplate.configJson
    };
    try {
      if (currentTemplate.id) {
        await api.put(`/bank-file-templates/${currentTemplate.id}`, payload);
      } else {
        await api.post('/bank-file-templates', payload);
      }
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plantilla guardada correctamente.' });
      setShowTemplateModal(false);
      loadData();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la plantilla.' });
    }
  };

  const deleteTemplate = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta plantilla TXT?')) {
      try {
        await api.delete(`/bank-file-templates/${id}`);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plantilla eliminada.' });
        loadData();
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la plantilla.' });
      }
    }
  };

  const editTemplate = (t: any) => {
    setCurrentTemplate({
       ...t,
       configJson: t.configJson || { header: [], detail: [], footer: [] }
    });
    setShowTemplateModal(true);
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bancos y Cuentas</h1>
          <p className="text-gray-500 mt-1">Configuración del catálogo bancario, cuentas emisoras y Motor de Plantillas TXT.</p>
        </div>

        <TabView className="mt-4 shadow-sm border border-gray-100 rounded-xl bg-white overflow-hidden">
          <TabPanel header="Cuentas de Empresa" leftIcon="pi pi-wallet mr-2">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Cuentas Bancarias Emisoras</h2>
                <Button label="Agregar Cuenta" icon="pi pi-plus" className="p-button-outlined p-button-sm" onClick={() => { setCurrentAccount({ bankId: '', accountNumber: '', accountType: 'CHECKING', alias: '', isActive: true }); setShowAccountModal(true); }} />
              </div>
              <DataTable value={companyAccounts} loading={loading} emptyMessage="No hay cuentas registradas." stripedRows>
                <Column header="Banco" body={(r) => r.bank?.name || 'Desconocido'} className="font-medium" />
                <Column field="alias" header="Alias" className="text-gray-600" />
                <Column field="accountNumber" header="Número de Cuenta" className="font-mono text-gray-600" />
                <Column header="Tipo" body={(r) => r.accountType === 'CHECKING' ? 'Corriente' : 'Ahorros'} />
                <Column header="Estado" body={(r) => r.isActive ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Activa</span> : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Inactiva</span>} />
                <Column header="Acciones" body={(r) => (
                  <div className="flex gap-2">
                    <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => { setCurrentAccount(r); setShowAccountModal(true); }} />
                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteAccount(r.id)} />
                  </div>
                )} style={{ width: '8rem' }} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Plantillas TXT" leftIcon="pi pi-file-excel mr-2">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Motor Generador TXT Bancario</h2>
                <Button label="Crear Plantilla Visual" icon="pi pi-bolt" className="p-button-sm p-button-success" onClick={() => { setCurrentTemplate({ bankId: '', name: '', configJson: { header: [], detail: [], footer: [] } }); setShowTemplateModal(true); }} />
              </div>
              <DataTable value={templates} loading={loading} emptyMessage="No hay plantillas registradas." stripedRows>
                <Column field="name" header="Nombre de la Plantilla" className="font-bold text-indigo-700" />
                <Column header="Banco" body={(r) => r.bank?.name || 'Desconocido'} />
                <Column header="Acciones" body={(r) => (
                  <div className="flex gap-2">
                    <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editTemplate(r)} />
                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteTemplate(r.id)} />
                  </div>
                )} style={{ width: '8rem' }} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Catálogo de Bancos" leftIcon="pi pi-building-columns mr-2">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Directorio de Bancos</h2>
                <Button label="Agregar Banco" icon="pi pi-plus" className="p-button-outlined p-button-sm p-button-secondary" onClick={() => { setCurrentBank({ name: '', code: '' }); setShowBankModal(true); }} />
              </div>
              <DataTable value={banks} loading={loading} emptyMessage="No hay bancos." stripedRows>
                <Column field="code" header="Código" className="font-mono text-indigo-700 font-bold" style={{ width: '8rem' }} />
                <Column field="name" header="Nombre de la Institución" className="font-medium" />
                <Column header="Acciones" body={(r) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteBank(r.id)} />} style={{ width: '6rem' }} />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>

      <Dialog header="Agregar Banco" visible={showBankModal} style={{ width: '400px' }} onHide={() => setShowBankModal(false)}>
        <div className="flex flex-col gap-3 pt-2">
          <InputText value={currentBank.name} onChange={(e) => setCurrentBank({...currentBank, name: e.target.value})} placeholder="Ej. Banesco, Mercantil..." />
          <InputText value={currentBank.code} onChange={(e) => setCurrentBank({...currentBank, code: e.target.value})} placeholder="Código. Ej. 0134" className="font-mono" />
          <div className="flex justify-end gap-2 mt-4"><Button label="Cancelar" text onClick={() => setShowBankModal(false)} /><Button label="Guardar" onClick={saveBank} /></div>
        </div>
      </Dialog>

      <Dialog header={currentAccount.id ? "Editar Cuenta" : "Agregar Cuenta de Empresa"} visible={showAccountModal} style={{ width: '500px' }} onHide={() => setShowAccountModal(false)}>
        <div className="flex flex-col gap-4 pt-2">
          <Dropdown options={banks.map(b => ({label: `${b.name} (${b.code})`, value: b.id}))} value={currentAccount.bankId} onChange={(e) => setCurrentAccount({...currentAccount, bankId: e.value})} placeholder="Banco Asociado" className="w-full" />
          <InputText value={currentAccount.alias || ''} onChange={(e) => setCurrentAccount({...currentAccount, alias: e.target.value})} placeholder="Alias (Opcional)" />
          <InputText value={currentAccount.accountNumber} onChange={(e) => setCurrentAccount({...currentAccount, accountNumber: e.target.value})} placeholder="Número de Cuenta (20 dígitos)" className="font-mono" />
          <div className="flex gap-4">
             <Dropdown options={accountTypes} value={currentAccount.accountType} onChange={(e) => setCurrentAccount({...currentAccount, accountType: e.value})} className="w-full flex-1" />
             <div className="flex flex-col gap-1 items-center justify-center">
               <label className="text-sm font-medium text-gray-700">¿Activa?</label>
               <InputSwitch checked={currentAccount.isActive} onChange={(e) => setCurrentAccount({...currentAccount, isActive: e.value})} />
             </div>
          </div>
          <div className="flex justify-end gap-2 mt-4"><Button label="Cancelar" text onClick={() => setShowAccountModal(false)} /><Button label="Guardar" onClick={saveAccount} /></div>
        </div>
      </Dialog>

      <Dialog header={currentTemplate.id ? "Editar Plantilla TXT" : "Constructor Visual TXT"} visible={showTemplateModal} style={{ width: '90vw', maxWidth: '1200px' }} onHide={() => setShowTemplateModal(false)} maximizable>
        <div className="flex flex-col gap-4 pt-2 w-full">
          
          <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-wrap gap-4 items-end">
             <div className="flex flex-col gap-1 flex-1 min-w-[250px]">
               <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Nombre de la Plantilla</label>
               <InputText value={currentTemplate.name} onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})} placeholder="Ej. Pago Nómina Banesco TXT" className="p-inputtext-lg font-bold" />
             </div>
             <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
               <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Banco Receptor</label>
               <Dropdown options={banks.map(b => ({label: b.name, value: b.id}))} value={currentTemplate.bankId} onChange={(e) => setCurrentTemplate({...currentTemplate, bankId: e.value})} placeholder="Seleccione Banco" className="p-inputtext-lg" />
             </div>
             <div className="flex flex-col gap-1 w-48">
               <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider" title="Dejar vacío para TXT estricto (posicional)">Separador de Columnas</label>
               <Dropdown 
                  editable 
                  options={[
                    { label: 'Sin Separador (TXT Posicional)', value: '' },
                    { label: 'Coma ( , )', value: ',' },
                    { label: 'Punto y Coma ( ; )', value: ';' },
                    { label: 'Tabulador', value: '\t' },
                    { label: 'Pleca ( | )', value: '|' }
                  ]} 
                  value={currentTemplate.configJson.separator || ''} 
                  onChange={(e) => setCurrentTemplate({...currentTemplate, configJson: {...currentTemplate.configJson, separator: e.target.value}})} 
                  className="p-inputtext-lg" 
                  placeholder="Ej. ," 
               />
             </div>
             <Button label="Guardar Plantilla" onClick={saveTemplate} severity="success" className="p-button-lg h-12 shadow-md hover:shadow-lg transition-all" icon="pi pi-check" />
          </div>

          <div className="mt-2">
             <SectionBuilder 
                title="1. Cabecera (Header)" 
                columns={currentTemplate.configJson.header || []} 
                onChange={(cols) => setCurrentTemplate({...currentTemplate, configJson: {...currentTemplate.configJson, header: cols}})} 
             />
             <SectionBuilder 
                title="2. Detalle (Cuerpo / Trabajadores)" 
                columns={currentTemplate.configJson.detail || []} 
                onChange={(cols) => setCurrentTemplate({...currentTemplate, configJson: {...currentTemplate.configJson, detail: cols}})} 
             />
             <SectionBuilder 
                title="3. Pie de Página (Footer / Totales)" 
                columns={currentTemplate.configJson.footer || []} 
                onChange={(cols) => setCurrentTemplate({...currentTemplate, configJson: {...currentTemplate.configJson, footer: cols}})} 
             />
          </div>

        </div>
      </Dialog>
    </AppLayout>
  );
}
