import { Injectable, Inject } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { HttpService } from '@nestjs/axios';
import { v4 as uuid } from 'uuid';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SagaManagerService {
  constructor(
    @Inject('DynamoDBClient') private dynamoClient: DynamoDBClient,
    private httpService: HttpService,
  ) {}

  async startSaga(steps: string[]): Promise<string> {
    const transactionId = uuid();
    const item = {
      transactionId: { S: transactionId },
      status: { S: 'pending' },
      steps: {
        L: steps.map((step) => ({
          M: { service: { S: step }, status: { S: 'pending' } },
        })),
      },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
    };

    await this.dynamoClient.send(
      new PutItemCommand({
        TableName: 'SagaTable',
        Item: item,
      }),
    );

    return transactionId;
  }

  async executeStep(
    transactionId: string,
    service: string,
    url: string,
    payload: any,
  ): Promise<void> {
    try {
      const response = await lastValueFrom(this.httpService.post(url, payload));
      await this.updateStepStatus(transactionId, service, 'completed');
    } catch (error) {
      await this.updateStepStatus(transactionId, service, 'failed');
      throw new Error(`Step failed for service: ${service}`);
    }
  }

  private async updateStepStatus(
    transactionId: string,
    service: string,
    status: string,
  ): Promise<void> {
    const command = new UpdateItemCommand({
      TableName: 'SagaTable',
      Key: { transactionId: { S: transactionId } },
      UpdateExpression:
        'SET steps = list_append(steps, :step), updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':step': {
          L: [{ M: { service: { S: service }, status: { S: status } } }],
        },
        ':updatedAt': { S: new Date().toISOString() },
      },
    });
    await this.dynamoClient.send(command);
  }

  async rollback(transactionId: string): Promise<void> {
    const command = new GetItemCommand({
      TableName: 'SagaTable',
      Key: { transactionId: { S: transactionId } },
    });
    const result = await this.dynamoClient.send(command);
    const steps = result.Item?.steps.L || [];

    for (const step of steps.reverse()) {
      const service = step.M.service.S;
      const status = step.M.status.S;
      if (status === 'completed') {
        // Call the rollback endpoint of the service
        await lastValueFrom(this.httpService.post(`${service}/rollback`, {}));
      }
    }

    await this.updateTransactionStatus(transactionId, 'failed');
  }

  private async updateTransactionStatus(
    transactionId: string,
    status: string,
  ): Promise<void> {
    const command = new UpdateItemCommand({
      TableName: 'SagaTable',
      Key: { transactionId: { S: transactionId } },
      UpdateExpression: 'SET status = :status, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':status': { S: status },
        ':updatedAt': { S: new Date().toISOString() },
      },
    });
    await this.dynamoClient.send(command);
  }
}
