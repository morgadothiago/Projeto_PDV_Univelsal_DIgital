import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { DbModule } from '../../database/db.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [DbModule, EventsModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
