import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.supplier.findMany({
      include: {
        _count: {
          select: { medicines: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: { medicines: true },
    });
  }

  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: dto,
    });
  }
}

