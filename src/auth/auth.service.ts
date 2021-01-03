import { Injectable } from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {RegisterUserDto} from "../users/dto/registerUserDto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser(registerUserDto: RegisterUserDto): Promise<any> {
        const {username, password} = registerUserDto;
        const user = await this.usersService.findOne({where: {username: username, is_active: true}})
        if (user && await bcrypt.compare(password, user.password)) {
            const {password, ...result} = user;
            return result;
        }
        return null;
    }

    async register(registerUserDto: RegisterUserDto): Promise<any> {
        return this.usersService.register(registerUserDto);
    }

    async login(user: any): Promise<any> {
        const payload = {sub: user.id}
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
