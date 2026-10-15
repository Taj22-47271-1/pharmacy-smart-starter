import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get('stats')
  getStats() {
    return this.medicinesService.getDashboardStats();
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.medicinesService.findAll(search, lowStock === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    return this.medicinesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }
}

