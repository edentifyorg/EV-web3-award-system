import { Test } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesStorage } from './files.storage';
import { FilesRepository } from './files.repository';
import { FilesHelper } from './files.helper';

describe('FilesService', () => {
  let testFileService: FilesService;
  const mockRepository = {
    createFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileById: jest.fn(),
    deleteFileById: jest.fn(),
  };
  const mockFilesStorage = {
    storeFile: jest.fn(),
    retrieveFile: jest.fn(),
    deleteFile: jest.fn(),
  };
  const mockFilesHelper = {
    fileWithIdExists: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: FilesRepository,
          useValue: mockRepository,
        },
        {
          provide: FilesStorage,
          useValue: mockFilesStorage,
        },
        {
          provide: FilesHelper,
          useValue: mockFilesHelper,
        },
      ],
    }).compile();

    testFileService = moduleRef.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(testFileService).toBeDefined();
  });

  describe('createFile', () => {
    it('should save a file', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 100,
        buffer: Buffer.from([]),
      };
      mockRepository.createFile.mockResolvedValueOnce({
        id: 'uuid',
        ...mockFile,
        private: false,
      });

      const result = await testFileService.saveFile(mockFile);

      expect(result).toEqual({ id: 'uuid', ...mockFile, private: false });
      expect(mockRepository.createFile).toHaveBeenCalledWith(
        {
          name: mockFile.originalname,
          mimeType: mockFile.mimetype,
          size: mockFile.size,
          private: false,
        },
        undefined
      );
      expect(mockFilesStorage.storeFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'uuid'
      );
    });
  });

  describe('getFile', () => {
    it('should retrieve a file when it exists', async () => {
      const mockFileMeta = {
        id: 'uuid',
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 100,
        private: false,
      };
      const mockFileBuffer = Buffer.from([]);
      mockRepository.getFileById.mockResolvedValueOnce(mockFileMeta);
      mockFilesStorage.retrieveFile.mockResolvedValueOnce(mockFileBuffer);

      const result = await testFileService.getFile(mockFileMeta.id);

      expect(result.fileMeta).toEqual(mockFileMeta);
      expect(result.fileContent).toEqual(mockFileBuffer);
      expect(mockRepository.getFileById).toHaveBeenCalledWith(mockFileMeta.id);
      expect(mockFilesStorage.retrieveFile).toHaveBeenCalledWith(
        mockFileMeta.id
      );
    });

    it('should throw an error when file does not exist', async () => {
      mockRepository.getFileById.mockResolvedValueOnce(null);

      await expect(testFileService.getFile('non-existing-id')).rejects.toThrow(
        new HttpException(
          `File with id: non-existing-id doesn't exist.`,
          HttpStatus.NOT_FOUND
        )
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file when it exists', async () => {
      const fileId = 'uuid';
      mockRepository.getFileById.mockResolvedValueOnce({ id: fileId });
      mockFilesStorage.deleteFile.mockResolvedValueOnce(undefined);
      mockRepository.deleteFileById.mockResolvedValueOnce(undefined);

      await testFileService.deleteFile(fileId);

      expect(mockRepository.getFileById).toHaveBeenCalledWith(fileId);
      expect(mockFilesStorage.deleteFile).toHaveBeenCalledWith(fileId);
      expect(mockRepository.deleteFileById).toHaveBeenCalledWith(fileId);
    });

    it('should throw an error when the file does not exist', async () => {
      const fileId = 'uuid';
      mockRepository.getFileById.mockResolvedValueOnce(null);

      await expect(testFileService.deleteFile(fileId)).rejects.toThrow(
        new HttpException(
          `File with id: ${fileId} doesn't exist.`,
          HttpStatus.NOT_FOUND
        )
      );

      expect(mockRepository.getFileById).toHaveBeenCalledWith(fileId);
      expect(mockFilesStorage.deleteFile).not.toHaveBeenCalled();
      expect(mockRepository.deleteFileById).not.toHaveBeenCalled();
    });
  });
});
