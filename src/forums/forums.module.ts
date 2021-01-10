import {HttpModule, Module} from '@nestjs/common';
import {ForumsService} from './forums.service';
import {ForumsController} from './forums.controller';
import { forumsProviders} from "./forums.providers";
import {AuthModule} from "../auth/auth.module";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot(),
        AuthModule,
        HttpModule
    ],
    providers: [ForumsService, ...forumsProviders],
    controllers: [ForumsController],
    exports: [ForumsService]
})
export class ForumsModule {
}
