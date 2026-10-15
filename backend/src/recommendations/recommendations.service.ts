import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReorderRecommendation {
  medicineId: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  reason: string;
  suggestedReorderQuantity: number;
  unitPrice: number;
  estimatedCost: number;
  supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReorderRecommendations(): Promise<{
    generatedAt: string;
    ruleExplanation: string;
    itemsCount: number;
    totalEstimatedCost: number;
    recommendations: ReorderRecommendation[];
  }> {
    const medicines = await this.prisma.medicine.findMany({
      include: {
        supplier: true,
      },
      orderBy: { quantity: 'asc' },
    });

    // Filter items where quantity <= reorderThreshold
    const lowStockItems = medicines.filter(
      (m) => m.quantity <= m.reorderThreshold,
    );

    const recommendations: ReorderRecommendation[] = lowStockItems.map((m) => {
      let priority: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
      let reason = `Current quantity (${m.quantity}) has fallen to or below the safety threshold (${m.reorderThreshold}).`;

      if (m.quantity === 0) {
        priority = 'CRITICAL';
        reason = `Out of stock! Medicine is currently unavailable for dispensing. Immediate restock required.`;
      } else if (m.quantity <= Math.ceil(m.reorderThreshold / 2)) {
        priority = 'HIGH';
        reason = `Critically low! Stock (${m.quantity}) is less than 50% of the required buffer (${m.reorderThreshold}).`;
      }

      // Suggested replenishment: replenish up to 2.5x threshold, minimum order size 10 units
      const targetBuffer = Math.max(m.reorderThreshold * 2, 20);
      const suggestedReorderQuantity = Math.max(targetBuffer - m.quantity, 10);
      const unitPriceNum = Number(m.unitPrice);
      const estimatedCost = Number(
        (suggestedReorderQuantity * unitPriceNum).toFixed(2),
      );

      return {
        medicineId: m.id,
        name: m.name,
        sku: m.sku,
        currentStock: m.quantity,
        reorderThreshold: m.reorderThreshold,
        priority,
        reason,
        suggestedReorderQuantity,
        unitPrice: unitPriceNum,
        estimatedCost,
        supplier: m.supplier
          ? {
              id: m.supplier.id,
              name: m.supplier.name,
              email: m.supplier.email,
              phone: m.supplier.phone,
            }
          : null,
      };
    });

    const totalEstimatedCost = Number(
      recommendations
        .reduce((sum, item) => sum + item.estimatedCost, 0)
        .toFixed(2),
    );

    return {
      generatedAt: new Date().toISOString(),
      ruleExplanation:
        'Threshold-based heuristic: Flags items whose stock is at or below the safety threshold. Target replenishment targets 2x threshold buffer to balance holding costs and stockout risk.',
      itemsCount: recommendations.length,
      totalEstimatedCost,
      recommendations,
    };
  }
}

