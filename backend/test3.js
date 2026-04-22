const { evaluate } = require('mathjs');
const mem = { es_fin_de_mes: 0 };
const result = evaluate('es_fin_de_mes == 1', mem);
const result2 = evaluate('es_fin_de_mes', mem);
console.log('== 1:', result, 'bare:', result2);
