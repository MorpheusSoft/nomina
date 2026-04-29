# Implementación de Marcajes con Geolocalización (Geocercas)

¡Me parece una idea fantástica! Es una funcionalidad clave para modernizar Nebula, especialmente para trabajadores en campo o esquemas híbridos. Queremos crear "Geocercas" (Geofences) alrededor de los Centros de Costo y validar si el teléfono del trabajador está dentro de ese perímetro al momento de marcar.

Aquí te presento el modelado de cómo lo haríamos, actualizado con tus comentarios y respuestas a tus excelentes dudas.

## User Review Required

> [!IMPORTANT]
> **Aprobación del Plan Final:** Revisa las aclaratorias sobre la tabla de marcajes y el **Modo Offline**. Si te parece bien cómo abordaremos la falta de internet, confírmame para empezar a escribir el código de la Fase 1.

---

## 💡 Respuestas a tus Preguntas

**¿En qué tabla vas a guardar el marcaje? ¿Funcionará como si fuera un biométrico?**
Exactamente. Se guardará en la misma tabla `AttendancePunch` que ya usamos para los relojes biométricos. Esta tabla ya tiene un campo llamado `source` (origen). Los biométricos envían `source = 'BIOMETRIC'`, y el teléfono enviará `source = 'MOBILE'` o `WEB`. 
Al guardarlo en esta misma tabla, el **Motor de Asistencia de Nebula (Attendance Engine)** lo procesará automáticamente de la misma forma que si el trabajador hubiera puesto su huella en un aparato físico. ¡No hay que reprogramar el motor de nómina!

**¿Qué pasaría si el dispositivo no tiene internet? (Modo Offline)**
Para solucionar esto, convertiremos la pantalla de marcaje en una **PWA (Progressive Web App)** con capacidades "Offline-First":
1. **Sincronización Previa:** Cuando el trabajador inicia sesión con internet, la app descarga las coordenadas y el radio de su Centro de Costo.
2. **Marcaje sin Internet:** Si el trabajador marca y no hay datos/wifi, el teléfono captura la hora exacta y las coordenadas GPS, y hace la validación de distancia internamente en el teléfono.
3. **Almacenamiento Local:** El marcaje se guarda en la memoria interna del teléfono (Bandeja de Salida / Outbox).
4. **Sincronización Automática:** Tan pronto el teléfono recupere la conexión a internet, enviará silenciosamente todos los marcajes guardados al backend para que Nebula los registre oficialmente.

---

## 1. Modelado de Datos (Prisma Schema)

### `CostCenter` (Centro de Costo)
Agregamos los campos de ubicación. Como sugeriste, el radio será un campo editable en la pantalla del Centro de Costo.
```prisma
model CostCenter {
  // ... campos actuales
  latitude      Decimal? @db.Decimal(10, 8) // Ej: 10.480593
  longitude     Decimal? @db.Decimal(11, 8) // Ej: -66.903606
  allowedRadius Int      @default(100) @map("allowed_radius") // Campo configurable en la UI (en metros)
}
```

### `AttendancePunch` (Marcaje)
Agregamos campos para la auditoría geográfica.
```prisma
model AttendancePunch {
  // ... campos actuales
  latitude        Decimal? @db.Decimal(10, 8)
  longitude       Decimal? @db.Decimal(11, 8)
  locationStatus  String?  @db.VarChar(30) // Ej: "VALID" o "REJECTED_OUT_OF_RANGE"
  isValid         Boolean  @default(true) @map("is_valid") // Si es falso, el motor de asistencia lo ignora, pero queda para auditoría
}
```
*Nota: Como solicitaste, guardaremos los intentos fallidos. Si alguien marca desde su casa, se guardará en la base de datos con `locationStatus = "REJECTED_OUT_OF_RANGE"` y `isValid = false`, para que Recursos Humanos pueda auditar quién está intentando hacer trampa.*

---

## 2. Lógica del Backend (El Motor Geográfico)

1. **Fórmula de Haversine:** Crearemos un servicio matemático en el backend para calcular la distancia en metros entre las coordenadas del teléfono y el Centro de Costo.
2. **Flujo del Endpoint:**
   - El móvil envía: `{ workerId, timestamp, type: "IN", source: "MOBILE", latitude: ..., longitude: ... }`.
   - El backend busca el `CostCenter` del trabajador.
   - Calcula la distancia en metros.
   - **Dentro del radio (Ej: 45m <= 100m permitidos):** Guarda el `AttendancePunch` con `isValid = true`.
   - **Fuera del radio (Ej: 5000m > 100m):** Guarda el `AttendancePunch` con `isValid = false` y `locationStatus = "REJECTED_OUT_OF_RANGE"`. Retorna error `403` al móvil.

---

## 3. Plan de Acción (Paso a Paso)

### Fase 1: Base de Datos y Backend (Core)
- [ ] Actualizar el esquema de Prisma (`schema.prisma`) añadiendo latitud, longitud y radio en `CostCenter`, y datos geográficos en `AttendancePunch`.
- [ ] Generar la migración de base de datos.
- [ ] Crear el servicio `GeoLocationService` con la fórmula Haversine.
- [ ] Modificar el endpoint de creación de marcajes para validar la geocerca.

### Fase 2: Backend (Mantenimiento de Centros de Costo)
- [ ] Actualizar el controlador y DTOs de `cost-centers` para permitir guardar `latitude`, `longitude` y `allowedRadius`.

### Fase 3: Frontend Administrativo (Nebula Web)
- [ ] En la pantalla de Centros de Costo, agregar inputs numéricos para Latitud, Longitud y Radio.
- [ ] (Opcional) En el Centro de Auditoría Forense, mostrar un mapa pequeño o las coordenadas si el marcaje vino de un móvil y fue rechazado.

### Fase 4: Frontend Móvil / PWA (Modo Offline)
- [ ] Crear la interfaz "Mobile-friendly" para marcar entrada/salida.
- [ ] Integrar `navigator.geolocation` para obtener GPS.
- [ ] Implementar la caché local (IndexedDB) para guardar la configuración del Centro de Costo y los marcajes cuando no haya internet, con re-intento automático al recuperar conexión.

---

## Verification Plan
1. **Prueba de API Manual:** Enviaremos marcajes simulados dentro y fuera del radio definido, verificando que los fuera de rango se guarden pero con la bandera `isValid = false`.
2. **Prueba Offline:** Apagar el Wi-Fi/Datos del entorno de desarrollo, presionar "Marcar", encender Wi-Fi y verificar que el marcaje suba a la base de datos automáticamente con el Timestamp original.
