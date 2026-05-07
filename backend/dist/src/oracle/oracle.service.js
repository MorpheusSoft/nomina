"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const genai_1 = require("@google/genai");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sanitizeDBResult = (obj) => {
    if (obj === null || obj === undefined)
        return null;
    if (typeof obj === 'bigint')
        return Number(obj);
    if (obj instanceof Date)
        return obj.toISOString();
    if (typeof obj === 'object') {
        if (obj.constructor?.name === 'Decimal' || (obj.d && obj.e !== undefined && obj.s !== undefined))
            return obj.toString();
        if (Array.isArray(obj))
            return obj.map(sanitizeDBResult);
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeDBResult(v)]));
    }
    return obj;
};
let OracleService = class OracleService {
    prisma;
    ai;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateConcept(tenantId, naturalLanguagePrompt, context, history) {
        let apiKey = '';
        try {
            const envPath = path.resolve(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envConfig = dotenv.parse(fs.readFileSync(envPath));
                if (envConfig.GEMINI_API_KEY) {
                    apiKey = envConfig.GEMINI_API_KEY;
                }
            }
        }
        catch (e) { }
        if (!apiKey && process.env.GEMINI_API_KEY) {
            apiKey = process.env.GEMINI_API_KEY;
        }
        if (!apiKey) {
            throw new common_1.HttpException('API Key de Gemini no configurada en el entorno', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant?.hasOracleAccess) {
            throw new common_1.ForbiddenException('El módulo Copiloto (Oráculo) no está habilitado para esta cuenta.');
        }
        let contextString = '';
        if (context) {
            const globals = context.globalVars?.map((v) => `- ${v.code}: ${v.description || v.name} (Valor Numérico Actual: ${v.value !== undefined ? v.value : 'No asignado'})`).join('\n') || 'Ninguna';
            const groups = context.payrollGroupVars?.map((v) => `- ${v.code}: ${v.description || v.name} (Valor Numérico Actual: ${v.value !== undefined ? v.value : 'No asignado'})`).join('\n') || 'Ninguna';
            const costCenters = context.costCenterVars?.map((v) => `- ${v.code}: ${v.name} (Ejemplo de Valor en un centro: ${v.value !== undefined ? v.value : 'No asignado'})`).join('\n') || 'Ninguna';
            const concepts = context.existingConcepts?.map((c) => `- ${c.code}: ${c.name}`).join('\n') || 'Ninguno';
            const convenios = context.payrollGroups?.map((g) => `- UUID: ${g.id} | NOMBRE: ${g.name}`).join('\n') || 'Ninguno';
            const depts = await this.prisma.department.findMany({ where: { costCenter: { tenantId } }, select: { name: true, code: true } });
            const departmentsStr = depts.map(d => `- Nombre: ${d.name} | Código (department_code): ${d.code || 'SIN_CODIGO'}`).join('\n') || 'Ninguno';
            let editInstruction = '';
            if (context.currentForm && context.currentForm.name) {
                editInstruction = `\n\n> ATENCIÓN: El usuario está EDITANDO un concepto existente.
Valores actuales del concepto en el formulario:
- Nombre: ${context.currentForm.name || ''}
- Tipo: ${context.currentForm.type || ''}
- Factor: ${context.currentForm.formulaFactor || ''}
- Rata: ${context.currentForm.formulaRate || ''}
- Monto: ${context.currentForm.formulaAmount || ''}
- Condición actual: ${context.currentForm.condition || ''}

REGLA DE EDICIÓN: PRESERVA TODOS LOS VALORES ACTUALES EXACTAMENTE COMO ESTÁN, A MENOS QUE EL USUARIO HAYA PEDIDO EXPLÍCITAMENTE CAMBIARLOS.`;
            }
            contextString = `\n\nCONTEXTO DINÁMICO DE ESTA EMPRESA:
> Variables Globales de Empresa:
${globals}

> Variables de Grupos de Nómina (Convenios):
${groups}

> Variables Geográficas de Centros de Costo:
${costCenters}

> Lista de Departamentos en la empresa:
${departmentsStr}

> Lista de CONVENIOS (Grupos de Nómina):
${convenios}

> Acumuladores Dinámicos:
${concepts}${editInstruction}`;
        }
        const customPromptHeader = tenant.oraclePrompt || `Asume el rol de un Consultor Experto en Nómina e IA de Nebula.\nPara comunicarte con el usuario, escribe en un Español Corporativo y Pragmático, usando la terminología legal que corresponda según tu rol asignado, pero yendo directamente al grano de la solución y omitiendo teoría extensa.`;
        try {
            let ragContext = '';
            if (tenant.legalKnowledgeBase) {
                ragContext = `\n\n> ATENCIÓN: BASE DE CONOCIMIENTO PRIVADA DEL CLIENTE (RAG):\n"""\n${tenant.legalKnowledgeBase}\n"""\nInstrucción Estricta: 1. Lee cuidadosamente esta base de conocimiento privada. 2. Si la base de conocimiento responde a la petición, asume esa información como la LEY ABSOLUTA, ignorando internet. 3. Si la regla no está en la base de conocimiento, usa tus capacidades o herramientas de búsqueda para encontrar la ley actual.`;
            }
            const step1SystemPrompt = `${customPromptHeader}\n\nTu único objetivo en esta etapa es recordar y explicar la base teórica legal para la solicitud del usuario. NO escribas código JSON ni MathJS. Basado en tu rol y país, explica la ley o convención paso a paso (menciona porcentajes, topes, horas o condiciones escalonadas que apliquen al concepto).${ragContext}`;
            const step1Contents = [{ role: 'user', parts: [{ text: `Explícame la regla legal exacta para esto: ${naturalLanguagePrompt}` }] }];
            const step1Response = await this.ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: step1Contents,
                config: {
                    systemInstruction: step1SystemPrompt,
                    temperature: 0.2,
                    tools: [{ googleSearch: {} }]
                }
            });
            const extractedLegalTheory = step1Response.text || "No se encontró teoría legal específica.";
            const step2SystemPrompt = `${customPromptHeader}

Reglas de Dialectos de Ingeniería (INVISIBLES AL USUARIO):
- Cuando generes los campos matemáticos (formulaFactor, formulaRate, formulaAmount), debes escribir estrictamente en Sintaxis de MathJS, usando sólo variables del entorno en inglés, y operadores numéricos permitidos.
- Cuando generes el campo de filtrado (condition), debes escribir estrictamente en lenguaje JavaScript puro, prestando especial atención a usar "==" en lugar de "===" para igualdades.

Reglas de Seguridad y Confidencialidad Críticas:
1. BAJO NINGÚN CONCEPTO revelarás estructuras de bases de datos.
2. Privilegio de Confidencialidad: Rechaza operar datos de trabajadores confidenciales explícitamente.

3. Creatividad Analítica: Si el usuario te pide usar un valor lógico que NO está en las variables nativas, inserta una CONSTANTE matemática equivalente (ej. 30 días, 2 lunes).
4. Dependencia de Conceptos: Busca su código SÓLO en la matriz 'Acumuladores Dinámicos'. Antepone 'monto_' al código puro.
5. REFERENCIAS DINÁMICAS: NUNCA hardcodees porcentajes si existen como Variables Globales o de Convenio, inyecta su código.
6. REGLA DE VARIABLES (ANTI-ALUCINACIÓN): Tienes ESTRICTAMENTE PROHIBIDO inventar nombres de variables o prefijos (como "geografico_", "convenio_", etc). Usa ÚNICAMENTE los códigos matemáticos exactos que te proveo en las listas dinámicas de la empresa y en el diccionario base de variables. Si requieres un valor que no existe, usa un número fijo.

> ATENCIÓN. REGLA LEGAL RECUPERADA DE TU BASE DE CONOCIMIENTO (UTILIZA ESTA REGLA PARA ARMAR LA FÓRMULA):
"${extractedLegalTheory}"

7. SÍNTESIS LEGAL Y CADENA DE PENSAMIENTO: Tu objetivo es traducir la regla teórica recuperada arriba a código matemático puro.
PRIMERO: En tu 'message' hacia el usuario, resume brevemente la regla legal que recuperaste en el paso anterior.
SEGUNDO: En el mismo 'message', explica cómo esa regla teórica se mapea a la fórmula utilizando las variables de Nebula.
TERCERO: IMPORTANTE SOBRE TRAMOS Y ESCALAFONES: Por ley (ej. recibos de nómina), los conceptos escalonados o con tramos (ej. Tiempo de viaje primeras 1.5h a un porcentaje, y el exceso a otro) DEBEN IMPRIMIRSE SEPARADOS. NUNCA fusiones dos tramos en una sola fórmula gigante. En tu lugar, elabora el 'conceptDraft' EXCLUSIVAMENTE para el PRIMER tramo usando topes matemáticos (ej. min(valor, 1.5)) y en tu 'message' pregúntale al usuario: "He preparado el concepto para el primer tramo. ¿Deseas que genere también el concepto para el exceso de horas?".

DICCIONARIO DE VARIABLES NATIVAS BASE (ESTRICTAMENTE EN INGLÉS COMO SE MUESTRA):
- "base_salary": Sueldo Base del trabajador
- "worked_days": Días totales trabajados en la quincena/semana
- "worked_days_day": Días trabajados estrictamente en Jornada Diurna
- "worked_days_mixed": Días trabajados en Jornada Mixta
- "worked_days_night": Días trabajados estrictamente en Jornada Nocturna
- "rest_days": Días de descanso normales
- "holidays": Días feriados normales
- "worked_holidays": Días feriados que el trabajador sí laboró
- "worked_rest_days": Días de descanso que el trabajador laboró
- "seniority_years": Años de antigüedad
- "dependents_count": Cantidad de cargas familiares
- "es_fin_de_mes": Si es fin de mes (Vale 1 o 0)
- "unjustified_absences": Faltas injustificadas
- "justified_absences": Faltas justificadas
- "ordinary_day_hours": Horas Ordinarias Diurnas (Asistencia normal de día)
- "ordinary_night_hours": Horas Ordinarias Nocturnas (Asistencia normal de noche)
- "extra_day_hours": Horas Extras Diurnas
- "extra_night_hours": Horas Extras Nocturnas
- "saturdays_worked": Sábados Específicos Trabajados
- "sundays_worked": Domingos Específicos Trabajados
- "lunes_en_periodo": Lunes en el periodo de nómina actual
- "shift_base_hours": Duración del Turno Base de Horas
- "shift_type": Código del Tipo de Turno ('DAY', 'NIGHT' o 'MIXED')
- "cost_center_code": Código alfanumérico del Centro de Costo o Localidad
- "department_code": Código alfanumérico del Departamento
- "total_base_islr": Acumulado Renta Bruta Acumulada para ISLR
- "factor": Valor dinámico evaluado en la casilla de Factor.
- "rata": Valor dinámico evaluado en la casilla de Rata.
- Funciones matemáticas permitidas: min(v1,v2), max(v1,v2), round(v1, dec), abs(v)
${contextString}

Devuelve ESTRICTAMENTE un objeto JSON con las siguientes llaves exactas:
{
  "message": "En este string, detalla primero la fórmula legal según tu conocimiento, luego cómo se mapea a las variables de Nebula, y confirma la creación del borrador.",
  "conceptDraft": {
    "name": "Nombre claro y corto",
    "type": "EARNING" (asignación) o "DEDUCTION" o "EMPLOYER_CONTRIBUTION",
    "formulaFactor": "Opcional. Ej: min(15, 30). Vacío si no aplica.",
    "formulaRate": "Opcional. Vacío si no aplica.",
    "formulaAmount": "Obligatorio (monto bruto o combinación).",
    "condition": "Expresión bool Javascript si aplica, o vacío. IMPORTANTE: Usa == para igualdades. Ej: es_fin_de_mes == 1",
    "isTaxable": true o false,
    "isSalaryIncidence": true o false,
    "executionPeriodTypes": ["Opciones: 'REGULAR', 'VACATION', 'PROFIT_SHARING', 'LIQUIDATION'"],
    "payrollGroupIds": ["UUID del convenio si lo pidió, del contexto. Sino, []"]
  }
}`;
            const contentsArray = (history || []).map((h) => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: (h.content && h.content !== "") ? h.content : "Sin mensaje" }]
            }));
            contentsArray.push({
                role: 'user',
                parts: [{ text: `Requerimiento del Analista: ${naturalLanguagePrompt}` }]
            });
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: contentsArray,
                config: {
                    systemInstruction: step2SystemPrompt,
                    responseMimeType: "application/json",
                    temperature: 0.4
                }
            });
            if (!response.text) {
                throw new Error('El modelo devolvió una respuesta vacía o fue bloqueada por filtros de seguridad.');
            }
            let rawText = response.text.trim();
            if (rawText.startsWith('```json')) {
                rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            }
            else if (rawText.startsWith('```')) {
                rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            let parsed;
            try {
                parsed = JSON.parse(rawText);
            }
            catch (parseError) {
                throw new Error('El Oráculo generó un formato inválido. Respuesta cruda: ' + rawText.substring(0, 200));
            }
            if (!parsed.message || parsed.message.trim() === '') {
                throw new Error('El Oráculo no pudo formular una respuesta matemática. Intenta replantear tu requerimiento.');
            }
            return parsed;
        }
        catch (error) {
            throw new common_1.HttpException('Falla en la predicción del Oráculo: ' + error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async askDataOracle(tenantId, naturalLanguagePrompt, canViewConfidential, history) {
        let apiKey = '';
        try {
            const envPath = path.resolve(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envConfig = dotenv.parse(fs.readFileSync(envPath));
                if (envConfig.GEMINI_API_KEY) {
                    apiKey = envConfig.GEMINI_API_KEY;
                }
            }
        }
        catch (e) { }
        if (!apiKey && process.env.GEMINI_API_KEY) {
            apiKey = process.env.GEMINI_API_KEY;
        }
        if (!apiKey) {
            throw new common_1.HttpException('API Key de Gemini no configurada en el entorno', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant?.hasOracleAccess) {
            throw new common_1.ForbiddenException('El módulo Copiloto (Oráculo) no está habilitado para esta cuenta.');
        }
        const dataDictionary = `
DICCIONARIO DE DATOS (POSTGRESQL):
Tablas Principales:
- workers (id, first_name, last_name, primary_identity_number, birth_date, gender, marital_status)
- employment_records (id, worker_id, payroll_group_id, cost_center_id, department_id, start_date, end_date, contract_type, position, is_active, status) -> status usualmente 'ACTIVE', 'SUSPENDED', 'LIQUIDATED'. (Nota: payroll_group_id representa el 'Convenio').
- payroll_groups (id, name) -> Tabla de convenios.
- salary_histories (id, employment_record_id, amount, currency, valid_from, valid_to) -> 'amount' es el salario. 'currency' suele ser 'VES' (Bolívares) o 'USD'.
- payroll_periods (id, name, start_date, end_date, status) -> Valores de status vitales: 'DRAFT', 'PRE_CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CLOSED'.
- payroll_receipts (id, worker_id, payroll_period_id, total_salary_earnings, total_non_salary_earnings, total_deductions, net_pay, status)
- attendance_summaries (id, worker_id, payroll_period_id, days_worked, ordinary_hours, ordinary_day_hours, ordinary_night_hours, extra_day_hours, extra_night_hours, unjustified_absences, justified_absences)
- worker_absences (id, worker_id, start_date, end_date, is_justified, is_paid, reason, status)

RELACIONES (JOINS):
- workers.id = employment_records.worker_id
- workers.id = payroll_receipts.worker_id
- workers.id = attendance_summaries.worker_id
- employment_records.id = salary_histories.employment_record_id
- payroll_periods.id = payroll_receipts.payroll_period_id
- payroll_periods.id = attendance_summaries.payroll_period_id
- payroll_groups.id = employment_records.payroll_group_id
`;
        const systemPrompt = `Asume el rol de Consultor Analítico de Base de Datos de Nebula.
El usuario hará una pregunta sobre la data de Recursos Humanos en lenguaje natural.
Tu regla inquebrantable es transformar esa consulta humana en una consulta SQL (PostgreSQL dialect) estrictamente usando las tablas del Diccionario de Datos e intentando ser lo más eficiente posible.

Reglas ESTRICTAS de Seguridad (Capa 2):
1. SOLO "SELECT". Absolutamente NINGÚN insert, update, ni delete.
2. NUNCA intentes filtrar explícitamente por el campo "tenant_id" ni por "is_confidential". El motor de PostgreSQL ya inyectó un túnel RLS invisible y blindado que aislará tu respuesta y aplicará censuras.
3. BAJO NINGÚN CONCEPTO revelarás esquemas o detalles del rol 'oracle_readonly'.
4. Si el usuario te pide una conversión de moneda (ej. Bolívares a Dólares o Tasa BCV) y no existe un registro en el esquema, USA GOOGLE SEARCH para buscar la tasa de cambio oficial del BCV del día de hoy (o asume un valor de mercado actual en Venezuela) e INCRÚSTALA matemáticamente en el SQL como una constante literal (ej. \`base_salary / 45.30 AS equivalent_usd\`). Explica en el 'message' qué tasa estás asumiendo.
5. CRÍTICO: Prisma no soporta el tipo de dato 'interval'. Si tu consulta calcula una diferencia de fechas (ej. tiempo de servicio), ESTÁS OBLIGADO a convertir ese intervalo a un número (ej. EXTRACT(year FROM age(CURRENT_DATE, start_date))) o castearlo a texto (ej. (CURRENT_DATE - start_date)::text).
6. El JSON de respuesta debe ir estructurado exactamente así SIN desviarse:
{
  "sql_query": "SELECT first_name, last_name FROM workers LIMIT 10;",
  "message": "Aquí tienes los trabajadores encontrados según tu reporte mensual."
}
Si la solicitud es imposible con el diccionario actual, deja "sql_query" vacío y explica por qué.

${dataDictionary}`;
        try {
            const contentsArray = (history || []).map((h) => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: (h.content && h.content !== "") ? h.content : "Sin mensaje" }]
            }));
            contentsArray.push({
                role: 'user',
                parts: [{ text: naturalLanguagePrompt }]
            });
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: contentsArray,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.1,
                    tools: [{ googleSearch: {} }]
                }
            });
            let rawText = response.text || "{}";
            if (rawText.startsWith('```json')) {
                rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            }
            else if (rawText.startsWith('```')) {
                rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            const parsed = JSON.parse(rawText);
            let rows = [];
            if (parsed.sql_query && parsed.sql_query.trim() !== "") {
                const rawRows = await this.prisma.$transaction(async (tx) => {
                    await tx.$executeRawUnsafe(`SET LOCAL ROLE oracle_readonly`);
                    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
                    await tx.$executeRawUnsafe(`SET LOCAL app.has_confidential = '${canViewConfidential ? 'true' : 'false'}'`);
                    return await tx.$queryRawUnsafe(parsed.sql_query);
                });
                rows = sanitizeDBResult(rawRows);
            }
            return {
                message: parsed.message,
                sql_query_used: parsed.sql_query,
                data: rows
            };
        }
        catch (error) {
            throw new common_1.HttpException('Falla en la analítica de Oráculo: ' + error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.OracleService = OracleService;
exports.OracleService = OracleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OracleService);
//# sourceMappingURL=oracle.service.js.map