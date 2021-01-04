import {Module} from '@nestjs/common';
import {ForumsService} from './forums.service';
import {ForumsController} from './forums.controller';
import {axiosProvider, forumsProviders} from "./forums.providers";
import {AuthModule} from "../auth/auth.module";
import {PuppeteerModule} from "nest-puppeteer";

@Module({
    imports: [
        AuthModule,
        PuppeteerModule.forRoot({headless: true})
    ],
    providers: [ForumsService, ...forumsProviders, ...axiosProvider],
    controllers: [ForumsController]
})
export class ForumsModule {
}
