import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FilesRepository } from './files.repository';

const mockPrismaService = {
  file: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const fileDto: CreateFileDto = {
  name: 'name',
  mimeType: 'mimeType',
  size: 123,
  private: false,
};

const filesDto: CreateFileDto[] = [
  {
    name: 'name1',
    mimeType: 'mimeType1',
    size: 123,
    private: false,
  },
  {
    name: 'name2',
    mimeType: 'mimeType2',
    size: 234,
    private: false,
  },
];

describe('FilesRepository', () => {
  let testFilesRepository: FilesRepository;
  let prismaService: jest.Mocked<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    testFilesRepository = module.get<FilesRepository>(FilesRepository);
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as unknown as jest.Mocked<typeof mockPrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(testFilesRepository).toBeDefined();
  });

  describe('createFile', () => {
    it('should create a file', async () => {
      prismaService.file.create.mockResolvedValue(fileDto as CreateFileDto);

      const result = await testFilesRepository.createFile(fileDto);

      expect(result).toEqual(fileDto);
      expect(prismaService.file.create).toHaveBeenCalledWith({
        data: fileDto,
      });
    });
  });

  describe('createManyFiles', () => {
    it('should create many files', async () => {
      prismaService.file.createMany.mockResolvedValue(
        filesDto as CreateFileDto[]
      );

      const result = await testFilesRepository.createManyFiles(filesDto);

      expect(result).toEqual(filesDto);
      expect(prismaService.file.createMany).toHaveBeenCalledWith({
        data: filesDto,
      });
    });
  });

  describe('getFile', () => {
    it('should get a file', async () => {
      const where = { id: '1' };
      prismaService.file.findUnique.mockResolvedValue(fileDto as CreateFileDto);

      const result = await testFilesRepository.getFile({ where });

      expect(result).toEqual(fileDto);
      expect(prismaService.file.findUnique).toHaveBeenCalledWith({ where });
    });
  });

  describe('getFiles', () => {
    it('should get many files', async () => {
      prismaService.file.findMany.mockResolvedValue(fileDto as CreateFileDto);

      const result = await testFilesRepository.getFiles({});

      expect(result).toEqual(fileDto);
      expect(prismaService.file.findMany).toHaveBeenCalledWith({});
    });
  });

  describe('updateFile', () => {
    it('should update a file', async () => {
      const where = { id: '1' };
      const updateFileDto = { name: 'updatedName' };
      prismaService.file.update.mockResolvedValue({
        ...fileDto,
        ...updateFileDto,
      } as CreateFileDto);

      const result = await testFilesRepository.updateFile({
        where,
        data: updateFileDto,
      });

      expect(result).toEqual({ ...fileDto, ...updateFileDto });
      expect(prismaService.file.update).toHaveBeenCalledWith({
        where,
        data: updateFileDto,
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      const where = { id: '1' };
      prismaService.file.delete.mockResolvedValue(fileDto as CreateFileDto);

      const result = await testFilesRepository.deleteFile({ where });

      expect(result).toEqual(fileDto);
      expect(prismaService.file.delete).toHaveBeenCalledWith({ where });
    });
  });

  describe('getFileById', () => {
    it('should retrieve an file by its id', async () => {
      const fileId = '123';
      const expectedFile = { id: fileId, name: 'Example' };
      prismaService.file.findUnique.mockResolvedValue(expectedFile);

      const result = await testFilesRepository.getFileById(fileId);

      expect(result).toEqual(expectedFile);
      expect(prismaService.file.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
      });
    });

    it('should return null if the file does not exist', async () => {
      const fileId = '999';
      prismaService.file.findUnique.mockResolvedValue(null);

      const result = await testFilesRepository.getFileById(fileId);

      expect(result).toBeNull();
      expect(prismaService.file.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
      });
    });
  });

  describe('updateFileById', () => {
    it('should update an file by its id', async () => {
      const fileId = '123';
      const updateData = { name: 'Updated' };
      const updatedFile = { id: fileId, ...updateData };
      prismaService.file.update.mockResolvedValue(updatedFile);

      const result = await testFilesRepository.updateFileById(
        fileId,
        updateData
      );

      expect(result).toEqual(updatedFile);
      expect(prismaService.file.update).toHaveBeenCalledWith({
        where: { id: fileId },
        data: updateData,
      });
    });
  });

  describe('deleteFileById', () => {
    it('should delete an file by its id', async () => {
      const fileId = '123';
      const deleteResponse = { count: 1 };
      prismaService.file.delete.mockResolvedValue(deleteResponse);

      const result = await testFilesRepository.deleteFileById(fileId);

      expect(result).toEqual(deleteResponse);
      expect(prismaService.file.delete).toHaveBeenCalledWith({
        where: { id: fileId },
      });
    });
  });
});
