# Manejo de Guardias Mixtas y Plantillas (Fase 2)

## 1. Evolución del Modelo de Fichaje y Guardias (Turnos)

Las normativas laborales en industrias híbridas (como perforación y campos petroleros) exigen controles exactos en guardias no-ordinarias (ej. 7x7, 14x14 o el formato rotativo "5556" que abarca Diurno, Mixto y Nocturno). Un error clásico en análisis de nómina es evaluar guardias nocturnas como ausencias injustificadas del turno diurno.

A su vez, aunque un trabajador se encuentre programado para laborar un Domingo, dicho día cuenta con recargos de bono dominical de Ley, y si labora un Sábado estipulado como día de descanso legal, posee otros recargos. Por tanto, es requerido aislar contadores de "Sábados Trabajados" y "Domingos Trabajados".

### 1.1. Modificación de Arquitectura a Nivel de Cuadrillas
Se eliminará la configuración individual por trabajador para evitar redundancia (violación DRY) y sobrecarga en el área de RRHH. La configuración de Guardia estará adosada orgánicamente al modelo de Cuadrilla (`Crew`), ya que el trabajador estructuralmente pertenece a: `Centro Costo -> Departamento -> Cuadrilla`.

**Modelo Prisma Modificado:**
```prisma
model Crew {
  // ... campos actuales
  
  // ADN del Turno
  scheduleType   String   @default("FIXED_WEEKDAYS") // o 'ROTATING_PATTERN'
  patternAnchor  DateTime? @db.Date // El día base 0 en que la Cuadrilla "A" arranca su ciclo.
  
  // Secuencia Oculta Computacional (Nuestra cinta de casillas rotativas)
  patternSequence Json? // Ej: [{type:"WORK", start:"07:00", end: "15:00"}, {type:"REST"}, ...]
}
```

**Resúmenes de Asistencia (`DailyAttendance` y `AttendanceSummary`):**
Añadir soporte estadístico contable para exportar a la nómina:
```prisma
  saturdaysWorked Decimal @default(0) @map("saturdays_worked") @db.Decimal(15, 2)
  sundaysWorked   Decimal @default(0) @map("sundays_worked") @db.Decimal(15, 2)
```

### 1.2. Intervención en el Motor de Fichajes
El motor de asistencia calculará bajo un modelo matemático Ultra-Eficiente `O(1)`:

1. **Reconocer el Patrón de Cuadrilla (Matemático):**
   - El Engine evalúa la fecha actual (ej. un Jueves).
   - Divide la fecha actual contra el `patternAnchor` de la Cuadrilla aplicando el Operador Módulo (`% array.length`). Automáticamente arrojará el índice de JSON que toca (ej. Índice 25 = Turno Nocturno).
   - El Motor pasa directamente a evaluar las huellas enviadas por el biométrico contra el horario pre-asignado a ese índice sin necesidad de condicionales masivos ni historiales, resolviendo con éxito turnos 24 horas y trasnoches.

2. **Días de Descanso Ocasionales (`workedRestDays`):**
   - Si la secuencia JSON arrojó que ese día tocaba `{type: "REST"}`, pero el obrero tiene marcas físicas en las puertas de la compañía, se otorga descanso laborado y se activa el contador.

3. **Independencia del Calendario Sábado/Domingo:**
   - De manera agnóstica a la secuencia del JSON, si la fecha del calendario estricto (`.getDay()`) indica Sábado (6) o Domingo (0) y el estatus laboral es `PRESENT`, el Motor alimentará incondicionalmente a las variables de `saturdaysWorked` o `sundaysWorked`, pasándolas sin procesar hacia el Consolidador de Nómina para sus recargos.

### 1.3. Frontend y Experiencia de Usuario (UX)
El analista de RRHH no alimentará arreglos de secuencias manualmente.
- Se construirá un formulario UX en "Configuraciones -> Cuadrillas".
- Permitirá armar las rotaciones visualmente a través de constructores, por ejemplo: [7 Días] Diurno + [7 Días] Descanso.
- En la Ficha del Trabajador, la entrada de datos será `1 clic`: seleccionar a qué Cuadrilla pertenecerá. La herencia será automática.
