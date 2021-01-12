import {HttpModule, Module} from '@nestjs/common';
import {ForumsService} from './forums.service';
import {ForumsController} from './forums.controller';
import {AuthModule} from "../auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Forum} from "./entities/forum.entitiy";

@Module({
    imports: [
        ConfigModule.forRoot(),
        AuthModule,
        HttpModule,
        TypeOrmModule.forFeature([Forum])
    ],
    providers: [ForumsService],
    controllers: [ForumsController],
    exports: [ForumsService]
})
export class ForumsModule {
}
