const p = { startDate: '2026-04-01T00:00:00Z', endDate: '2026-04-15T00:00:00Z' };
const sd = new Date(p.startDate);
const ed = new Date(p.endDate);
let lunes_en_periodo = 0;
for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) { }
const startOfMonth = new Date(ed.getFullYear(), ed.getMonth(), 1);
const endOfMonth = new Date(ed.getFullYear(), ed.getMonth() + 1, 0);
for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) { }
console.log('es_fin_de_mes:', ed.getDate() === endOfMonth.getDate() ? 1 : 0);
