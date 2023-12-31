import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    app.flushLogs(); // force flush to hopefully remove references to logs
    await app.close(); // close the app to force cleanup
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(HttpStatus.NOT_FOUND);
  });
});
