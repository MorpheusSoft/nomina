import React from 'react';

interface PayslipPrintTemplateProps {
  period: any;
  receipts: any[];
}

export default function PayslipPrintTemplate({ period, receipts }: PayslipPrintTemplateProps) {
  if (!period || receipts.length === 0) return null;

  const currencySymbol = period?.currency === 'USD' ? '$' : 'Bs.S';

  const formatCurrency = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? '0,00' : num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full bg-white text-black p-4">
      {receipts.map((receipt, index) => {
        const earnings = receipt.details.filter((d: any) => d.typeSnapshot === 'EARNING' || d.typeSnapshot === 'ASIGNACION');
        const deductions = receipt.details.filter((d: any) => d.typeSnapshot === 'DEDUCTION' || d.typeSnapshot === 'DEDUCCION');
        const contributions = receipt.details.filter((d: any) => d.typeSnapshot === 'EMPLOYER_CONTRIBUTION' || d.typeSnapshot === 'APORTE_PATRONAL');

        return (
          <div 
            key={receipt.id} 
            className="w-full max-w-4xl mx-auto border-2 border-slate-800 p-6 mb-8 break-inside-avoid"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider mb-1">{period?.tenant?.name || 'EMPRESA DEMO C.A.'}</h2>
                <div className="text-sm font-semibold uppercase text-slate-700">Comprobante de Pago de Nómina</div>
                <div className="text-xs text-slate-500 mt-1">
                  Período: {new Date(period.startDate).toLocaleDateString('es-ES')} al {new Date(period.endDate).toLocaleDateString('es-ES')}
                </div>
                <div className="text-xs text-slate-500">
                  Nómina: {period.name} ({period.type})
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg uppercase">{receipt.worker?.firstName} {receipt.worker?.lastName}</div>
                <div className="text-sm">ID/CI: {receipt.worker?.primaryIdentityNumber}</div>
                <div className="text-xs text-slate-600 mt-1">Recibo Nro: {receipt.id.split('-')[0].toUpperCase()}</div>
                <div className="text-xs text-slate-600">Fecha Impresión: {new Date().toLocaleDateString('es-ES')}</div>
              </div>
            </div>

            {/* Body */}
            <div className="flex gap-6 w-full min-h-[5in]">
              
              {/* Earnings Column */}
              <div className="w-1/2 border-r border-slate-300 pr-4 flex flex-col">
                <div className="font-bold bg-slate-100 px-2 py-1 mb-2 border-y border-slate-300 uppercase text-xs tracking-wider text-center">Asignaciones / Ingresos</div>
                <div className="flex-grow">
                  {earnings.map((e: any) => (
                    <div key={e.id} className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                      <span className="uppercase text-slate-800">{e.conceptNameSnapshot}</span>
                      <span className="font-mono">{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm bg-slate-50 border-t border-slate-800 mt-2 px-2 py-2">
                  <span>TOTAL ASIGNACIONES</span>
                  <span className="font-mono">{formatCurrency(receipt.totalEarnings)}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="w-1/2 pl-2 flex flex-col">
                <div className="font-bold bg-slate-100 px-2 py-1 mb-2 border-y border-slate-300 uppercase text-xs tracking-wider text-center">Deducciones / Retenciones</div>
                <div className="flex-grow">
                  {deductions.map((d: any) => (
                    <div key={d.id} className="flex justify-between text-sm py-1 border-b border-dashed border-slate-200">
                      <span className="uppercase text-slate-800">{d.conceptNameSnapshot}</span>
                      <span className="font-mono">{formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm bg-slate-50 border-t border-slate-800 mt-2 px-2 py-2 text-red-900">
                  <span>TOTAL DEDUCCIONES</span>
                  <span className="font-mono">{formatCurrency(receipt.totalDeductions)}</span>
                </div>
              </div>

            </div>

            {/* Footer / Net Pay */}
            <div className="mt-4 border-2 border-slate-800 bg-slate-100 p-4 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold">Neto a Recibir</div>
                <div className="text-[10px] text-slate-500 mt-1 italic w-64 leading-tight">
                  Recibí conforme el monto exacto detallado en este comprobante por concepto de mis servicios.
                </div>
              </div>
              <div className="text-lg font-black font-mono tracking-tight text-slate-900 mt-2">
                {currencySymbol} {formatCurrency(receipt.netPay)}
              </div>
              <div className="w-48 border-t-2 border-slate-400 mt-4 text-center text-xs uppercase font-bold pt-1">
                Firma del Trabajador
              </div>
            </div>

            {/* Optional Employer Contributions */}
            {contributions.length > 0 && (
               <div className="mt-4 text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-2 flex flex-wrap gap-4">
                 <span className="font-bold uppercase">Nota: Aportes Patronales Pagados:</span>
                 {contributions.map((c: any) => (
                   <span key={c.id}>• {c.conceptNameSnapshot}: {currencySymbol} {formatCurrency(c.amount)}</span>
                 ))}
               </div>
            )}

            {/* Page Break Force if needed */}
            <div style={{ pageBreakAfter: 'always' }} className="h-0 w-0"></div>
          </div>
        );
      })}
    </div>
  );
}
