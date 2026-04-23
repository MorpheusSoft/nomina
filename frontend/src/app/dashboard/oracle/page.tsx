"use client";

import React, { useState, useRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';

export default function OracleDataPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  const askOracle = async () => {
    if (!prompt.trim()) return;
    const currentPrompt = prompt;
    setPrompt('');
    
    // Add User message
    const newHistory = [...history, { role: 'user', content: currentPrompt }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const response = await api.post('/oracle/ask-data', {
        prompt: currentPrompt,
        history: history.slice(-6) // Keep last 6 interactions
      });

      const dataObj = response.data;
      
      setHistory((prev) => [...prev, {
        role: 'model',
        content: dataObj.message,
        data: dataObj.data,
        sqlUsed: dataObj.sql_query_used
      }]);

    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Error consultando al oráculo.' });
      setHistory((prev) => [...prev, { role: 'model', content: 'Lo siento, ha ocurrido un error conectando con mis sensores de datos.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Toast ref={toast} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <i className="pi pi-sparkles text-indigo-600 text-2xl"></i>
            Oráculo Analítico
          </h1>
          <p className="text-slate-500 mt-1">Pregúntale a la IA sobre los datos de Recursos Humanos de forma natural.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[700px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <i className="pi pi-sparkles text-6xl text-indigo-300 mb-4"></i>
                <h2 className="text-xl font-bold text-slate-600">¿Qué deseas saber de tu nómina hoy?</h2>
                <p className="text-sm">Ej: "Muéstrame los cumpleañeros de este mes" o "Dime quién tiene más faltas injustificadas"</p>
              </div>
            )}
            
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'model' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${msg.role === 'model' ? 'bg-white border border-slate-200 text-slate-700' : 'bg-indigo-600 text-white'}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <i className={`pi ${msg.role === 'model' ? 'pi-bolt text-amber-500' : 'pi-user'} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0 max-w-full">
                       <div className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.content}</div>
                       
                       {msg.role === 'model' && msg.data && msg.data.length > 0 && (
                         <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden shrink-0 max-w-full">
                           <DataTable value={msg.data} size="small" scrollable scrollHeight="300px" stripedRows className="text-[11px]" emptyMessage="Sin resultados">
                             {Object.keys(msg.data[0]).map(col => (
                               <Column key={col} field={col} header={col.toUpperCase()} style={{ minWidth: '100px' }}></Column>
                             ))}
                           </DataTable>
                           {msg.sqlUsed && (
                             <div className="bg-slate-900 text-emerald-400 p-2 text-[10px] font-mono break-all border-t border-slate-300">
                               $ {msg.sqlUsed}
                             </div>
                           )}
                         </div>
                       )}
                       {msg.role === 'model' && msg.data && msg.data.length === 0 && msg.sqlUsed && (
                         <div className="mt-4 text-xs font-bold text-slate-500 bg-slate-100 p-2 rounded-md">
                           (La consulta se ejecutó de forma segura pero devolvió 0 resultados o la misma Inteligencia falló al predecir la SQL)
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-2 text-slate-400">
                   <i className="pi pi-spin pi-spinner text-indigo-500 text-xl"></i> Analizando base de datos...
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10 shrink-0">
             <div className="flex gap-2 relative">
                <InputTextarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Pregúntale a Nebula sobre cualquier dato de los trabajadores o nómina..."
                  className="w-full rounded-xl pr-14 text-sm bg-slate-50 border-slate-200 focus:bg-white resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      askOracle();
                    }
                  }}
                  autoResize
                />
                <Button 
                  icon="pi pi-send" 
                  rounded 
                  disabled={loading || !prompt.trim()}
                  onClick={askOracle}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 border-none hover:bg-indigo-700" 
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
