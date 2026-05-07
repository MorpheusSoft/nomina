# Proyecto: Flyer de Nebula Payrolls

Este directorio contiene todo el código, diseño y programas necesarios para generar y editar el Flyer publicitario de Nebula Payrolls. 

Está construido utilizando tecnologías modernas (React, Vite y Tailwind CSS) para asegurar que el diseño sea escalable (vectores que no se pixelan) y muy fácil de modificar.

---

## 📂 Estructura de Archivos Clave

A continuación te explico qué hace cada archivo importante en esta carpeta:

### 1. `src/App.jsx` (El corazón del diseño)
Este es el archivo principal donde está escrito todo el contenido visual del flyer.
- **Qué hace:** Aquí encontrarás todos los textos de ventas (ej. "¿Perdiendo días en cálculos de nómina?"), la información de contacto (`lzambrano@nebulapayrolls.com`), los íconos y la estructura en bloques.
- **Cuándo modificarlo:** Ábrelo si quieres cambiar alguna palabra, agregar un nuevo beneficio o modificar el número de WhatsApp.

### 2. `print_pdf.js` (El motor de exportación)
Este es un script personalizado escrito en Node.js utilizando una librería llamada Puppeteer.
- **Qué hace:** Simula abrir un navegador Google Chrome de forma invisible (headless), toma el diseño web creado en `App.jsx`, lo ajusta para evitar fallos de impresión en los colores y toma dos "fotografías" perfectas.
- **Resultado:** Genera y sobreescribe automáticamente los archivos finales (`Nebula_Flyer_Vertical.pdf` y `Nebula_Flyer_Completo.png`) directamente en tu carpeta `/home/lzambrano/Documents/`.
- **Cuándo ejecutarlo:** Debes correr este archivo cada vez que termines de hacerle cambios al flyer y quieras obtener tus nuevas imágenes y PDFs para enviar a clientes.

### 3. `src/index.css` (Estilos Base)
- **Qué hace:** Importa todas las clases de diseño de Tailwind CSS y contiene configuraciones especiales para el momento de la impresión (`@media print`), como la escala de la página y la corrección de fondos transparentes para que el PDF salga impecable.

### 4. `package.json` y `vite.config.js` (Configuraciones del sistema)
- **Qué hacen:** Son los archivos que le dicen a tu computadora qué herramientas necesita el proyecto (React, Tailwind, íconos Lucide, y Puppeteer). Generalmente **no necesitas tocarlos**, ya están configurados para funcionar a la perfección.

---

## 🚀 ¿Cómo trabajar con este proyecto?

Si deseas hacer una actualización en el futuro, sigue este flujo de trabajo de 3 pasos:

### Paso 1: Encender el entorno visual
Abre tu terminal, entra a esta carpeta y levanta el servidor de desarrollo:
\`\`\`bash
cd /home/lzambrano/Desarrollo/AnalisisDatos/nebula-flyer
npm run dev
\`\`\`
Esto te dará un enlace (usualmente `http://localhost:5173/`). Ábrelo en tu navegador web para ver el flyer.

### Paso 2: Editar el contenido
Abre el archivo `src/App.jsx` en tu editor de código favorito (como VS Code). 
A medida que cambies los textos y guardes el archivo, tu navegador web se actualizará **mágicamente y en tiempo real** para mostrarte cómo van quedando los cambios.

### Paso 3: Exportar el trabajo final
Cuando ya estés feliz con cómo luce tu diseño en el navegador, abre otra pestaña en tu terminal (sin cerrar la que está corriendo el servidor) y ejecuta el generador:
\`\`\`bash
node print_pdf.js
\`\`\`
¡Y listo! Ve a tu carpeta de **Documentos** y allí te estarán esperando tu nuevo PDF y PNG en máxima resolución.
