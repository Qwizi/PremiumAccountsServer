import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DatabaseModule} from './database/database.module';
import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {ConfigModule} from "@nestjs/config";
import {ForumsModule} from './forums/forums.module';
import { ThreadsModule } from './threads/threads.module';
import {BullModule} from "@nestjs/bull";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD
            }
        }),
        DatabaseModule,
        UsersModule,
        AuthModule,
        ForumsModule,
        ThreadsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
