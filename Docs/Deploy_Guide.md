# Guía de Despliegue a Producción (VPS: vmi2995455)

Esta guía documenta los pasos para actualizar el servidor de producción.

## 1. Descargar los cambios con Git
Asegúrate de estar en la carpeta correcta del proyecto en tu servidor (la ruta que te indique PM2). Una vez dentro de la carpeta raíz del proyecto, ejecuta:

```bash
git pull origin main
```

## 2. Actualizar el Backend y Base de Datos
A continuación, entra a la carpeta del backend y ejecuta:

```bash
cd /var/www/nebulapayrolls/backend

# Sincroniza la estructura de la base de datos de producción
npx prisma db push

# Re-genera el cliente de Prisma
npx prisma generate

# Compila el nuevo código TypeScript a JavaScript
npm run build

# Reinicia el servicio en segundo plano
pm2 restart nebula-backend
```

## 3. Actualizar el Frontend
De forma similar, ahora ve a la carpeta del frontend y compílalo:

```bash
cd /var/www/nebulapayrolls/frontend

# Compila la interfaz de usuario para producción
npm run build

# Reinicia el panel administrativo
pm2 restart nebula-frontend
```

## Recomendación Futura (Opcional)
Para evitar copiar archivos manualmente con FTP, lo ideal sería configurar Git en el servidor productivo. Para hacerlo en el futuro, podrías respaldar tus archivos `.env`, borrar la carpeta `/var/www/nomina`, hacer un `git clone https://github.com/MorpheusSoft/nomina.git`, y a partir de ahí sí podrías usar `git pull origin main` para siempre.
