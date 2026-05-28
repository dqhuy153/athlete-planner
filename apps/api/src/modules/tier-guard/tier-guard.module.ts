import { Module } from '@nestjs/common';
import { TierGuardService } from './tier-guard.service';

@Module({
  providers: [TierGuardService],
  exports: [TierGuardService],
})
export class TierGuardModule {}
