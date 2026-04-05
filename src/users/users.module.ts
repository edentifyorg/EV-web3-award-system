import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesModule } from 'src/roles/roles.module';
import { UserFilterProcessor } from './users-filter-processor';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersHelpers } from './users.helper';

@Module({
  controllers: [UsersController],
  imports: [PrismaModule, RolesModule],
  providers: [UsersRepository, UsersService, UsersHelpers, UserFilterProcessor],
  exports: [UsersService, UsersRepository, UsersHelpers],
})
export class UsersModule {}
