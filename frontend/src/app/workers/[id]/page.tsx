"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AppLayout from "@/components/layout/AppLayout";
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';

import { TabView, TabPanel } from '@/components/ui/TabView';
import WorkerLoansTab from './WorkerLoansTab';
import WorkerTrustsTab from './WorkerTrustsTab';
import WorkerVacationsTab from './WorkerVacationsTab';
import WorkerBankTab from './WorkerBankTab';
import WorkerDocumentGenerator from '@/components/worker/WorkerDocumentGenerator';
import Dialog from '@/components/ui/Dialog';
import Dropdown from '@/components/ui/Dropdown';
import Calendar from '@/components/ui/Calendar';

import api from '@/lib/api';

interface Worker {
  id: string;
  primaryIdentityNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  phone: string | null;
  email: string | null;
  bankName?: string | null;
  bankAccountType?: string | null;
  bankAccountNumber?: string | null;
}

interface FamilyMember {
  id: string;
  fullName: string;
  identityNumber: string | null;
  relationship: string;
  birthDate: string | null;
  workerId: string;
  phone: string | null;
  email: string | null;
}

const workerProfileSchema = yup.object({
  primaryIdentityNumber: yup.string().required('El documento de identidad es requerido').max(50),
  firstName: yup.string().required('El nombre es requerido').max(100),
  lastName: yup.string().required('El apellido es requerido').max(100),
  birthDate: yup.date().required('La fecha de nacimiento es obligatoria').nullable(),
  gender: yup.string().required('Debe seleccionar un género'),
  nationality: yup.string().required('La nacionalidad es requerida').max(50),
  maritalStatus: yup.string().required('Seleccione estado civil'),
  phone: yup.string().nullable().max(50),
  email: yup.string().email('Ingrese un correo válido').nullable().max(150),
}).required();

const familySchema = yup.object({
  fullName: yup.string().required('El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  identityNumber: yup.string().max(50, 'Máximo 50 caracteres').nullable().transform((curr, orig) => orig === '' ? null : curr),
  relationship: yup.string().required('El parentesco es requerido'),
  birthDate: yup.date().nullable(),
  phone: yup.string().nullable().max(50),
  email: yup.string().email('Correo inválido').nullable().max(150),
}).required();

type FamilyFormData = yup.InferType<typeof familySchema>;

const contractSchema = yup.object({
  contractType: yup.string().required('El tipo de contrato es requerido'),
  position: yup.string().required('El cargo es requerido'),
  startDate: yup.date().nullable().required('La fecha de inicio es requerida'),
  endDate: yup.date().nullable().when('contractType', {
    is: (val: string) => val === 'Ocasional' || val === 'Obra',
    then: (schema) => schema.required('La fecha de fin es obligatoria para este tipo'),
    otherwise: (schema) => schema.nullable()
  }),
  initialSalary: yup.number().positive('El salario debe ser mayor a cero').required('El sueldo base es requerido'),
  currency: yup.string().required('La moneda es requerida'),
  payrollGroupId: yup.string().required('El Convenio es obligatorio para calcular nómina'),
  costCenterId: yup.string().required('La Sucursal / Centro de Costo es obligatoria'),
  departmentId: yup.string().required('El Departamento es obligatorio'),
  crewId: yup.string().required('La Guardia / Cuadrilla es obligatoria'),
  isConfidential: yup.boolean().default(false)
}).required();

const transferSchema = yup.object({
  position: yup.string().required('El cargo es requerido'),
  costCenterId: yup.string().required('La Sucursal / Centro de Costo es obligatoria'),
  departmentId: yup.string().required('El Departamento es obligatorio'),
  crewId: yup.string().required('La Guardia / Cuadrilla es obligatoria')
}).required();

const fixedConceptSchema = yup.object({
  employmentRecordId: yup.string().required('Debe seleccionar el contrato al que asocia el concepto'),
  conceptId: yup.string().required('Seleccione un concepto'),
  amount: yup.number().positive('Monto inválido').required('El monto es requerido'),
  currency: yup.string().required('Moneda requerida'),
  validFrom: yup.date().nullable().required('Fecha de inicio requerida'),
  validTo: yup.date().nullable()
}).required();

const salarySchema = yup.object({
  amount: yup.number().positive('Monto inválido').required('El nuevo salario es requerido'),
  currency: yup.string().required('Debe elegir una moneda'),
  validFrom: yup.date().nullable().required('Fecha de inicio (vigencia) requerida')
}).required();

const relationshipOptions = [
  { label: 'Hijo/a', value: 'Hijo/a' },
  { label: 'Cónyuge', value: 'Cónyuge' },
  { label: 'Madre', value: 'Madre' },
  { label: 'Padre', value: 'Padre' },
  { label: 'Otro', value: 'Otro' }
];

const contractTypeOptions = [
  { label: 'Tiempo Indeterminado (Fijo)', value: 'Fijo' },
  { label: 'Tiempo Determinado (Ocasional)', value: 'Ocasional' },
  { label: 'Por Obra Determinada', value: 'Obra' }
];

const currencyOptions = [
  { label: 'Bolívares (VES)', value: 'VES' },
  { label: 'Dólares (USD)', value: 'USD' }
];

const genderOptions = [
  { label: 'Masculino', value: 'Masculino' },
  { label: 'Femenino', value: 'Femenino' },
  { label: 'Otro', value: 'Otro' }
];

const maritalOptions = [
  { label: 'Soltero/a', value: 'Soltero' },
  { label: 'Casado/a', value: 'Casado' },
  { label: 'Divorciado/a', value: 'Divorciado' },
  { label: 'Viudo/a', value: 'Viudo' }
];

export default function WorkerProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [payrollGroups, setPayrollGroups] = useState<any[]>([]);
  const [costCenterList, setCostCenterList] = useState<any[]>([]);
  const [fixedConcepts, setFixedConcepts] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [nationalityOptions, setNationalityOptions] = useState<any[]>([{ label: 'Venezolano', value: 'Venezolano' }, { label: 'Extranjero', value: 'Extranjero' }]);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showFixedDialog, setShowFixedDialog] = useState(false);
  const [activeContractId, setActiveContractId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingContract, setIsSubmittingContract] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [isSubmittingFixed, setIsSubmittingFixed] = useState(false);
  
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [isSubmittingSalary, setIsSubmittingSalary] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workerRes, familyRes, contractsRes, groupsRes, costCentersRes, fixedConceptsRes, conceptsRes, catalogsRes] = await Promise.all([
        api.get(`/workers/${id}`),
        api.get(`/family-members?workerId=${id}`),
        api.get(`/employment-records?workerId=${id}`),
        api.get(`/payroll-groups`),
        api.get('/cost-centers'),
        api.get(`/worker-fixed-concepts?workerId=${id}`),
        api.get('/concepts'),
        api.get('/general-catalogs?category=NATIONALITY').catch(() => ({ data: [] }))
      ]);
      setWorker(workerRes.data);
      setFamilyMembers(familyRes.data);
      setContracts(contractsRes.data);
      setPayrollGroups(groupsRes.data.map((g: any) => ({ label: g.name, value: g.id })));
      setCostCenterList(costCentersRes.data);
      setFixedConcepts(fixedConceptsRes.data);
      setConcepts(conceptsRes.data.map((c: any) => ({ label: `${c.code} - ${c.name}`, value: c.id })));
      if (catalogsRes && catalogsRes.data && catalogsRes.data.length > 0) {
        setNationalityOptions(catalogsRes.data.map((item: any) => ({ label: item.value, value: item.value })));
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudo cargar el perfil del trabajador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: yupResolver(workerProfileSchema) as any,
    defaultValues: { primaryIdentityNumber: '', firstName: '', lastName: '', gender: '', nationality: '', maritalStatus: '', phone: '', email: '', birthDate: null as any }
  });

  const onEditProfile = async (data: any) => {
    try {
      setIsSubmittingProfile(true);
      const payload = {
        ...data,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined
      };
      await api.patch(`/workers/${id}`, payload);
      setShowEditProfileDialog(false);
      loadData();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al actualizar los datos.');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const openEditProfile = () => {
    if (worker) {
      resetProfile({
        ...worker,
        birthDate: worker.birthDate ? new Date(worker.birthDate.split('T')[0] + 'T00:00:00') : null as any,
        phone: worker.phone || '',
        email: worker.email || ''
      });
      setShowEditProfileDialog(true);
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(familySchema) as any,
    defaultValues: {
      fullName: '',
      identityNumber: '',
      relationship: 'Hijo/a',
      birthDate: null,
      phone: '',
      email: ''
    }
  });

  const onAddFamilyMember = async (data: any) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        workerId: id,
        birthDate: data.birthDate ? (data.birthDate as Date).toISOString() : null
      };

      await api.post('/family-members', payload);
      
      setShowDialog(false);
      reset();
      
      // Reload family table
      const familyRes = await api.get(`/family-members?workerId=${id}`);
      setFamilyMembers(familyRes.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Hubo un error al registrar el familiar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    control: contractControl,
    handleSubmit: handleContractSubmit,
    reset: resetContract,
    formState: { errors: contractErrors }
  } = useForm({
    resolver: yupResolver(contractSchema) as any,
    defaultValues: {
      contractType: 'Fijo',
      position: '',
      startDate: null as any,
      endDate: null as any,
      initialSalary: 0,
      currency: 'VES',
      payrollGroupId: '',
      costCenterId: '',
      departmentId: '',
      crewId: '',
      isConfidential: false
    }
  });

  const selectedContractType = useWatch({ control: contractControl, name: 'contractType' });
  const selectedCostCenterId = useWatch({ control: contractControl, name: 'costCenterId' });
  const selectedDepartmentId = useWatch({ control: contractControl, name: 'departmentId' });

  const costCenterOptions = costCenterList.map((cc) => ({ label: cc.name, value: cc.id }));
  const selectedCostCenter = costCenterList.find((cc) => cc.id === selectedCostCenterId);
  const departmentOptions = selectedCostCenter ? selectedCostCenter.departments.map((d: any) => ({ label: d.name, value: d.id })) : [];
  const selectedDepartment = selectedCostCenter?.departments.find((d: any) => d.id === selectedDepartmentId);
  const crewOptions = selectedDepartment ? selectedDepartment.crews.map((c: any) => ({ label: c.name, value: c.id })) : [];

  const onAddContract = async (data: any) => {
    try {
      setIsSubmittingContract(true);
      const payload = {
        ...data,
        workerId: id,
        startDate: data.startDate ? (data.startDate as Date).toISOString() : null,
        endDate: data.endDate ? (data.endDate as Date).toISOString() : null
      };

      await api.post('/employment-records', payload);
      
      setShowContractDialog(false);
      resetContract();
      
      const contractsRes = await api.get(`/employment-records?workerId=${id}`);
      setContracts(contractsRes.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Hubo un error al registrar el contrato.');
    } finally {
      setIsSubmittingContract(false);
    }
  };

  const {
    control: transferControl,
    handleSubmit: handleTransferSubmit,
    reset: resetTransfer,
    setValue: setTransferValue,
    formState: { errors: transferErrors }
  } = useForm({
    resolver: yupResolver(transferSchema) as any,
    defaultValues: {
      position: '',
      costCenterId: '',
      departmentId: '',
      crewId: ''
    }
  });

  const selectedTransferCostCenterId = useWatch({ control: transferControl, name: 'costCenterId' });
  const selectedTransferDepartmentId = useWatch({ control: transferControl, name: 'departmentId' });

  const transferDepartmentOptions = costCenterList.find((cc) => cc.id === selectedTransferCostCenterId)?.departments.map((d: any) => ({ label: d.name, value: d.id })) || [];
  const transferCrewOptions = costCenterList.find((cc) => cc.id === selectedTransferCostCenterId)?.departments.find((d: any) => d.id === selectedTransferDepartmentId)?.crews.map((c: any) => ({ label: c.name, value: c.id })) || [];

  const openTransferModal = (record: any) => {
    setActiveContractId(record.id);
    resetTransfer({
      position: record.position,
      costCenterId: record.costCenterId || '',
      departmentId: record.departmentId || '',
      crewId: record.crewId || ''
    });
    setShowTransferDialog(true);
  };

  const onTransfer = async (data: any) => {
    try {
      setIsSubmittingTransfer(true);
      await api.patch(`/employment-records/${activeContractId}/transfer`, data);
      
      setShowTransferDialog(false);
      
      // Reload contracts
      const contractsRes = await api.get(`/employment-records?workerId=${id}`);
      setContracts(contractsRes.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Hubo un error al transferir al trabajador.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const toggleConfidentiality = async (recordId: string, isConfidential: boolean) => {
    if (confirm(`¿Está seguro que desea ${isConfidential ? 'hacer confidencial' : 'quitar confidencialidad'} a este contrato?`)) {
      try {
        await api.patch(`/employment-records/${recordId}/confidentiality`, { isConfidential });
        const contractsRes = await api.get(`/employment-records?workerId=${id}`);
        setContracts(contractsRes.data);
      } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || 'Hubo un error al actualizar la confidencialidad.');
      }
    }
  };

  const {
    control: fixedControl,
    handleSubmit: handleFixedSubmit,
    reset: resetFixed,
    formState: { errors: fixedErrors }
  } = useForm({
    resolver: yupResolver(fixedConceptSchema) as any,
    defaultValues: {
      employmentRecordId: '',
      conceptId: '',
      amount: 0,
      currency: 'USD',
      validFrom: null as any,
      validTo: null as any
    }
  });

  const onAddFixedConcept = async (data: any) => {
    try {
      setIsSubmittingFixed(true);
      const payload = {
        ...data,
        validFrom: data.validFrom ? (data.validFrom as Date).toISOString() : null,
        validTo: data.validTo ? (data.validTo as Date).toISOString() : null
      };

      await api.post('/worker-fixed-concepts', payload);
      
      setShowFixedDialog(false);
      resetFixed();
      
      const fixedRes = await api.get(`/worker-fixed-concepts?workerId=${id}`);
      setFixedConcepts(fixedRes.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Hubo un error al registrar el concepto fijo.');
    } finally {
      setIsSubmittingFixed(false);
    }
  };

  const {
    control: salaryControl,
    handleSubmit: handleSalarySubmit,
    reset: resetSalary,
    formState: { errors: salaryErrors }
  } = useForm({
    resolver: yupResolver(salarySchema) as any,
    defaultValues: { amount: 0, currency: 'USD', validFrom: null as any }
  });

  const onAddSalary = async (data: any) => {
    try {
      setIsSubmittingSalary(true);
      const payload = {
        amount: data.amount,
        currency: data.currency,
        validFrom: data.validFrom ? (data.validFrom as Date).toISOString() : null
      };
      await api.post(`/employment-records/${activeContractId}/salary`, payload);
      
      setShowSalaryDialog(false);
      resetSalary();
      
      const contractsRes = await api.get(`/employment-records?workerId=${id}`);
      setContracts(contractsRes.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Hubo un error al registrar el nuevo salario.');
    } finally {
      setIsSubmittingSalary(false);
    }
  };

  const activeContract = contracts.find(c => c.isActive) || contracts[0];
  const hasActiveContract = contracts.some(c => c.isActive);
  const salaryHistories = activeContract ? activeContract.salaryHistories || [] : [];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="flex justify-center items-center h-48"><span className="text-gray-500 font-medium">Cargando...</span></div>
        </div>
      </AppLayout>
    );
  }

  if (!worker) {
    return (
      <AppLayout>
        <Message severity="error" text={errorMsg || "Trabajador no encontrado"} />
      </AppLayout>
    );
  }

  const renderHeader = () => (
    <div className="flex justify-between items-center">
      <h3 className="m-0 text-lg font-semibold text-gray-800">Carga Familiar Actual</h3>
      <Button 
        label="Añadir Familiar" 
        icon="pi pi-plus" 
        onClick={() => { reset(); setShowDialog(true); }}
        className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 px-4 py-2 font-semibold transition-colors"
      />
    </div>
  );

  const renderContractHeader = () => (
    <div className="flex justify-between items-center">
      <h3 className="m-0 text-lg font-semibold text-gray-800">Historial de Contratación</h3>
      <Button 
        label="Nuevo Contrato" 
        icon="pi pi-plus" 
        onClick={() => { resetContract(); setShowContractDialog(true); }}
        className={`bg-teal-600 border-teal-600 px-4 py-2 font-semibold transition-colors text-white ${hasActiveContract ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'}`}
        disabled={hasActiveContract}
        tooltip={hasActiveContract ? "El trabajador ya posee un contrato activo" : ""}
        tooltipOptions={{ position: 'top' }}
        unstyled
      />
    </div>
  );

  const renderSalaryHeader = () => (
    <div className="flex justify-between items-center">
      <h3 className="m-0 text-lg font-semibold text-gray-800">Histórico de Salarios Base</h3>
      {(user?.permissions?.includes('ALL_ACCESS') || user?.permissions?.includes('SALARY_EDIT')) && (
      <Button 
        label="Nuevo Sueldo / Aumento" 
        icon="pi pi-arrow-up" 
        onClick={() => { 
          if(activeContract) setActiveContractId(activeContract.id);
          resetSalary(); 
          setShowSalaryDialog(true); 
        }}
        className="bg-green-600 hover:bg-green-700 border-green-600 px-4 py-2 font-semibold transition-colors text-white"
        unstyled
        disabled={!activeContract || !activeContract.isActive}
      />
      )}
    </div>
  );

  const renderFixedHeader = () => (
    <div className="flex justify-between items-center">
      <h3 className="m-0 text-lg font-semibold text-gray-800">Conceptos y Asignaciones Fijas</h3>
      <Button 
        label="Nueva Asignación" 
        icon="pi pi-plus" 
        onClick={() => { resetFixed(); setShowFixedDialog(true); }}
        className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 px-4 py-2 font-semibold transition-colors text-white"
        unstyled
      />
    </div>
  );

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">Finiquitado / Inactivo</span>;
    if (status === 'ON_VACATION') return <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">De Vacaciones</span>;
    if (status === 'SUSPENDED') return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">Suspendido</span>;
    return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">Activo</span>;
  };

  return (
    <AppLayout>
      <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Banner de Cabecera */}
        <div className="flex items-center gap-4 mb-2">
          <Button 
            icon="pi pi-arrow-left" 
            rounded 
            text 
            severity="secondary" 
            aria-label="Volver" 
            onClick={() => router.push('/workers')}
          />
          <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-2xl font-bold">
                {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 m-0">{worker.firstName} {worker.lastName}</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold uppercase">{worker.primaryIdentityNumber}</span>
                  <span><i className="pi pi-briefcase mr-1 text-xs"></i> Nómina Activa</span>
                  <Button icon="pi pi-pencil" rounded text severity="secondary" tooltip="Editar Datos Personales" className="ml-2 w-8 h-8 p-0" onClick={openEditProfile} />
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex gap-3">
              <WorkerDocumentGenerator workerId={id as string} />
            </div>
          </div>
        </div>

        {/* Paneles de Contenido */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-full min-w-0">
          <TabView className="CustomTabView" pt={{ 
            root: { className: 'w-full flex flex-col min-w-0' },
            nav: { className: 'flex flex-row overflow-x-auto md:flex-wrap bg-slate-50 border-b border-slate-100' },
            // action property moved or removed for TS compatibility
            panelContainer: { className: 'p-0 text-gray-700 w-full overflow-x-hidden' } 
          }}>
            
            <TabPanel header="Datos Personales" leftIcon="pi pi-user mr-2">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nombres</div>
                  <div className="font-medium text-gray-800">{worker.firstName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Apellidos</div>
                  <div className="font-medium text-gray-800">{worker.lastName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cédula de Identidad</div>
                  <div className="font-medium text-gray-800">{worker.primaryIdentityNumber}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nacionalidad</div>
                  <div className="font-medium text-gray-800">{worker.nationality}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Fecha de Nacimiento</div>
                  <div className="font-medium text-gray-800">{worker.birthDate ? new Date(worker.birthDate.split('T')[0] + 'T00:00:00').toLocaleDateString('es-ES') : '-'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Género</div>
                  <div className="font-medium text-gray-800">{worker.gender}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Estado Civil</div>
                  <div className="font-medium text-gray-800">{worker.maritalStatus}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Teléfono</div>
                  <div className="font-medium text-gray-800">{worker.phone || <span className="text-gray-400 italic">No registrado</span>}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Correo Electrónico</div>
                  <div className="font-medium text-gray-800">{worker.email || <span className="text-gray-400 italic">No registrado</span>}</div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Cuenta Bancaria" leftIcon="pi pi-building-columns mr-2">
              <WorkerBankTab worker={worker} onUpdate={loadData} />
            </TabPanel>

            <TabPanel header="Fideicomiso" leftIcon="pi pi-wallet mr-2">
                <WorkerTrustsTab contracts={contracts} />
              </TabPanel>

              <TabPanel header="Vacaciones" leftIcon="pi pi-sun mr-2">
                <WorkerVacationsTab contracts={contracts} />
              </TabPanel>
            
            <TabPanel header="Carga Familiar" leftIcon="pi pi-users mr-2">
              <div className="p-0 overflow-x-auto w-full">
                <DataTable 
                  value={familyMembers} 
                  header={renderHeader()}
                  emptyMessage="No hay familiares registrados."
                  stripedRows
                  className="border-none"
                >
                  <Column field="fullName" header="Nombre Completo" />
                  <Column field="relationship" header="Parentesco" />
                  <Column field="identityNumber" header="Nro. Identidad" body={(r) => r.identityNumber || <span className="text-gray-400 italic">No aplica</span>} />
                  <Column field="birthDate" header="Nacimiento" body={(r) => r.birthDate ? new Date(r.birthDate.split('T')[0] + 'T00:00:00').toLocaleDateString('es-ES') : '-'} />
                  <Column field="phone" header="Teléfono" body={(r) => r.phone || <span className="text-gray-400 italic">N/A</span>} />
                  <Column field="email" header="Correo" body={(r) => r.email || <span className="text-gray-400 italic">N/A</span>} />
                  <Column header="" body={() => <Button icon="pi pi-trash" rounded text severity="danger" />} style={{ width: '4rem' }} />
                </DataTable>
              </div>
            </TabPanel>
            
            <TabPanel header="Contratos y Salarios" leftIcon="pi pi-file mr-2">
              <div className="p-0 overflow-x-auto w-full">
                <DataTable 
                  value={contracts} 
                  header={renderContractHeader()}
                  emptyMessage="No hay historial de contratos registrados."
                  stripedRows
                  className="border-none"
                >
                  <Column field="position" header="Cargo" />
                  <Column header="Área / Organización" body={(r) => r.costCenter ? (
                    <div className="flex flex-col">
                      <span className="font-semibold text-indigo-700 text-sm">{r.costCenter.name}</span>
                      <span className="text-xs text-gray-500">{r.department?.name} {r.crew ? `• ${r.crew.name}` : ''}</span>
                    </div>
                  ) : <span className="text-gray-400 italic">No asignada</span>} />
                  <Column field="payrollGroup.name" header="Convenio" body={(r) => r.payrollGroup?.name || <span className="text-red-400 italic font-medium">Sin Convenio</span>} />
                  <Column field="contractType" header="Tipo de Contrato" />
                  <Column field="startDate" header="Inicio de Contrato" body={(r) => new Date(r.startDate).toLocaleDateString('es-ES')} />
                  <Column field="status" header="Estatus" body={(r) => getStatusBadge(r.status, r.isActive)} />
                  <Column header="Privacidad" body={(r) => r.isConfidential ? <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap"><i className="pi pi-lock text-[10px] mr-1"></i> Confidencial</span> : <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">Regular</span>} />
                  <Column field="initialSalary" header="Sueldo Base" body={(r) => r.salaryHistories?.[0] ? `$${Number(r.salaryHistories[0].amount).toFixed(2)}` : 'N/A'} />
                  <Column header="" body={(r) => (
                    <div className="flex gap-1 justify-end">
                      <Button icon={r.isConfidential ? "pi pi-lock-open" : "pi pi-lock"} severity={r.isConfidential ? "danger" : "secondary"} text rounded tooltip={r.isConfidential ? "Quitar Privacidad" : "Blindar"} tooltipOptions={{ position: 'top' }} onClick={() => toggleConfidentiality(r.id, !r.isConfidential)} />
                      {r.isActive ? <Button icon="pi pi-directions" tooltip="Transferir" tooltipOptions={{ position: 'top' }} rounded text severity="info" onClick={() => openTransferModal(r)} /> : null}
                    </div>
                  )} style={{ width: '7rem' }} />
                </DataTable>
              </div>
            </TabPanel>

            <TabPanel header="Histórico Salarial" leftIcon="pi pi-chart-line mr-2">
              <div className="p-0 overflow-x-auto w-full">
                <DataTable 
                  value={salaryHistories} 
                  header={renderSalaryHeader()}
                  emptyMessage="No hay histórico salarial registrado."
                  stripedRows
                  className="border-none"
                >
                  <Column field="amount" header="Monto del Salario" body={(r) => <span className="text-green-600 font-bold font-mono text-[1.1rem]">{Number(r.amount).toLocaleString('en-US', {minimumFractionDigits: 2})} {r.currency}</span>} />
                  <Column header="Vigencia Desde" body={(r) => <span className="font-semibold text-gray-700"><i className="pi pi-calendar-plus text-xs mr-2 text-indigo-400"></i>{new Date(r.validFrom).toLocaleDateString('es-ES')}</span>} />
                  <Column header="Vigencia Hasta" body={(r) => r.validTo ? <span className="text-gray-500"><i className="pi pi-calendar-times text-xs mr-2"></i>{new Date(r.validTo).toLocaleDateString('es-ES')}</span> : <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">Actual / Permanente</span>} />
                </DataTable>
              </div>
            </TabPanel>

            <TabPanel header="Conceptos/Asignaciones" leftIcon="pi pi-dollar mr-2">
              <div className="p-0 overflow-x-auto w-full">
                <DataTable 
                  value={fixedConcepts} 
                  header={renderFixedHeader()}
                  emptyMessage="No hay conceptos fijos asignados."
                  stripedRows
                  className="border-none"
                >
                  <Column field="concept.name" header="Concepto" body={(r) => <span className="font-semibold">{r.concept?.code} - {r.concept?.name}</span>} />
                  <Column field="amount" header="Monto Fijo" body={(r) => <span className={r.currency === 'USD' ? 'text-green-600 font-bold' : 'text-blue-600 font-bold'}>{Number(r.amount).toLocaleString('en-US', {minimumFractionDigits: 2})} {r.currency}</span>} />
                  <Column header="Vigencia" body={(r) => (
                    <span className="text-sm text-gray-600">
                      Desde: {new Date(r.validFrom).toLocaleDateString('es-ES')} <br/>
                      Hasta: {r.validTo ? new Date(r.validTo).toLocaleDateString('es-ES') : 'Permanente'}
                    </span>
                  )} />
                  <Column header="" body={(r) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={async () => {
                     if (confirm("¿Eliminar esta asignación?")) {
                       await api.delete(`/worker-fixed-concepts/${r.id}`);
                       const fixedRes = await api.get(`/worker-fixed-concepts?workerId=${id}`);
                       setFixedConcepts(fixedRes.data);
                     }
                  }} />} style={{ width: '4rem' }} />
                </DataTable>
              </div>
            </TabPanel>

            <TabPanel header="Préstamos / Adelantos" leftIcon="pi pi-wallet mr-2">
              <div className="p-4 bg-gray-50/50 min-h-[400px]">
                <WorkerLoansTab workerId={id as string} hasActiveContract={contracts.some((c: any) => c.isActive)} />
              </div>
            </TabPanel>

          </TabView>
        </div>
      </div>

      {/* Modal Añadir Familiar */}
      <Dialog 
        header="Anexar Familiar Dependiente" 
        visible={showDialog} 
        style={{ width: '90vw', maxWidth: '600px' }} 
        onHide={() => setShowDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleSubmit(onAddFamilyMember)} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Nombre Completo <span className="text-red-500">*</span></label>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <InputText {...field} className={`w-full ${errors.fullName ? 'p-invalid' : ''}`} />
                )}
              />
              {errors.fullName && <small className="text-red-500">{errors.fullName.message}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Documento Identidad <span className="text-gray-400 font-normal">(opcional)</span></label>
              <Controller
                name="identityNumber"
                control={control}
                render={({ field }) => (
                  <InputText {...field} value={field.value || ''} className="w-full" />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Teléfono <span className="text-gray-400 font-normal">(opcional)</span></label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <InputText {...field} value={field.value || ''} placeholder="Ej. +58 414-0000000" className={`w-full ${errors.phone ? 'p-invalid' : ''}`} />
                )}
              />
              {errors.phone && <small className="text-red-500">{errors.phone.message}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Correo Electrónico <span className="text-gray-400 font-normal">(opcional)</span></label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputText {...field} value={field.value || ''} placeholder="ejemplo@correo.com" className={`w-full ${errors.email ? 'p-invalid' : ''}`} />
                )}
              />
              {errors.email && <small className="text-red-500">{errors.email.message}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Parentesco <span className="text-red-500">*</span></label>
              <Controller
                name="relationship"
                control={control}
                render={({ field }) => (
                  <Dropdown {...field} options={relationshipOptions} className={`w-full ${errors.relationship ? 'p-invalid' : ''}`} />
                )}
              />
              {errors.relationship && <small className="text-red-500">{errors.relationship.message}</small>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento <span className="text-gray-400 font-normal">(recomendado)</span></label>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <Calendar 
                    value={(field.value as any) || null} 
                    onChange={e => field.onChange(e.value)} 
                    dateFormat="dd/mm/yy" 
                    showIcon 
                    className="w-full"
                  />
                )}
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" onClick={() => setShowDialog(false)} unstyled className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors" />
            <Button type="submit" label="Guardar Familiar" icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"} disabled={isSubmitting} unstyled className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-semibold border border-indigo-600 rounded-lg transition-colors flex items-center gap-2" />
          </div>
        </form>
      </Dialog>

      {/* Modal Añadir Contrato */}
      <Dialog 
        header="Registrar Nuevo Contrato" 
        visible={showContractDialog} 
        style={{ width: '90vw', maxWidth: '600px' }} 
        onHide={() => setShowContractDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleContractSubmit(onAddContract)} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Cargo de Desempeño <span className="text-red-500">*</span></label>
              <Controller
                name="position"
                control={contractControl}
                render={({ field }) => (
                  <InputText {...field} className={`w-full ${contractErrors.position ? 'p-invalid' : ''}`} />
                )}
              />
              {contractErrors.position && <small className="text-red-500">{contractErrors.position.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Contrato <span className="text-red-500">*</span></label>
              <Controller
                name="contractType"
                control={contractControl}
                render={({ field }) => (
                  <Dropdown {...field} options={contractTypeOptions} className={`w-full ${contractErrors.contractType ? 'p-invalid' : ''}`} />
                )}
              />
              {contractErrors.contractType && <small className="text-red-500">{contractErrors.contractType.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Convenio (Grupo de Nómina) <span className="text-red-500">*</span></label>
              <Controller
                name="payrollGroupId"
                control={contractControl}
                render={({ field }) => (
                  <Dropdown {...field} options={payrollGroups} placeholder="Seleccione grupo..." className={`w-full ${contractErrors.payrollGroupId ? 'p-invalid' : ''}`} />
                )}
              />
              {contractErrors.payrollGroupId && <small className="text-red-500">{contractErrors.payrollGroupId.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Sucursal / Centro Costo <span className="text-red-500">*</span></label>
              <Controller
                name="costCenterId"
                control={contractControl}
                render={({ field }) => (
                  <Dropdown {...field} options={costCenterOptions} placeholder="Seleccione sucursal..." className={`w-full ${contractErrors.costCenterId ? 'p-invalid' : ''}`} />
                )}
              />
              {contractErrors.costCenterId && <small className="text-red-500">{contractErrors.costCenterId.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Departamento <span className="text-red-500">*</span></label>
              <Controller
                name="departmentId"
                control={contractControl}
                render={({ field }) => (
                  <Dropdown {...field} options={departmentOptions} disabled={!selectedCostCenterId} placeholder="Seleccione dpto..." className={`w-full ${contractErrors.departmentId ? 'p-invalid' : ''}`} />
                )}
              />
              {contractErrors.departmentId && <small className="text-red-500">{contractErrors.departmentId.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Guardia / Cuadrilla <span className="text-red-500">*</span></label>
              <Controller
                name="crewId"
                control={contractControl}
                render={({ field }) => (
                  <Dropdown {...field} options={crewOptions} disabled={!selectedDepartmentId} placeholder="Seleccione cuadrilla..." className={`w-full ${contractErrors.crewId ? 'p-invalid' : ''}`} />
                )}
              />
              {contractErrors.crewId && <small className="text-red-500">{contractErrors.crewId.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha de Inicio <span className="text-red-500">*</span></label>
              <Controller
                name="startDate"
                control={contractControl}
                render={({ field }) => (
                  <Calendar 
                    value={(field.value as any) || null} 
                    onChange={e => field.onChange(e.value)} 
                    dateFormat="dd/mm/yy" 
                    showIcon 
                    className="w-full"
                  />
                )}
              />
              {contractErrors.startDate && <small className="text-red-500">{contractErrors.startDate.message as string}</small>}
            </div>

            {selectedContractType !== 'Fijo' && (
              <div className="flex flex-col gap-2 relative transition-all duration-300 transform origin-top w-full">
                <label className="text-sm font-medium text-gray-700">Fecha de Fin <span className="text-red-500">*</span></label>
                <Controller
                  name="endDate"
                  control={contractControl}
                  render={({ field }) => (
                    <Calendar 
                      value={(field.value as any) || null} 
                      onChange={e => field.onChange(e.value)} 
                      dateFormat="dd/mm/yy" 
                      showIcon 
                      className={`w-full ${contractErrors.endDate ? 'p-invalid' : ''}`}
                    />
                  )}
                />
                {contractErrors.endDate && <small className="text-red-500">{contractErrors.endDate.message as string}</small>}
              </div>
            )}
            
            <div className="flex flex-col gap-2 md:col-span-2 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-800">Sueldo Base Inicial <span className="text-red-500">*</span></label>
                    <Controller
                      name="initialSalary"
                      control={contractControl}
                      render={({ field }) => (
                        <InputText 
                            id={field.name}
                            {...field} 
                            value={field.value?.toString() || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            type="number" step="0.01" 
                            className={`w-full font-bold text-lg text-green-700 mt-2 ${contractErrors.initialSalary ? 'p-invalid' : ''}`} 
                        />
                      )}
                    />
                    {contractErrors.initialSalary && <small className="text-red-500">{contractErrors.initialSalary.message as string}</small>}
                  </div>
                  <div className="w-48">
                    <label className="text-sm font-medium text-gray-800">Moneda <span className="text-red-500">*</span></label>
                    <Controller
                      name="currency"
                      control={contractControl}
                      render={({ field }) => (
                        <Dropdown {...field} options={currencyOptions} className={`w-full font-bold mt-2 ${contractErrors.currency ? 'p-invalid' : ''}`} />
                      )}
                    />
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2">
              <label className="text-sm font-medium text-gray-700">Privacidad y Accesos</label>
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <Controller
                  name="isConfidential"
                  control={contractControl}
                  render={({ field }) => (
                    <InputSwitch inputId="isConfidential" checked={field.value} onChange={(e) => field.onChange(e.value)} />
                  )}
                />
                <div>
                  <div className="font-semibold text-red-800 text-sm">Nómina Confidencial</div>
                  <div className="text-xs text-red-600">Al activar, este contrato, salarios y recibos de nómina estarán bloqueados y ocultos para los analistas básicos.</div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" onClick={() => setShowContractDialog(false)} unstyled className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors" />
            <Button type="submit" label="Firmar Contrato" icon={isSubmittingContract ? "pi pi-spin pi-spinner" : "pi pi-pencil"} disabled={isSubmittingContract} unstyled className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 font-semibold border border-teal-600 rounded-lg transition-colors flex items-center gap-2" />
          </div>
        </form>
      </Dialog>

      {/* Modal Transferir / Mover Trabajador */}
      <Dialog 
        header="Transferencia / Movimiento Organizacional" 
        visible={showTransferDialog} 
        style={{ width: '90vw', maxWidth: '500px' }} 
        onHide={() => setShowTransferDialog(false)}
        className="font-sans"
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <i className="pi pi-info-circle mr-2"></i>
          Al transferir a un trabajador organizativamente, su Contrato y Sueldo Base actual siguen vigentes. Solo cambia su lugar de trabajo/cargo.
        </div>
        <form onSubmit={handleTransferSubmit(onTransfer)} className="space-y-4 pt-2">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nuevo Cargo Desempeñado <span className="text-red-500">*</span></label>
            <Controller
              name="position"
              control={transferControl}
              render={({ field }) => (
                <InputText {...field} className={`w-full ${transferErrors.position ? 'p-invalid' : ''}`} />
              )}
            />
            {transferErrors.position && <small className="text-red-500">{transferErrors.position.message as string}</small>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nueva Sucursal / C.C. <span className="text-red-500">*</span></label>
            <Controller
              name="costCenterId"
              control={transferControl}
              render={({ field }) => (
                <Dropdown {...field} options={costCenterOptions} placeholder="Seleccione sucursal..." className={`w-full ${transferErrors.costCenterId ? 'p-invalid' : ''}`} />
              )}
            />
            {transferErrors.costCenterId && <small className="text-red-500">{transferErrors.costCenterId.message as string}</small>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nuevo Departamento <span className="text-red-500">*</span></label>
            <Controller
              name="departmentId"
              control={transferControl}
              render={({ field }) => (
                <Dropdown {...field} options={transferDepartmentOptions} disabled={!selectedTransferCostCenterId} placeholder="Seleccione dpto..." className={`w-full ${transferErrors.departmentId ? 'p-invalid' : ''}`} />
              )}
            />
            {transferErrors.departmentId && <small className="text-red-500">{transferErrors.departmentId.message as string}</small>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nueva Guardia / Cuadrilla <span className="text-red-500">*</span></label>
            <Controller
              name="crewId"
              control={transferControl}
              render={({ field }) => (
                <Dropdown {...field} options={transferCrewOptions} disabled={!selectedTransferDepartmentId} placeholder="Seleccione cuadrilla..." className={`w-full ${transferErrors.crewId ? 'p-invalid' : ''}`} />
              )}
            />
            {transferErrors.crewId && <small className="text-red-500">{transferErrors.crewId.message as string}</small>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" onClick={() => setShowTransferDialog(false)} unstyled className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors" />
            <Button type="submit" label="Aplicar Transferencia" icon={isSubmittingTransfer ? "pi pi-spin pi-spinner" : "pi pi-directions"} disabled={isSubmittingTransfer} unstyled className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-semibold border border-blue-600 rounded-lg transition-colors flex items-center gap-2" />
          </div>
        </form>
      </Dialog>

      {/* Modal Añadir Concepto Fijo */}
      <Dialog 
        header="Asignar Concepto Fijo / Novedad" 
        visible={showFixedDialog} 
        style={{ width: '90vw', maxWidth: '600px' }} 
        onHide={() => setShowFixedDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleFixedSubmit(onAddFixedConcept)} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Contrato Asociado <span className="text-red-500">*</span></label>
              <Controller
                name="employmentRecordId"
                control={fixedControl}
                render={({ field }) => (
                  <Dropdown {...field} options={contracts.map(c => ({ label: `${c.position} (${c.isActive ? 'Vigente' : 'Inactivo'})`, value: c.id }))} placeholder="Seleccione contrato..." className={`w-full ${fixedErrors.employmentRecordId ? 'p-invalid' : ''}`} />
                )}
              />
              {fixedErrors.employmentRecordId && <small className="text-red-500">{fixedErrors.employmentRecordId.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Concepto / Novedad <span className="text-red-500">*</span></label>
              <Controller
                name="conceptId"
                control={fixedControl}
                render={({ field }) => (
                  <Dropdown {...field} options={concepts} filter placeholder="Buscar concepto..." className={`w-full ${fixedErrors.conceptId ? 'p-invalid' : ''}`} />
                )}
              />
              {fixedErrors.conceptId && <small className="text-red-500">{fixedErrors.conceptId.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Monto del Concepto <span className="text-red-500">*</span></label>
              <Controller
                name="amount"
                control={fixedControl}
                render={({ field }) => (
                  <InputText 
                      {...field} 
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      type="number" step="0.01" 
                      className={`w-full font-bold text-lg ${fixedErrors.amount ? 'p-invalid' : ''}`} 
                  />
                )}
              />
              {fixedErrors.amount && <small className="text-red-500">{fixedErrors.amount.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Moneda <span className="text-red-500">*</span></label>
              <Controller
                name="currency"
                control={fixedControl}
                render={({ field }) => (
                  <Dropdown {...field} options={currencyOptions} className={`w-full font-bold ${fixedErrors.currency ? 'p-invalid' : ''}`} />
                )}
              />
              {fixedErrors.currency && <small className="text-red-500">{fixedErrors.currency.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Válido Desde <span className="text-red-500">*</span></label>
              <Controller
                name="validFrom"
                control={fixedControl}
                render={({ field }) => (
                  <Calendar value={(field.value as any) || null} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                )}
              />
              {fixedErrors.validFrom && <small className="text-red-500">{fixedErrors.validFrom.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Válido Hasta <span className="text-gray-400 font-normal">(Opcional)</span></label>
              <Controller
                name="validTo"
                control={fixedControl}
                render={({ field }) => (
                  <Calendar value={(field.value as any) || null} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" placeholder="Permanente" />
                )}
              />
            </div>
            
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" onClick={() => setShowFixedDialog(false)} unstyled className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors" />
            <Button type="submit" label="Asignar Concepto" icon={isSubmittingFixed ? "pi pi-spin pi-spinner" : "pi pi-check"} disabled={isSubmittingFixed} unstyled className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-semibold border border-indigo-600 rounded-lg transition-colors flex items-center gap-2" />
          </div>
        </form>
      </Dialog>
      {/* Modal Añadir Nuevo Salario */}
      <Dialog 
        header="Registrar Aumento / Nuevo Salario" 
        visible={showSalaryDialog} 
        style={{ width: '90vw', maxWidth: '500px' }} 
        onHide={() => setShowSalaryDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleSalarySubmit(onAddSalary)} className="space-y-6 pt-2">
          
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start gap-3 mb-4">
            <i className="pi pi-info-circle text-indigo-500 mt-1"></i>
            <p className="text-sm text-indigo-700 m-0">
              Registrar un nuevo salario cerrará automáticamente la vigencia del sueldo actual y blindará los cálculos históricos de nóminas pasadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Nuevo Sueldo Base Mensual <span className="text-red-500">*</span></label>
              <Controller
                name="amount"
                control={salaryControl}
                render={({ field }) => (
                  <InputText 
                    {...field} 
                    type="number" 
                    step="0.01" 
                    value={field.value?.toString() || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={`w-full text-xl font-bold ${salaryErrors.amount ? 'p-invalid' : ''}`} 
                    placeholder="Ej. 300.00" 
                  />
                )}
              />
              {salaryErrors.amount && <small className="text-red-500">{salaryErrors.amount.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Moneda Base <span className="text-red-500">*</span></label>
              <Controller
                name="currency"
                control={salaryControl}
                render={({ field }) => (
                  <Dropdown 
                    {...field} 
                    options={currencyOptions} 
                    className={`w-full ${salaryErrors.currency ? 'p-invalid' : ''}`} 
                  />
                )}
              />
              {salaryErrors.currency && <small className="text-red-500">{salaryErrors.currency.message as string}</small>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">A partir de (Fecha de Vigencia) <span className="text-red-500">*</span></label>
              <Controller
                name="validFrom"
                control={salaryControl}
                render={({ field }) => (
                  <Calendar 
                    id={field.name} 
                    value={(field.value as any) || null} 
                    onChange={(e: any) => field.onChange(e.value)} 
                    dateFormat="dd/mm/yy" 
                    showIcon 
                    className={`w-full ${salaryErrors.validFrom ? 'p-invalid' : ''}`} 
                  />
                )}
              />
              {salaryErrors.validFrom && <small className="text-red-500">{salaryErrors.validFrom.message as string}</small>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              label="Cancelar" 
              severity="secondary" 
              outlined
              onClick={() => setShowSalaryDialog(false)} 
              disabled={isSubmittingSalary}
            />
            <Button 
              type="submit" 
              label="Registrar Salario" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              icon={isSubmittingSalary ? "pi pi-spin pi-spinner" : "pi pi-check"}
              disabled={isSubmittingSalary}
            />
          </div>
        </form>
      </Dialog>

      <Dialog 
        header="Editar Datos Personales" 
        visible={showEditProfileDialog} 
        style={{ width: '90vw', maxWidth: '650px' }} 
        onHide={() => setShowEditProfileDialog(false)}
        className="font-sans"
      >
        <form onSubmit={handleProfileSubmit(onEditProfile)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Cédula / Documento <span className="text-red-500">*</span></label>
              <Controller name="primaryIdentityNumber" control={profileControl} render={({ field }) => (
                <InputText {...field} className={profileErrors.primaryIdentityNumber ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Nacionalidad <span className="text-red-500">*</span></label>
              <Controller name="nationality" control={profileControl} render={({ field }) => (
                <Dropdown value={field.value} onChange={(e) => field.onChange(e.value)} options={nationalityOptions} className={profileErrors.nationality ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Nombres <span className="text-red-500">*</span></label>
              <Controller name="firstName" control={profileControl} render={({ field }) => (
                <InputText {...field} className={profileErrors.firstName ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Apellidos <span className="text-red-500">*</span></label>
              <Controller name="lastName" control={profileControl} render={({ field }) => (
                <InputText {...field} className={profileErrors.lastName ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento <span className="text-red-500">*</span></label>
              <Controller name="birthDate" control={profileControl} render={({ field }) => (
                <Calendar value={field.value} onChange={(e) => field.onChange(e.value)} className={profileErrors.birthDate ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Estado Civil <span className="text-red-500">*</span></label>
              <Controller name="maritalStatus" control={profileControl} render={({ field }) => (
                <Dropdown value={field.value} onChange={(e) => field.onChange(e.value)} options={maritalOptions} className={profileErrors.maritalStatus ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Género <span className="text-red-500">*</span></label>
              <Controller name="gender" control={profileControl} render={({ field }) => (
                <Dropdown value={field.value} onChange={(e) => field.onChange(e.value)} options={genderOptions} className={profileErrors.gender ? 'p-invalid' : ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <Controller name="phone" control={profileControl} render={({ field }) => (
                <InputText {...field} value={field.value || ''} />
              )} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <Controller name="email" control={profileControl} render={({ field }) => (
                <InputText {...field} value={field.value || ''} className={profileErrors.email ? 'p-invalid' : ''} />
              )} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" severity="secondary" outlined onClick={() => setShowEditProfileDialog(false)} disabled={isSubmittingProfile} />
            <Button type="submit" label={isSubmittingProfile ? "Guardando..." : "Guardar Cambios"} className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600" disabled={isSubmittingProfile} />
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
