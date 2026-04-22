"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';

interface WorkerDocumentGeneratorProps {
  workerId: string;
}

export default function WorkerDocumentGenerator({ workerId }: WorkerDocumentGeneratorProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const menu = useRef<Menu>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    // Fetch document templates
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/document-templates');
        setTemplates(res.data);
      } catch (error) {
        console.error("Error loading templates", error);
      }
    };
    fetchTemplates();
  }, []);

  const generateDocument = async (templateId: string, templateName: string) => {
    try {
      setLoading(true);
      toast.current?.show({ severity: 'info', summary: 'Generando', detail: `Compilando ${templateName}...`, life: 2000 });
      
      const res = await api.post(`/document-templates/${templateId}/compile`, { workerId });
      const compiledHtml = res.data.compiledHtml;

      // Open new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${templateName}</title>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              ${compiledHtml}
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al generar documento' });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      label: 'Generar Documentos',
      items: templates.length > 0 ? templates.map(t => ({
        label: t.name,
        icon: t.type === 'CONTRACT' ? 'pi pi-file-edit' : (t.type === 'LIQUIDATION' ? 'pi pi-dollar' : 'pi pi-file'),
        command: () => generateDocument(t.id, t.name)
      })) : [{ label: 'No hay plantillas creadas', disabled: true }]
    }
  ];

  return (
    <>
      <Toast ref={toast} position="bottom-right" />
      <Menu model={menuItems} popup ref={menu} id="popup_menu" />
      <Button 
        label={loading ? "Generando..." : "Generar Documento"} 
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-print"}
        severity="secondary" 
        outlined 
        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded font-medium hover:bg-gray-50"
        onClick={(event) => menu.current?.toggle(event)}
        aria-controls="popup_menu" 
        aria-haspopup
        disabled={loading}
        unstyled
      />
    </>
  );
}
