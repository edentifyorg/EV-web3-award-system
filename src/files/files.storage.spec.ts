import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FilesStorage } from './files.storage';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
  },
  constants: {
    F_OK: 'F_OK',
  },
}));

const mockConfigService = {
  getOrThrow: jest.fn(),
};

describe('FilesStorage', () => {
  let fileStorage: FilesStorage;
  const mockBuffer = Buffer.from('test content');

  beforeEach(async () => {
    mockConfigService.getOrThrow.mockReturnValue('defaultPath');

    const moduleRef = await Test.createTestingModule({
      providers: [
        FilesStorage,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    fileStorage = moduleRef.get<FilesStorage>(FilesStorage);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('ensureDirectoryExists', () => {
    it('should not create a directory if it already exists', async () => {
      (fs.promises.access as jest.Mock).mockResolvedValue(undefined);
      await fileStorage.ensureDirectoryExists();
      expect(fs.promises.mkdir).not.toHaveBeenCalled();
    });

    it('should create a directory if it does not exist', async () => {
      (fs.promises.access as jest.Mock).mockRejectedValue(
        new Error('No directory')
      );
      await fileStorage.ensureDirectoryExists();
      expect(fs.promises.mkdir).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
    });
  });

  describe('storeFile', () => {
    it('should ensure directory exists and write the file', async () => {
      const fileName = 'test.txt';
      const mockFilePath = path.join('defaultPath', fileName);

      mockConfigService.getOrThrow.mockReturnValue('defaultPath');
      await fileStorage.storeFile(mockBuffer, fileName);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        mockFilePath,
        mockBuffer
      );
    });
  });

  describe('retrieveFile', () => {
    it('should read the file from the correct path', async () => {
      const fileName = 'test.txt';
      const mockFilePath = path.join('defaultPath', fileName);
      const mockReturnedBuffer = Buffer.from('returned content');

      mockConfigService.getOrThrow.mockReturnValue('defaultPath');
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockReturnedBuffer);

      const result = await fileStorage.retrieveFile(fileName);

      expect(result).toEqual(mockReturnedBuffer);
      expect(fs.promises.readFile).toHaveBeenCalledWith(mockFilePath);
    });
  });

  describe('deleteFile', () => {
    const fileName = 'test.txt';
    const mockFilePath = path.join('defaultPath', fileName);

    it('should delete the file', async () => {
      mockConfigService.getOrThrow.mockReturnValue('defaultPath');
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      await fileStorage.deleteFile(fileName);

      expect(fs.promises.unlink).toHaveBeenCalledWith(mockFilePath);
    });

    it('should throw an HttpException if the file cannot be deleted', async () => {
      const errorMessage = 'Could not delete file';
      mockConfigService.getOrThrow.mockReturnValue('defaultPath');
      (fs.promises.unlink as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(fileStorage.deleteFile(fileName)).rejects.toThrow(
        HttpException
      );

      expect(fs.promises.unlink).toHaveBeenCalledWith(mockFilePath);
    });
  });
});
