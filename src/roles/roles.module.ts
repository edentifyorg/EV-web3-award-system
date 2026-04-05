import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoleFilterProcessor } from './roles-filter-processor';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { RolesHelpers } from './roles.helper';

@Module({
  controllers: [RolesController],
  imports: [PrismaModule],
  providers: [RolesRepository, RolesService, RolesHelpers, RoleFilterProcessor],
  exports: [RolesRepository, RolesService, RolesHelpers],
})
export class RolesModule {}
