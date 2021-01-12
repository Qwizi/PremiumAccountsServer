import { Module } from '@nestjs/common';
import {databaseProviders} from "./database.providers";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: 3306,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE,
            entities: [],
            synchronize: true
        })
    ],
    //providers: [...databaseProviders],
    //exports: [...databaseProviders]
})
export class DatabaseModule {}
