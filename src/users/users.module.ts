import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InMemoryUsersService } from './in-memory-users.service';
import { BetsModule } from '../bets/bets.module';

@Module({
  imports: [BetsModule],
  controllers: [UsersController],
  providers: [
    {
      provide: UsersService,
      useClass: InMemoryUsersService,
    },
    InMemoryUsersService,
  ],
  exports: [UsersService, InMemoryUsersService],
})
export class UsersModule {}
