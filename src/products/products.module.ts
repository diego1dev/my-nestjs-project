import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      name: 'productsConnection',
      type: 'postgres', // Tipo de base de datos
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_PRODUCTS,
      entities: [Product],
      schema: process.env.DB_SCHEMA,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product], 'productsConnection'),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
