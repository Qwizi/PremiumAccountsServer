import { Module } from '@nestjs/common';
import {UsersModule} from "../users/users.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {LocalStrategy} from "./local.strategy";
import {JwtStrategy} from "./jwt.strategy";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot(),
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '3600s'}
        })
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {}
