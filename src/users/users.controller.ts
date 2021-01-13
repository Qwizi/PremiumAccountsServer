import {Body, Controller, Get, Post, Req, Request, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UsersService} from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    async me(@Request() req) {
        return req.user;
    }

    @Get('me/favorites')
    async favorites(@Request() req) {
        return this.usersService.getFavoritesThreads(req.user);
    }

}
