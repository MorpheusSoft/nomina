"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AppLayout from "@/components/layout/AppLayout";
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

import Dropdown from '@/components/ui/Dropdown';
import Calendar from '@/components/ui/Calendar';

import api from '@/lib/api';

// Yup Validation Schema matching Backend structure
const validationSchema = yup.object({
  docPrefix: yup.string().required('Requerido'),
  docNumber: yup.string()
    .required('El número de documento es requerido')
    .matches(/^[0-9]+$/, 'Solo números permitidos')
    .max(20, 'Máximo 20 caracteres'),
  firstName: yup.string().required('El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: yup.string().required('El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  birthDate: yup.date().required('La fecha de nacimiento es obligatoria').nullable(),
  gender: yup.string().required('Debe seleccionar un género'),
  nationality: yup.string().required('La nacionalidad es requerida').max(50, 'Máximo 50 caracteres'),
  maritalStatus: yup.string().required('Seleccione estado civil'),
  phone: yup.string().nullable().max(50, 'Máximo 50 caracteres'),
  email: yup.string().email('Ingrese un correo válido').nullable().max(150, 'Máximo 150 caracteres'),
}).required();

type FormData = yup.InferType<typeof validationSchema>;

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

const prefixOptions = [
  { label: 'V - C.I. Venezolano', value: 'V' },
  { label: 'E - C.I. Extranjero', value: 'E' },
  { label: 'P - Pasaporte', value: 'P' }
];

export default function NewWorkerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nationalityOptions, setNationalityOptions] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      docPrefix: 'V',
      docNumber: '',
      firstName: '',
      lastName: '',
      nationality: '',
      maritalStatus: '',
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    api.get('/general-catalogs?category=NATIONALITY').then(res => {
      if (res.data && res.data.length > 0) {
        const options = res.data.map((item: any) => ({ label: item.value, value: item.value }));
        setNationalityOptions(options);

        // Si el formulario apenas carga y está la 'V', auto-seleccionar la nacionalidad apenas lleguen las opciones del API
        const prefix = getValues('docPrefix');
        if (prefix === 'V') {
          const vnz = options.find((opt: any) => opt.value.toLowerCase().includes('venezuela') || opt.value.toLowerCase().includes('venezolano'));
          if (vnz) {
            setValue('nationality', vnz.value, { shouldValidate: true });
          }
        }
      }
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const payload = {
        primaryIdentityNumber: `${data.docPrefix}-${data.docNumber}`,
        firstName: data.firstName,
        lastName: data.lastName,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        gender: data.gender,
        birthDate: (data.birthDate as Date).toISOString(),
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      };
      
      await api.post('/workers', payload);
      
      router.push('/workers');
    } catch (error: any) {
      console.error(error);
      const serverMessage = error.response?.data?.message || 'Error desconocido al registrar el trabajador.';
      setSubmitError(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            icon="pi pi-arrow-left" 
            rounded 
            text 
            severity="secondary" 
            aria-label="Volver" 
            onClick={() => router.push('/workers')}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 m-0">Inscribir Nuevo Trabajador</h1>
            <p className="text-gray-500 text-sm mt-1">Llene los datos básicos de recurso humano para la contratación.</p>
          </div>
        </div>

        {submitError && (
          <div className="mb-6">
            <Message severity="error" text={submitError} className="w-full justify-start" />
          </div>
        )}

        <Card className="shadow-sm border border-gray-100 rounded-xl overflow-visible">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Sección: Datos Personales */}
            <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                <i className="pi pi-id-card mr-2 text-indigo-500"></i>
                Identidad y Nombres
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Documento de Identidad (InputGroup) */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="docNumber" className="text-sm font-medium text-gray-700">Cédula / Pasaporte <span className="text-red-500">*</span></label>
                  <div className="p-inputgroup">
                    <Controller
                      name="docPrefix"
                      control={control}
                      render={({ field }) => (
                        <Dropdown 
                          id="docPrefix"
                          value={field.value} 
                          options={prefixOptions} 
                          onChange={(e) => {
                            field.onChange(e.value);
                            // Lógica: Si seleccionó V o E, forzar / limpiar Nacionalidad
                            if (e.value === 'V') {
                              // Buscar opción que se parezca a Venezuela
                              const vnz = nationalityOptions.find(opt => opt.value.toLowerCase().includes('venezuela') || opt.value.toLowerCase().includes('venezolano'));
                              if (vnz) setValue('nationality', vnz.value, { shouldValidate: true });
                            } else if (e.value === 'E') {
                              // Si es E, y está en Venezuela, lo limpiamos para obligarlo a elegir otro país
                              const currentNat = getValues('nationality');
                              if (currentNat.toLowerCase().includes('venezuela') || currentNat.toLowerCase().includes('venezolano')) {
                                setValue('nationality', '', { shouldValidate: true });
                              }
                            }
                          }} 
                          className="w-48 shrink-0 shadow-none border-r-0 rounded-r-none" 
                        />
                      )}
                    />
                    <Controller
                      name="docNumber"
                      control={control}
                      render={({ field }) => (
                        <InputText 
                          id="docNumber"
                          {...field} 
                          className={errors.docNumber ? 'p-invalid shadow-none rounded-l-none' : 'shadow-none rounded-l-none'} 
                          placeholder="12345678"
                        />
                      )}
                    />
                  </div>
                  {errors.docNumber && <small className="text-red-500">{errors.docNumber.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nacionalidad / País <span className="text-red-500">*</span></label>
                  <Controller
                    name="nationality"
                    control={control}
                    render={({ field }) => (
                      <Dropdown 
                        id={field.name} 
                        value={field.value} 
                        onChange={(e) => {
                          field.onChange(e.value);
                          const prefix = getValues('docPrefix');
                          
                          // Regla de Oro: Si el prefijo NO es Pasaporte (P), automatizamos la V o la E.
                          if (prefix !== 'P') {
                            const isVenezuela = e.value.toLowerCase().includes('venezuela') || e.value.toLowerCase().includes('venezolano');
                            if (isVenezuela) {
                              setValue('docPrefix', 'V', { shouldValidate: true });
                            } else if (e.value) { // Si eligió cualquier otro país
                              setValue('docPrefix', 'E', { shouldValidate: true });
                            }
                          }
                        }} 
                        options={nationalityOptions} 
                        placeholder="Seleccione..." 
                        filter // Habilitamos buscador de paises
                        className={`w-full ${errors.nationality ? 'p-invalid' : ''}`}
                      />
                    )}
                  />
                  {errors.nationality && <small className="text-red-500">{errors.nationality.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Nombres <span className="text-red-500">*</span></label>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <InputText 
                        id={field.name} 
                        {...field} 
                        className={errors.firstName ? 'p-invalid' : ''} 
                      />
                    )}
                  />
                  {errors.firstName && <small className="text-red-500">{errors.firstName.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Apellidos <span className="text-red-500">*</span></label>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <InputText 
                        id={field.name} 
                        {...field} 
                        className={errors.lastName ? 'p-invalid' : ''} 
                      />
                    )}
                  />
                  {errors.lastName && <small className="text-red-500">{errors.lastName.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <InputText 
                        id={field.name} 
                        {...field} 
                        value={field.value || ''}
                        className={errors.phone ? 'p-invalid' : ''} 
                        placeholder="Ej. +58 414-1234567"
                      />
                    )}
                  />
                  {errors.phone && <small className="text-red-500">{errors.phone.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico (Opcional)</label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <InputText 
                        id={field.name} 
                        {...field} 
                        value={field.value || ''}
                        className={errors.email ? 'p-invalid' : ''} 
                        placeholder="ejemplo@correo.com"
                      />
                    )}
                  />
                  {errors.email && <small className="text-red-500">{errors.email.message}</small>}
                </div>
              </div>
            </div>

            {/* Sección: Demografía */}
            <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                <i className="pi pi-user mr-2 text-indigo-500"></i>
                Perfil Demográfico
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="birthDate" className="text-sm font-medium text-gray-700">Fecha de Nacimiento <span className="text-red-500">*</span></label>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <Calendar 
                        id={field.name} 
                        value={field.value as Date | undefined} 
                        onChange={(e) => field.onChange(e.value)} 
                        dateFormat="dd/mm/yy" 
                        showIcon 
                        className={`w-full ${errors.birthDate ? 'p-invalid' : ''}`}
                      />
                    )}
                  />
                  {errors.birthDate && <small className="text-red-500">{errors.birthDate.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-700">Género <span className="text-red-500">*</span></label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Dropdown 
                        id={field.name} 
                        value={field.value} 
                        onChange={(e) => field.onChange(e.value)} 
                        options={genderOptions} 
                        placeholder="Seleccione..." 
                        className={`w-full ${errors.gender ? 'p-invalid' : ''}`}
                      />
                    )}
                  />
                  {errors.gender && <small className="text-red-500">{errors.gender.message}</small>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Estado Civil <span className="text-red-500">*</span></label>
                  <Controller
                    name="maritalStatus"
                    control={control}
                    render={({ field }) => (
                      <Dropdown 
                        id={field.name} 
                        value={field.value} 
                        onChange={(e) => field.onChange(e.value)} 
                        options={maritalOptions} 
                        placeholder="Seleccione..." 
                        className={`w-full ${errors.maritalStatus ? 'p-invalid' : ''}`}
                      />
                    )}
                  />
                  {errors.maritalStatus && <small className="text-red-500">{errors.maritalStatus.message}</small>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
              <Button 
                type="button" 
                label="Cancelar" 
                onClick={() => router.push('/workers')}
                disabled={isSubmitting}
                className="px-6 py-2.5 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                unstyled
              />
              <Button 
                type="submit" 
                label="Procesar Alta" 
                icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"} 
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 text-white px-6 py-2.5 font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                unstyled
              />
            </div>
            
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
