'use client';

import { useState, useRef } from 'react';

export default function GlobalApplyPage() {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experienceYears: 0,
    skills: '', // Guardado como texto plano para simplificar la demo
    professionalSummary: '',
    resumeUrl: '',
    rawResumeText: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError('');

    try {
      let finalResumeUrl = formData.resumeUrl;
      let finalRawText = formData.rawResumeText;

      // Si el usuario no ha subido su CV, se lo pedimos
      if (!finalResumeUrl) {
         throw new Error('Debes subir tu CV en formato PDF');
      }

      // Enviar aplicación como público sin token de auth a la base global
      const applyRes = await fetch(`/api/v1/candidates/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          resumeUrl: finalResumeUrl,
          rawResumeText: finalRawText,
          skills: formData.skills.split(',').map(s => s.trim()),
          experienceYears: parseInt(formData.experienceYears.toString(), 10)
        }),
      });

      if (!applyRes.ok) throw new Error('Error al enviar la aplicación');
      
      setSubmitted(true);
    } catch (error: any) {
      console.error(error);
      setUploadError(error.message || 'Error enviando aplicación');
      setUploadingPdf(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('Por favor, selecciona un archivo en formato PDF.');
        setPdfFile(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setUploadError('El archivo es demasiado pesado. El límite es 2 MB.');
        setPdfFile(null);
        return;
      }
      
      setUploadError('');
      setPdfFile(file);
      setUploadingPdf(true);

      try {
        const fileData = new FormData();
        fileData.append('file', file);

        const uploadRes = await fetch('/api/v1/candidates/upload-resume', {
          method: 'POST',
          body: fileData
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.message || 'Error al subir el PDF');
        }

        const uploadResult = await uploadRes.json();
        
        // Auto-fill form data if Oraculo returned parsed data
        const pd = uploadResult.parsedData;
        setFormData(prev => ({
          ...prev,
          resumeUrl: uploadResult.resumeUrl,
          rawResumeText: uploadResult.rawResumeText,
          firstName: pd?.firstName || prev.firstName,
          lastName: pd?.lastName || prev.lastName,
          email: pd?.email || prev.email,
          phone: pd?.phone || prev.phone,
          experienceYears: pd?.experienceYears !== undefined ? pd.experienceYears : prev.experienceYears,
          skills: pd?.skills || prev.skills,
          professionalSummary: pd?.professionalSummary || prev.professionalSummary
        }));

      } catch (error: any) {
        console.error(error);
        setUploadError(error.message || 'Hubo un error analizando tu PDF.');
        setPdfFile(null);
      } finally {
        setUploadingPdf(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 text-center bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Aplicación Enviada!</h2>
          <p className="text-gray-600">
            Tu currículum ha sido registrado en nuestra Bolsa Global de Talento.
            Si tu perfil coincide con alguna vacante futura de nuestras empresas asociadas, te contactarán pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-6">
          <h1 className="text-3xl font-bold tracking-tight">Nebula Talent Portal</h1>
          <p className="text-slate-300 mt-2">
            Únete a nuestra base global de talento de Nebula. Deja tu perfil y sé descubierto por las mejores empresas.
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {uploadError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-800 font-medium">{uploadError}</p>
              </div>
            )}

            {/* UPFRONT PDF UPLOAD SECTION */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-xl border border-indigo-100 shadow-sm mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                  <i className="pi pi-bolt text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Carga Rápida con Inteligencia Artificial</h3>
                  <p className="text-sm text-slate-600">
                    Sube tu Currículum en formato PDF (máx 2MB) y nuestro Oráculo completará el formulario por ti automáticamente.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-indigo-50 transition-colors ${uploadingPdf ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingPdf ? (
                       <i className="pi pi-spin pi-spinner text-3xl text-indigo-500 mb-2"></i>
                    ) : (
                       <i className="pi pi-cloud-upload text-3xl text-indigo-400 mb-2"></i>
                    )}
                    <p className="mb-2 text-sm text-slate-600">
                      <span className="font-bold">{uploadingPdf ? 'Analizando tu CV...' : 'Haz clic para subir'}</span> {!uploadingPdf && 'o arrastra y suelta'}
                    </p>
                    <p className="text-xs text-slate-500">PDF (MAX. 2MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    accept="application/pdf"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploadingPdf}
                  />
                </label>
              </div>
              {pdfFile && !uploadingPdf && (
                <div className="mt-3 flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <i className="pi pi-check-circle mr-2 text-lg"></i>
                  <span>¡Lectura exitosa! Archivo: <span className="font-bold">{pdfFile.name}</span>. Por favor verifica tus datos abajo.</span>
                </div>
              )}
            </div>

            <hr className="border-slate-200 my-6" />

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Años de Experiencia</label>
              <input type="number" min="0" required value={formData.experienceYears} onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })} className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen Profesional (Opcional)</label>
              <textarea 
                placeholder="Un breve párrafo sobre ti, tus logros y qué buscas profesionalmente..."
                value={formData.professionalSummary} 
                onChange={(e) => setFormData({ ...formData, professionalSummary: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 h-20" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades Clave (Separadas por coma)</label>
              <textarea 
                placeholder="Ej. React, Node.js, Liderazgo, Agile..."
                required 
                value={formData.skills} 
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 h-24" 
              />
            </div>

            {/* PDF upload section was moved to top */}

            <div className="pt-4">
              <button type="submit" disabled={loading || uploadingPdf || !formData.resumeUrl} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <i className="pi pi-spin pi-spinner"></i>}
                {loading ? 'Enviando postulación...' : 'Enviar Postulación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
