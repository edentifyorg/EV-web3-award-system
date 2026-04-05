import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to Prisma', async () => {
      const connectSpy = jest
        .spyOn(PrismaClient.prototype, '$connect')
        .mockImplementation();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from Prisma', async () => {
      const disconnectSpy = jest
        .spyOn(PrismaClient.prototype, '$disconnect')
        .mockImplementation();

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
