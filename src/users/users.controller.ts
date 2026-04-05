import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionEnum } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SetPermissions } from 'src/auth/decorators/permissions.decorator';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@SetPermissions([PermissionEnum.PERM_USER_ALL, PermissionEnum.PERM_ALL])
@UseGuards(RolesGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SetPermissions([PermissionEnum.PERM_USER_CREATE])
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @SetPermissions([PermissionEnum.PERM_USER_READ])
  @Post('filter')
  filterAll(@Body() filter: FilterDto) {
    return this.usersService.filterAll(filter);
  }

  @SetPermissions([PermissionEnum.PERM_USER_READ])
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(Number(id));
  }

  @SetPermissions([PermissionEnum.PERM_USER_UPDATE])
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @SetPermissions([PermissionEnum.PERM_USER_DELETE])
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(Number(id));
  }
}
