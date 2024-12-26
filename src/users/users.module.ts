import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      name: 'usersConnection', // Nombre único para esta conexión
      type: 'postgres', // Tipo de base de datos
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_USERS,
      schema: process.env.DB_SCHEMA,
      entities: [User], // Archivos de entidadespostgres
      synchronize: true, // Solo en desarrollo: crea tablas automáticamente
    }),
    TypeOrmModule.forFeature([User], 'usersConnection'),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
