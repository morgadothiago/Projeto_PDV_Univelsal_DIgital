import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { DbModule } from '../../database/db.module';

@Module({
  imports: [DbModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
