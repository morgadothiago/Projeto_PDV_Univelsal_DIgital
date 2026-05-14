import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { DbModule } from '../../database/db.module';
import { EventsModule } from '../events/events.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [DbModule, EventsModule, PaymentModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
