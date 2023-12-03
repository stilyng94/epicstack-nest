import { Test, TestingModule } from '@nestjs/testing';
import { TypesenseModule } from './typesense.module';

describe('Typesense', () => {
  let module: TestingModule;

  afterEach(async () => {
    await module.close();
  });

  it('register async use factory', async () => {
    module = await Test.createTestingModule({
      imports: [
        TypesenseModule.registerAsync({
          useFactory: () => {
            return {
              nodes: [],
              apiKey: 'test',
            };
          },
        }),
      ],
    }).compile();
    expect(module).toBeDefined();
  });

  it('register  use factory', async () => {
    module = await Test.createTestingModule({
      imports: [
        TypesenseModule.register({
          apiKey: 'test',
          nodes: [],
        }),
      ],
    }).compile();
    expect(module).toBeDefined();
  });
});
