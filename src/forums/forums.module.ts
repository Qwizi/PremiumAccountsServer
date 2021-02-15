import {Module} from '@nestjs/common';
import {ForumsService} from './forums.service';
import {ForumsController} from './forums.controller';
import {AuthModule} from "../auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Forum} from "./entities/forum.entitiy";
import {BullModule} from "@nestjs/bull";
import {ForumsProcessor} from "./forums.processor";
import {PuppeteerModule} from "nest-puppeteer";

@Module({
    imports: [
        ConfigModule.forRoot(),
        AuthModule,
        PuppeteerModule.forRoot({
            headless: false
        }),
        BullModule.registerQueue({
            name: 'forums'
        }),
        TypeOrmModule.forFeature([Forum])
    ],
    providers: [ForumsService, ForumsProcessor],
    controllers: [ForumsController],
    exports: [ForumsService]
})
export class ForumsModule {
}
