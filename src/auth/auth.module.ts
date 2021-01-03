import { Module } from '@nestjs/common';
import {UsersModule} from "../users/users.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '3600s'}
        })
    ]
})
export class AuthModule {}
