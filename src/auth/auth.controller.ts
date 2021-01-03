import {Body, Controller, Post, Request} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterUserDto} from "../users/dto/registerUserDto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user.dataValue);
    }
}
