import { Test } from '@nestjs/testing';
import { FileController } from './files.controller';
import { FilesService } from './files.service';

describe('FileController', () => {
  let testFileController: FileController;
  const mockService = {
    saveFile: jest.fn(),
    getFile: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FilesService,
          useValue: mockService,
        },
      ],
    }).compile();

    testFileController = moduleRef.get<FileController>(FileController);
  });

  it('should be defined', () => {
    expect(testFileController).toBeDefined();
  });

  describe('post', () => {
    it('should save a file', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 100,
        buffer: Buffer.from([]),
      };
      mockService.saveFile.mockResolvedValueOnce({ id: 'uuid', ...mockFile });

      const result = await testFileController.saveFile(mockFile);

      expect(result).toEqual({ id: 'uuid', ...mockFile });
      expect(mockService.saveFile).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('get', () => {
    it('should retrieve a file', async () => {
      const mockFileMeta = {
        id: 'uuid',
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 100,
        private: false,
      };
      const mockFileBuffer = Buffer.from([]);

      mockService.getFile.mockResolvedValueOnce({
        fileMeta: mockFileMeta,
        fileContent: mockFileBuffer,
      });

      const mockResponse = {
        header: jest.fn(),
        send: jest.fn(),
      };

      await testFileController.getFile('uuid', mockResponse as any);

      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        mockFileMeta.mimeType
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockFileBuffer);
      expect(mockService.getFile).toHaveBeenCalledWith('uuid');
    });
  });
});
