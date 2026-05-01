"use client";

import React, { useState, useRef, useEffect } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';

export default function OracleCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const toast = useRef<Toast>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading, isOpen]);

  const askOracle = async () => {
    if (!prompt.trim()) return;
    const currentPrompt = prompt;
    setPrompt('');
    
    const newHistory = [...history, { role: 'user', content: currentPrompt }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const response = await api.post('/oracle/ask-data', {
        prompt: currentPrompt,
        history: history.slice(-6)
      });

      const dataObj = response.data;
      
      setHistory((prev) => [...prev, {
        role: 'model',
        content: dataObj.message,
        data: dataObj.data
      }]);

    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Error consultando al oráculo.' });
      setHistory((prev) => [...prev, { role: 'model', content: 'Lo siento, ha ocurrido un error de seguridad o de conexión.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      
      {/* Botón Flotante (Cerrado) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#1e1b4b] rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:bg-[#312e81] transition-all z-[100] group border-2 border-white"
          title="Oráculo Analítico"
          style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' }}
        >
          <img src="/images/oracle_avatar.png?v=2" alt="Oracle" className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      )}

      {/* Panel Flotante (Abierto) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl z-[100] flex flex-col border border-slate-200 overflow-hidden transform transition-all animate-fade-in-up">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shrink-0" style={{ backgroundImage: 'linear-gradient(90deg, #4f46e5 0%, #312e81 100%)' }}>
            <div className="flex items-center gap-3">
               <img src="/images/oracle_avatar.png?v=2" alt="Oracle" className="w-8 h-8 rounded-full object-cover shadow-inner" />
               <div className="flex flex-col">
                 <span className="text-white text-sm font-bold leading-tight">Oráculo Analítico</span>
                 <span className="text-indigo-200 text-[10px] uppercase tracking-wider font-semibold">Nebula Copilot</span>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors">
               <i className="pi pi-times text-sm"></i>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70 px-4">
                <i className="pi pi-sparkles text-4xl text-indigo-300 mb-3 animate-bounce"></i>
                <h2 className="text-sm font-bold text-slate-700">Nebula Copilot Activo</h2>
                <p className="text-xs text-slate-500 mt-1">Pregúntame sobre nómina, estadísticas o recibos de manera natural.</p>
              </div>
            )}

            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'model' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] rounded-xl p-3 shadow-sm ${msg.role === 'model' ? 'bg-white border border-slate-200 text-slate-700' : 'bg-indigo-600 text-white'}`}>
                    <div className="whitespace-pre-wrap text-[12px] leading-relaxed select-text">{msg.content}</div>
                    
                    {msg.role === 'model' && msg.data && msg.data.length > 0 && (
                        <div className="mt-3 border border-slate-200 rounded-md overflow-hidden bg-white max-w-full">
                        <DataTable value={msg.data} size="small" scrollable scrollHeight="150px" stripedRows className="text-[10px]" emptyMessage="N/A">
                            {Object.keys(msg.data[0]).map(col => (
                            <Column key={col} field={col} header={col} body={(rowData) => {
                                const val = rowData[col];
                                if (val === null || val === undefined) return <span className="text-slate-400 italic">0 (Nulo)</span>;
                                if (typeof val === 'object') return <span className="text-slate-700">{JSON.stringify(val)}</span>;
                                return <span className="font-semibold text-slate-800">{String(val)}</span>;
                            }} style={{ minWidth: '80px', padding: '0.4rem 0.5rem' }}></Column>
                            ))}
                        </DataTable>
                        </div>
                    )}
                    {msg.role === 'model' && msg.data && msg.data.length === 0 && (
                        <div className="mt-2 text-[10px] font-bold text-slate-400 bg-slate-100 p-1.5 rounded text-center border border-slate-200">
                        (0 resultados devueltos)
                        </div>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex items-center gap-2 text-slate-400 text-xs">
                   <i className="pi pi-spin pi-spinner text-indigo-500"></i> Analizando DB...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
             <div className="flex gap-2 relative">
                <InputTextarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Escribe tu consulta analítica..."
                  className="w-full rounded-xl pr-12 text-xs bg-slate-50 border-slate-200 focus:bg-white resize-none py-3"
                  rows={1}
                  autoResize
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      askOracle();
                    }
                  }}
                />
                <Button 
                  icon="pi pi-send" 
                  rounded 
                  disabled={loading || !prompt.trim()}
                  onClick={askOracle}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 border-none hover:bg-indigo-700 shadow-sm" 
                />
             </div>
          </div>
        </div>
      )}
    </>
  );
}
