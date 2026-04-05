import { Test, TestingModule } from '@nestjs/testing';
import { FilterDto } from 'src/dto/filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let testUsersController: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    filterAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    testUsersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(testUsersController).toBeDefined();
  });

  describe('create', () => {
    it('should properly execute the function and return a proper value', async () => {
      const mockCreateUserDto = 'Some value' as unknown as CreateUserDto;
      const mockReturnValue = 'mockReturnValue';
      mockUsersService.create.mockReturnValue(mockReturnValue);

      const result = testUsersController.create(mockCreateUserDto);

      expect(result).toBe(mockReturnValue);
      expect(mockUsersService.create).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('filterAll', () => {
    it('should properly execute the function and return a proper value', async () => {
      const mockFilter: FilterDto = {};
      const mockReturnValue = 'mockReturnValue';
      mockUsersService.filterAll.mockReturnValue(mockReturnValue);

      const result = await testUsersController.filterAll(mockFilter);

      expect(result).toBe(mockReturnValue);
      expect(mockUsersService.filterAll).toHaveBeenCalledWith(mockFilter);
    });
  });

  describe('findOne', () => {
    it('should properly execute the function and return a proper value', async () => {
      const mockId = 1;
      const mockReturnValue = 'mockReturnValue';
      mockUsersService.findOne.mockReturnValue(mockReturnValue);

      expect(await testUsersController.findOne(mockId)).toEqual(
        mockReturnValue
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockId);
    });
  });

  describe('update', () => {
    it('should properly execute the function and return a proper value', async () => {
      const mockId = 1;
      const mockUpdateUserDto = 'Some value' as unknown as UpdateUserDto;
      const mockReturnValue = 'mockReturnValue';

      mockUsersService.update.mockReturnValue(mockReturnValue);

      const result = await testUsersController.update(
        mockId,
        mockUpdateUserDto
      );

      expect(result).toEqual(mockReturnValue);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockId,
        mockUpdateUserDto
      );
    });
  });

  describe('remove', () => {
    it('should properly execute the function and return a proper value', async () => {
      const mockId = 1;
      const mockReturnValue = 'mockReturnValue';
      mockUsersService.remove.mockReturnValue(mockReturnValue);

      const result = testUsersController.remove(mockId);

      expect(result).toEqual(mockReturnValue);
      expect(mockUsersService.remove).toHaveBeenCalledWith(mockId);
    });
  });
});
