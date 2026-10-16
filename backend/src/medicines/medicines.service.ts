import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, lowStockOnly?: boolean) {
    const where: any = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const medicines = await this.prisma.medicine.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (lowStockOnly) {
      return medicines.filter((m) => m.quantity <= m.reorderThreshold);
    }

    return medicines;
  }

  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: {
        supplier: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    return medicine;
  }

  async create(dto: CreateMedicineDto) {
    const existing = await this.prisma.medicine.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new ConflictException(`Medicine with SKU "${dto.sku}" already exists`);
    }

    return this.prisma.medicine.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        quantity: dto.quantity ?? 0,
        reorderThreshold: dto.reorderThreshold ?? 10,
        unitPrice: dto.unitPrice,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        supplierId: dto.supplierId || null,
      },
      include: {
        supplier: true,
      },
    });
  }

  async update(id: string, dto: UpdateMedicineDto) {
    await this.findOne(id);

    if (dto.sku) {
      const existing = await this.prisma.medicine.findUnique({
        where: { sku: dto.sku },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Medicine with SKU "${dto.sku}" already exists`);
      }
    }

    const data: any = { ...dto };
    if (dto.expiryDate !== undefined) {
      data.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    }

    return this.prisma.medicine.update({
      where: { id },
      data,
      include: {
        supplier: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({
        where: { medicineId: id },
      });
      return tx.medicine.delete({
        where: { id },
      });
    });
  }

  async getDashboardStats() {
    const [totalMedicines, totalSuppliers, allMedicines] = await Promise.all([
      this.prisma.medicine.count(),
      this.prisma.supplier.count(),
      this.prisma.medicine.findMany({
        select: {
          quantity: true,
          reorderThreshold: true,
          unitPrice: true,
        },
      }),
    ]);

    const lowStockCount = allMedicines.filter(
      (m) => m.quantity <= m.reorderThreshold,
    ).length;

    const totalStockValue = allMedicines.reduce(
      (sum, m) => sum + m.quantity * Number(m.unitPrice),
      0,
    );

    return {
      totalMedicines,
      lowStockItems: lowStockCount,
      totalSuppliers,
      totalStockValue: Number(totalStockValue.toFixed(2)),
    };
  }
}

