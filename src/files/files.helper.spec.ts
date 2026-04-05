import { FilesRepository } from './files.repository';
import { FilesHelper } from './files.helper';

const fileDto = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'name',
  mimeType: 'mimeType',
  size: 123,
  private: false,
  orderItemId: 1,
  incomingInvoiceId: 1,
};

describe('FilesHelper', () => {
  let testFilesHelper: FilesHelper;
  let mockRepository: jest.Mocked<FilesRepository>;

  beforeEach(() => {
    mockRepository = {
      getFileById: jest.fn(),
    } as any;

    testFilesHelper = new FilesHelper(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fileWithIdExists', () => {
    it('should return true if file with id exists', async () => {
      const fileId = '1';
      mockRepository.getFileById.mockResolvedValue(fileDto);

      const result = await testFilesHelper.fileWithIdExists(fileId);

      expect(result).toBe(true);
      expect(mockRepository.getFileById).toHaveBeenCalledWith(fileId);
    });

    it('should return false if file with id does not exist', async () => {
      const fileId = '1';
      mockRepository.getFileById.mockResolvedValue(null);

      const result = await testFilesHelper.fileWithIdExists(fileId);

      expect(result).toBe(false);
      expect(mockRepository.getFileById).toHaveBeenCalledWith(fileId);
    });
  });
});
