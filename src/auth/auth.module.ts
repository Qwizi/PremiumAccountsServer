import { Module } from '@nestjs/common';
import {UsersModule} from "../users/users.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '3600s'}
        })
    ],
    providers: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {}
