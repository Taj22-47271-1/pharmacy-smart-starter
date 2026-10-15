import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { MovementType } from './dto/create-stock-movement.dto';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn(async (cb) => {
        return cb(mockPrisma);
      }),
      medicine: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
    };

    service = new StockMovementsService(mockPrisma);
  });

  it('should increase stock when type is IN', async () => {
    mockPrisma.medicine.findUnique.mockResolvedValue({
      id: 'med-1',
      name: 'Napa',
      quantity: 50,
    });
    mockPrisma.stockMovement.create.mockResolvedValue({ id: 'mov-1' });
    mockPrisma.medicine.update.mockResolvedValue({
      id: 'med-1',
      name: 'Napa',
      quantity: 70,
    });

    const result = await service.create({
      medicineId: 'med-1',
      quantity: 20,
      type: MovementType.IN,
      note: 'Supplier delivery',
    });

    expect(mockPrisma.medicine.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'med-1' },
        data: { quantity: 70 },
      }),
    );
    expect(result.medicine.quantity).toBe(70);
  });

  it('should reject OUT movement if current stock is insufficient (prevent negative stock)', async () => {
    mockPrisma.medicine.findUnique.mockResolvedValue({
      id: 'med-1',
      name: 'Napa',
      quantity: 5,
    });

    await expect(
      service.create({
        medicineId: 'med-1',
        quantity: 10,
        type: MovementType.OUT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if medicine does not exist', async () => {
    mockPrisma.medicine.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        medicineId: 'unknown',
        quantity: 5,
        type: MovementType.IN,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

