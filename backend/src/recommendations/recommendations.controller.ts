import { Controller, Get } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('reorder')
  getReorder() {
    return this.recommendationsService.getReorderRecommendations();
  }
}

