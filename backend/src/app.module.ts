import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MedicinesModule } from './medicines/medicines.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MedicinesModule,
    SuppliersModule,
    StockMovementsModule,
    RecommendationsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
