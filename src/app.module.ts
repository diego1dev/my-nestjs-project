import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SagaManagerModule } from './saga-manager/saga-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Permite usar las variables en toda la app sin importar ConfigModule en cada módulo
    }),
    UsersModule,
    ProductsModule,
    SagaManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
