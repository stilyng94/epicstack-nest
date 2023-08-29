import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from 'nestjs-prisma';

@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
    private prismaHealthIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () =>
        this.prismaHealthIndicator.pingCheck('database_health', this.prisma),
      // the process should not use more than 300MB memory
      () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
      // The process should not have more than 300MB RSS memory allocated
      () =>
        this.memoryHealthIndicator.checkRSS('memory_rss', 300 * 1024 * 1024),
      // the used disk storage should not exceed the 50% of the available space
      () =>
        this.diskHealthIndicator.checkStorage('disk_health', {
          thresholdPercent: 0.5,
          path: '/',
        }),
    ]);
  }
}
