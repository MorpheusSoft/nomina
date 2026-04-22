import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
export declare class FamilyMembersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createFamilyMemberDto: CreateFamilyMemberDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        birthDate: Date | null;
        phone: string | null;
        workerId: string;
        fullName: string;
        identityNumber: string | null;
        relationship: string;
    }>;
    findAll(workerId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        birthDate: Date | null;
        phone: string | null;
        workerId: string;
        fullName: string;
        identityNumber: string | null;
        relationship: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        birthDate: Date | null;
        phone: string | null;
        workerId: string;
        fullName: string;
        identityNumber: string | null;
        relationship: string;
    }>;
    update(id: string, updateFamilyMemberDto: UpdateFamilyMemberDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        birthDate: Date | null;
        phone: string | null;
        workerId: string;
        fullName: string;
        identityNumber: string | null;
        relationship: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        birthDate: Date | null;
        phone: string | null;
        workerId: string;
        fullName: string;
        identityNumber: string | null;
        relationship: string;
    }>;
}
