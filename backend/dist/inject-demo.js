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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando inyección de datos de prueba...');
    const passwordHash = bcrypt.hashSync('123456', 10);
    let tenant = await prisma.tenant.findFirst({
        where: { taxId: 'J-12345678-9' }
    });
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'Empresa Demo CA',
                taxId: 'J-12345678-9',
                isActive: true,
                maxActiveWorkers: 50,
            }
        });
    }
    let role = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: 'Administrador' }
    });
    if (!role) {
        role = await prisma.role.create({
            data: {
                tenantId: tenant.id,
                name: 'Administrador',
                permissions: ['ALL']
            }
        });
    }
    const email = 'demo-admin@empresa.com';
    let user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: 'Admin',
                lastName: 'Demo',
                tenantId: tenant.id,
                roleId: role.id,
                isActive: true,
            }
        });
    }
    else {
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        });
    }
    const access = await prisma.userTenantAccess.findFirst({
        where: { userId: user.id, tenantId: tenant.id }
    });
    if (!access) {
        await prisma.userTenantAccess.create({
            data: {
                userId: user.id,
                tenantId: tenant.id,
                roleId: role.id,
            }
        });
    }
    let worker = await prisma.worker.findFirst({
        where: { tenantId: tenant.id, primaryIdentityNumber: 'V-12345678' }
    });
    if (!worker) {
        worker = await prisma.worker.create({
            data: {
                tenantId: tenant.id,
                primaryIdentityNumber: 'V-12345678',
                firstName: 'Juan',
                lastName: 'Pérez',
                birthDate: new Date('1990-01-01'),
                gender: 'MALE',
                nationality: 'V',
                maritalStatus: 'SINGLE',
            }
        });
        await prisma.employmentRecord.create({
            data: {
                workerId: worker.id,
                tenantId: tenant.id,
                startDate: new Date('2020-01-01'),
                contractType: 'INDEFINITE',
                position: 'Analista de Sistemas',
                isActive: true,
                isConfidential: false,
            }
        });
    }
    console.log('--- Datos Inyectados con Éxito ---');
    console.log(`URL de Acceso: http://localhost:3000/`);
    console.log(`Usuario: demo-admin@empresa.com`);
    console.log(`Contraseña: 123456`);
    console.log(`Trabajador de prueba creado: Juan Pérez (V-12345678)`);
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=inject-demo.js.map