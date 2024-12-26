// saga-manager.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SagaManagerService } from './saga-manager.service';

@Module({
  imports: [HttpModule],
  providers: [
    SagaManagerService,
    {
      provide: 'DynamoDBClient',
      useFactory: () => new DynamoDBClient({ region: 'us-east-1' }),
    },
  ],
  exports: [SagaManagerService],
})
export class SagaManagerModule {
  
}