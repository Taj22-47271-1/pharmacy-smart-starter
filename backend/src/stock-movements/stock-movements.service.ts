import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStockMovementDto,
  MovementType,
} from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStockMovementDto) {
    return this.prisma.$transaction(async (tx) => {
      const medicine = await tx.medicine.findUnique({
        where: { id: dto.medicineId },
      });

      if (!medicine) {
        throw new NotFoundException(`Medicine with ID ${dto.medicineId} not found`);
      }

      let newQuantity = medicine.quantity;

      if (dto.type === MovementType.IN) {
        newQuantity += dto.quantity;
      } else if (dto.type === MovementType.OUT) {
        if (medicine.quantity < dto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${medicine.name}". Current available: ${medicine.quantity}, requested: ${dto.quantity}. Stock cannot be negative.`,
          );
        }
        newQuantity -= dto.quantity;
      } else if (dto.type === MovementType.ADJUSTMENT) {
        // Direct count adjustment
        newQuantity = dto.quantity;
      }

      // 1. Record stock movement audit entry
      const movement = await tx.stockMovement.create({
        data: {
          medicineId: dto.medicineId,
          quantity: dto.quantity,
          type: dto.type,
          note: dto.note ?? null,
        },
      });

      // 2. Update medicine quantity atomically
      const updatedMedicine = await tx.medicine.update({
        where: { id: dto.medicineId },
        data: { quantity: newQuantity },
        include: { supplier: true },
      });

      return {
        movement,
        medicine: updatedMedicine,
      };
    });
  }

  async findAll(medicineId?: string) {
    const where = medicineId ? { medicineId } : {};
    return this.prisma.stockMovement.findMany({
      where,
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

