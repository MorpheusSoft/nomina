# Guía de Despliegue - Nebula Payrolls

Este documento contiene los comandos paso a paso para sincronizar los cambios desde tu entorno de desarrollo local hacia el servidor VPS de producción (Contabo).

## 1. Subir cambios al servidor (Rsync)

Abre una terminal en tu computadora local, dentro de la raíz del proyecto (`/home/lzambrano/Desarrollo/nomina/`), y ejecuta estos comandos. La bandera `--exclude` evitará que subas dependencias enormes o archivos compilados, ahorrando tiempo y posibles conflictos.

**Subir el Backend:**
```bash
rsync -avz --delete --exclude 'node_modules' --exclude '.env' --exclude 'dist' /home/lzambrano/Desarrollo/nomina/backend/ root@154.12.236.210:/var/www/nebulapayrolls/backend/
```

**Subir el Frontend:**
```bash
rsync -avz --delete --exclude 'node_modules' --exclude '.next' /home/lzambrano/Desarrollo/nomina/frontend/ root@154.12.236.210:/var/www/nebulapayrolls/frontend/
```

---

## 2. Compilar y Levantar los Servicios en el Servidor

Una vez finalizada la sincronización, conéctate por SSH a tu VPS de producción:

```bash
ssh root@154.12.236.210
```

Estando dentro de la consola del servidor (Contabo), ejecuta los siguientes comandos para recompilar la aplicación y decirle al motor de procesos `pm2` que levante el nuevo código:

**Actualizar el Backend:**
```bash
# Entrar a la carpeta
cd /var/www/nebulapayrolls/backend

# Instalar nuevos paquetes (si los hubiera)
npm install

# ⚠️ Actualizar la estructura de la base de datos de manera segura SIN perder datos
npx prisma migrate deploy

# Refrescar Prisma Client para adaptar el código a la BD
npx prisma generate

# Construir el código (NestJS)
npm run build

# Reiniciar el servicio
pm2 restart nebula-backend
```

**Actualizar el Frontend:**
```bash
# Entrar a la carpeta
cd /var/www/nebulapayrolls/frontend

# Instalar nuevos paquetes (si los hubiera)
npm install

# Generar la compilación estática (Next.js)
npm run build

# Reiniciar el servicio
pm2 restart nebula-frontend
```

---

### Mantenimiento PM2

Si en algún momento necesitas ver el estado de los procesos, ver sus nombres exactos o la memoria que consumen, usa:
```bash
pm2 list
```

Para ver los logs en vivo (por si algo no arranca):
```bash
pm2 logs
```
