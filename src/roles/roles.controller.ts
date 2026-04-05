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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionEnum } from '@prisma/client';
import { SetPermissions } from 'src/auth/decorators/permissions.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilterDto } from 'src/dto/filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@SetPermissions([PermissionEnum.PERM_ROLE_ALL, PermissionEnum.PERM_ALL])
@UseGuards(RolesGuard)
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @SetPermissions([PermissionEnum.PERM_ROLE_CREATE])
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @SetPermissions([PermissionEnum.PERM_ROLE_READ])
  @Get()
  @ApiQuery({
    name: 'skip',
    type: Number,
    description: 'Define the skip number',
    required: false,
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    description: 'Define the take number',
    required: false,
  })
  findAll(@Body() filterResultsDto: FilterDto) {
    return this.rolesService.findAll(filterResultsDto);
  }

  @SetPermissions([PermissionEnum.PERM_ROLE_READ])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(Number(id));
  }

  @SetPermissions([PermissionEnum.PERM_ROLE_READ])
  @Post('filter')
  filterAll(@Body() filter: FilterDto) {
    return this.rolesService.filterAll(filter);
  }

  @SetPermissions([PermissionEnum.PERM_ROLE_UPDATE])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(Number(id), updateRoleDto);
  }

  @SetPermissions([PermissionEnum.PERM_ROLE_DELETE])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(Number(id));
  }
}
