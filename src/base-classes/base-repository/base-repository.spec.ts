import { PrismaService } from 'src/prisma/prisma.service';
import { BaseRepository } from './base-repository';

describe('BaseRepository', () => {
  let baseRepository: BaseRepository;
  let mockPrismaService: Partial<PrismaService>;

  beforeEach(() => {
    mockPrismaService = {
      $transaction: jest.fn().mockImplementation(callback => callback()),
    };

    baseRepository = new BaseRepository(mockPrismaService as PrismaService);
  });

  it('should call the $transaction method with the provided callback', async () => {
    const callback = jest.fn();

    await baseRepository.executeTransaction(callback);

    expect(mockPrismaService.$transaction).toHaveBeenCalledWith(callback);
    expect(callback).toHaveBeenCalled();
  });
});
