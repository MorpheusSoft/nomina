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

**¿Desde dónde tendrá acceso el empleado a esta aplicación?**
El empleado accederá a través de un **Portal del Empleado (PWA)** en el navegador web de su teléfono móvil (Safari, Chrome). Al ser una PWA (Progressive Web App), el empleado podrá pulsar "Añadir a la pantalla de inicio" y se instalará como si fuera una aplicación nativa, con su propio icono.
*Importante:* No descargará todo el sistema Nebula (que es muy pesado), será una "mini-app" satélite ultra ligera, diseñada específicamente para los trabajadores de campo. Inicialmente solo tendrá la pantalla de Login y el botón de Marcar Asistencia.

**¿Cómo sabrá el sistema qué empleado está marcando?**
El empleado tendrá que iniciar sesión en esta PWA. Dado que muchos obreros no tienen correo electrónico, el login puede ser con **Cédula de Identidad + un PIN de 4 dígitos**. Una vez que inicia sesión, la aplicación guarda un "Token Seguro" (JWT) en el teléfono. Cada vez que presione "Marcar", el teléfono enviará este token al servidor, identificando exactamente su `workerId`.

**¿Cómo evitamos que una persona marque por otra (Buddy Punching)?**
Para evitar que un empleado se lleve el teléfono de su compañero y marque por él, implementaremos **Medidas Anti-Fraude**:
1. **Selfie Probatorio (Recomendado):** Al momento de presionar "Marcar", la aplicación exige una foto. 
   - *Optimización (Peso):* Para no colapsar el servidor, la foto se comprime y reduce de tamaño automáticamente en el mismo teléfono (de 5MB a ~50KB) antes de enviarse. Las fotos se guardan en un almacenamiento en la nube (ej. AWS S3) y en la base de datos solo guardamos la URL (`photoUrl`).
   - *Teléfonos Compartidos:* Esta es la mejor opción si un trabajador se queda sin batería y necesita usar el teléfono de su supervisor o compañero. Simplemente cierra la sesión del compañero, ingresa con su cédula, y la selfie garantizará que es él.
2. **Biometría Nativa del Teléfono (WebAuthn):** Podemos exigir que el empleado apruebe el marcaje con su huella dactilar (FaceID/TouchID). 
   - *Peso:* Es 0% pesado. El teléfono no envía la huella al servidor, solo envía una firma criptográfica (un texto pequeño).
   - *Desventaja:* Si usamos biometría, el trabajador **no podrá usar el teléfono de un compañero**, porque la huella registrada en ese teléfono pertenece al dueño.
3. **Bloqueo por Dispositivo:** Podemos registrar internamente desde qué teléfono inicia sesión el trabajador. Si intenta usar otro, el sistema lo bloquea.

**¿Cómo será la interfaz para agregar coordenadas al centro de costo?**
En lugar de obligar al administrador a buscar latitud y longitud manualmente en Google, integraremos un **Mapa Interactivo (ej. Leaflet/OpenStreetMap que es gratuito)** directamente en el formulario de creación/edición del Centro de Costo en *Nebula Web*. El usuario podrá buscar una dirección, soltar un marcador ("pin") en el mapa y usar un deslizador (slider) para ajustar el radio. El mapa dibujará un círculo para que el administrador vea visualmente el perímetro permitido.

**A nivel de negocio, tengo pensado cobrar esto aparte.**
¡Me parece una excelente estrategia de monetización (Upselling)! Para implementarlo a nivel técnico, agregaremos una "Feature Flag" o permiso en la tabla `Tenant` (Empresa) llamado `hasGeofencingAccess`. 
Si un cliente no ha pagado por el módulo, al intentar acceder a la configuración de geocercas en el Centro de Costo verá un *Paywall* con un mensaje persuasivo: *"Desbloquea el control total de tu personal en campo. Actualiza tu plan para activar Geocercas"*.

---

## 1. Modelado de Datos (Prisma Schema)

### `Tenant` (Licenciamiento / Monetización)
Para controlar el cobro de esta funcionalidad, agregamos una bandera de acceso a nivel de compañía:
```prisma
model Tenant {
  // ... campos actuales
  hasGeofencingAccess Boolean @default(false) @map("has_geofencing_access") // Define si el cliente pagó por este módulo
}
```

### `WorkLocation` (Locación Geográfica - Nuevo)
Creamos una tabla maestra para guardar las ubicaciones y reutilizarlas en varios centros de costo, evitando repetir el mapa.
```prisma
model WorkLocation {
  id            String       @id @default(uuid()) @db.Uuid
  tenantId      String       @map("tenant_id") @db.Uuid
  name          String       @db.VarChar(150) // Ej: "Muelle Los Haticos"
  latitude      Decimal?     @db.Decimal(10, 8)
  longitude     Decimal?     @db.Decimal(11, 8)
  allowedRadius Int          @default(100) @map("allowed_radius")
  
  costCenters   CostCenter[]
  tenant        Tenant       @relation(fields: [tenantId], references: [id])
  @@map("work_locations")
}
```

### `CostCenter` (Centro de Costo)
Asociamos el centro de costo a una locación pre-creada.
```prisma
model CostCenter {
  // ... campos actuales
  workLocationId String?       @map("work_location_id") @db.Uuid
  workLocation   WorkLocation? @relation(fields: [workLocationId], references: [id])
}
```

### `AttendancePunch` (Marcaje)
Agregamos campos para la auditoría geográfica y anti-fraude.
```prisma
model AttendancePunch {
  // ... campos actuales
  latitude        Decimal? @db.Decimal(10, 8)
  longitude       Decimal? @db.Decimal(11, 8)
  locationStatus  String?  @db.VarChar(30) // Ej: "VALID" o "REJECTED_OUT_OF_RANGE"
  isValid         Boolean  @default(true) @map("is_valid") // Si es falso, el motor de asistencia lo ignora, pero queda para auditoría
  photoUrl        String?  @db.VarChar(255) @map("photo_url") // URL de la selfie probatoria para auditoría anti-fraude
}
```
*Nota: Como solicitaste, guardaremos los intentos fallidos. Si alguien marca desde su casa, se guardará en la base de datos con `locationStatus = "REJECTED_OUT_OF_RANGE"` y `isValid = false`, para que Recursos Humanos pueda auditar quién está intentando hacer trampa.*

### `User` (Usuarios Administrativos)
Para resolver quién es supervisor sin inventar permisos nuevos, **enlazaremos la cuenta de Usuario de Nebula con la Ficha del Trabajador**.
```prisma
model User {
  // ... campos actuales
  workerId       String?   @unique @map("worker_id") @db.Uuid // Enlace a la tabla Worker
}
```
*Lógica:* El empleado inicia sesión con su Cédula + PIN en el móvil. El sistema busca su `Worker`. Si ese `Worker` tiene un `User` enlazado cuyo Rol tiene permisos de "Supervisor", ¡boom! Se activa el Modo Quiosco.

---

## 2. Lógica del Backend (El Motor Geográfico)

1. **Fórmula de Haversine:** Crearemos un servicio matemático en el backend para calcular la distancia en metros entre las coordenadas del teléfono y el Centro de Costo.
2. **Punto de Marcaje (Check-in Location):** La validación será siempre estricta sin excepciones. La responsabilidad recae en cómo el Administrador configura el Centro de Costo:
   - *Escenario con Despachador:* Si la cuadrilla marca en el Muelle antes de ir al taladro, las coordenadas del Centro de Costo deben ser las del Muelle. El sistema validará que el supervisor efectivamente esté en el Muelle al tomar la asistencia.
   - *Escenario Individual:* Si no hay supervisor en el punto de encuentro, las coordenadas del Centro de Costo serán las del destino final de trabajo.
3. **Flujo del Endpoint:**
   - El móvil envía: `{ workerId, timestamp, latitude, longitude }`.
   - Calcula la distancia en metros al `CostCenter` del trabajador.
   - **Dentro del radio:** Guarda con `isValid = true`.
   - **Fuera del radio:** Guarda con `isValid = false` y `locationStatus = "REJECTED_OUT_OF_RANGE"`. Retorna error `403`.

---

## 3. Plan de Acción (Paso a Paso)

### Fase 1: Base de Datos y Backend (Core)
- [ ] Actualizar el esquema de Prisma (`schema.prisma`): crear el modelo `WorkLocation` (Locaciones) y enlazarlo a `CostCenter` mediante `workLocationId`. Añadir datos geográficos a `AttendancePunch`.
- [ ] Generar la migración de base de datos.
- [ ] Crear el servicio `GeoLocationService` con la fórmula Haversine.
- [ ] Modificar el endpoint de creación de marcajes para validar la geocerca usando la latitud y longitud de la `WorkLocation` asignada al centro de costo.

### Fase 2: Backend (Mantenimiento de Locaciones)
- [ ] Crear el CRUD (Controlador y DTOs) para `WorkLocation` permitiendo guardar `latitude`, `longitude` y `allowedRadius`.
- [ ] Actualizar el CRUD de `cost-centers` para que acepte el `workLocationId`.

### Fase 3: Frontend Administrativo (Nebula Web)
- [ ] En la pantalla de Centros de Costo, integrar un **mapa interactivo (ej. Leaflet/OpenStreetMap)** donde el administrador pueda buscar una dirección, soltar un "pin" y ajustar el radio visualmente con un slider.
- [ ] Implementar el "Paywall" en la UI de Centros de Costo que bloquee el mapa si el `Tenant` no tiene `hasGeofencingAccess = true`.
- [ ] **Onboarding de la PWA (Código QR):** Crear una sección o modal en Nebula Web llamado "App de Asistencia". Mostrará un código QR dinámico que apunta a la URL de la PWA, y un botón de "Descargar App" (por si el usuario ya está navegando desde un celular). Esto elimina la necesidad de enviar URLs por WhatsApp.
- [ ] (Opcional) En el Centro de Auditoría Forense, mostrar un mapa pequeño o las coordenadas si el marcaje vino de un móvil y fue rechazado.

### Fase 4: Frontend Móvil / PWA (Portal del Empleado y Supervisor)
- [ ] Construir la interfaz PWA "Mobile-friendly" ultra ligera, separada del ERP principal.
- [ ] **Modo Empleado:** Implementar Login mediante Cédula + PIN que devuelva un JWT para identificar al trabajador (`workerId`).
- [ ] **Modo Supervisor (Quiosco / Pase de Lista):** 
  - Al iniciar sesión (con Cédula+PIN enlazada a un Usuario), la PWA presenta un flujo de **Sincronización Offline**:
    1. Pregunta al usuario si va a trabajar *Online* o *Offline*.
    2. **Selección de Locación:** Muestra un menú desplegable con los nombres de las locaciones grabadas (Ej: "Muelle Los Haticos"). El supervisor puede hacer esto en su casa con Wi-Fi antes de ir al campo.
    3. Al seleccionar la locación, presiona "Descargar Cuadrillas".
    4. La PWA descarga automáticamente **todos** los Centros de Costo y obreros asociados a esa Locación y los guarda en la caché del teléfono (IndexedDB).
  - **Múltiples Cuadrillas (UI):** La lista descargada se mostrará en **Acordeones colapsables** por Centro de Costo.
  - Se incluirá una **Barra de Búsqueda Rápida** en la parte superior para filtrar obreros al instante.
  - El supervisor toca el nombre del obrero -> se abre la cámara frontal -> Selfie obligatoria -> se guarda el marcaje localmente -> el obrero cambia a color Verde en la lista.
- [ ] Integrar `navigator.geolocation` para obtener GPS al pulsar el botón de marcado.
- [ ] Implementar la caché local (IndexedDB) para guardar la configuración del Centro de Costo, la lista de la cuadrilla y los marcajes offline, con re-intento automático al recuperar conexión.

---

## Verification Plan
1. **Prueba de API Manual:** Enviaremos marcajes simulados dentro y fuera del radio definido, verificando que los fuera de rango se guarden pero con la bandera `isValid = false`.
2. **Prueba Offline:** Apagar el Wi-Fi/Datos del entorno de desarrollo, presionar "Marcar", encender Wi-Fi y verificar que el marcaje suba a la base de datos automáticamente con el Timestamp original.

---

## 4. Reporte de Ejecución (Trabajo Realizado)

A continuación se detalla el trabajo efectivamente implementado en el sistema basado en este plan original:

### Base de Datos y Backend (Core & API)
1. **Modelos de Prisma:** Se actualizó `schema.prisma` incorporando el modelo `WorkLocation` y su relación con `CostCenter`. Se actualizaron los campos de `AttendancePunch` para registrar coordenadas geográficas y estatus de validez.
2. **Motor Geográfico (`GeoLocationService`):** Se implementó exitosamente el servicio matemático basado en la fórmula Haversine en `src/attendance-punches/attendance-punches.service.ts` para calcular distancias en metros de forma precisa.
3. **API y Multi-tenant:** 
   - Se crearon los endpoints CRUD en `WorkLocationsController` protegidos con `JwtAuthGuard` y confinados al `tenantId` correspondiente.
   - El backend completo fue actualizado para operar bajo el prefijo global `/api/v1`.

### Frontend Administrativo (Nebula Web)
1. **Componente de Mapa (`MapPicker`):** Se desarrolló un componente avanzado utilizando `react-leaflet` con la capacidad de buscar lugares mediante la API gratuita de Nominatim (OpenStreetMap) y ajustar visualmente el punto de marcaje y el radio de la geocerca.
2. **Administración de Locaciones:** Se creó el componente `WorkLocationsManager.tsx` y se integró limpiamente como una ventana flotante dentro de la edición de **Centros de Costo** (`app/settings/organization/page.tsx`), optimizando el uso de la barra lateral izquierda.
3. **Generación de QR (Onboarding PWA):** Se habilitó la generación de códigos QR (con `qrcode.react`) tanto en el Landing Page principal como en el panel administrativo, facilitando la instalación rápida en los teléfonos de campo sin necesidad de tipear la URL.

### Frontend PWA (Portal de Campo)
1. **Modo Quiosco (Supervisor):** Se estructuró la aplicación satélite PWA (`/pwa/`) con un layout independiente, enfocado en dispositivos móviles y de carga ultrarrápida.
2. **Interfaz de Pase de Lista:** Se desarrolló la interfaz del supervisor que incluye:
   - Acordeones colapsables por Cuadrilla / Centro de Costo.
   - Buscador rápido de personal en tiempo real.
   - Interfaz gráfica lista para la Sincronización Offline.

### Siguientes Pasos Técnicos (Pendientes a Futuro)
- Conectar la UI de sincronización de la PWA a la base de datos local del navegador (`IndexedDB`) para habilitar el guardado físico de los marcajes fuera de línea.
- Activar las Web APIs nativas de HTML5 (`navigator.geolocation` y `MediaDevices` para fotos) al momento de presionar el botón de "Tomar Asistencia" en el modo Quiosco.
