import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the API as healthy', () => {
    const controller = new HealthController();
    expect(controller.check()).toEqual({ status: 'ok', service: 'pharmacy-smart-api' });
  });
});
