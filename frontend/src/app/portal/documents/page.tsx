"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState('');
  
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  const router = useRouter();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const wId = localStorage.getItem('portal_worker_id');
    if (!wId) {
      router.push('/portal/login');
      return;
    }
    setWorkerId(wId);
    fetchDocuments(wId);
  }, []);

  const fetchDocuments = async (wId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/portal/documents/${wId}`);
      setDocuments(res.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los documentos disponibles' });
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async (doc: any) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/portal/documents/${doc.id}/preview/${workerId}`);
      setPreviewHtml(res.data.compiledHtml);
      setPreviewTitle(doc.name);
      setPreviewDialog(true);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el documento' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${previewTitle}</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              @media print {
                body { padding: 0; }
                @page { margin: 2cm; }
              }
            </style>
          </head>
          <body>
            ${previewHtml}
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      
      <div className="flex items-center gap-4 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/portal/dashboard')}>
         <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
            <i className="pi pi-arrow-left"></i>
         </div>
         <h2 className="text-xl font-bold text-slate-800">Volver al Panel</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <i className="pi pi-file-word text-xl"></i>
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">Autogestión de Constancias</h3>
             <p className="text-sm text-slate-500 font-medium">Seleccione el documento que desea generar e imprimir.</p>
           </div>
        </div>

        {loading && <p className="text-slate-500"><i className="pi pi-spin pi-spinner mr-2"></i> Cargando documentos...</p>}
        
        {!loading && documents.length === 0 && (
          <div className="text-center p-12 border border-dashed rounded-xl border-slate-300">
             <i className="pi pi-folder-open text-3xl text-slate-400 mb-3 block"></i>
             <p className="text-slate-500">No hay documentos de autogestión disponibles por el momento.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {documents.map((doc) => (
             <div key={doc.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <i className="pi pi-file-pdf text-3xl text-indigo-500 mb-4 block"></i>
                <h4 className="font-bold text-slate-800 text-lg">{doc.name}</h4>
                <p className="text-sm text-slate-500 mt-2 mb-6">Documento automático</p>
                <Button label="Generar PDF" icon="pi pi-external-link" size="small" className="w-full bg-indigo-50 text-indigo-700 border-none hover:bg-indigo-600 hover:text-white transition-colors font-bold" onClick={() => generatePreview(doc)} />
             </div>
          ))}
        </div>
      </div>

      <Dialog header={previewTitle} visible={previewDialog} style={{ width: '50vw' }} onHide={() => setPreviewDialog(false)} maximizable modal
        footer={
          <div>
            <Button label="Cerrar" icon="pi pi-times" onClick={() => setPreviewDialog(false)} className="p-button-text" />
            <Button label="Imprimir / Guardar como PDF" icon="pi pi-print" onClick={handlePrint} autoFocus />
          </div>
        }>
        <div className="border border-slate-200 p-8 rounded bg-white prose max-w-none text-slate-800 shadow-inner min-h-[60vh]" dangerouslySetInnerHTML={{ __html: previewHtml }}></div>
      </Dialog>
    </div>
  );
}
