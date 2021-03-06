import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.enitiy";
import {Forum} from "../forums/entities/forum.entitiy";
import {Thread} from "../threads/entities/thread.entity";

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
            entities: [
                User,
                Forum,
                Thread
            ],
            synchronize: true
        })
    ],
})
export class DatabaseModule {}
