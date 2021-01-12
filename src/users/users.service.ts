import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {MESSAGES} from "./users.constants";
import {User} from './entities/user.enitiy';
import * as bcrypt from 'bcrypt';
import {CreateUserDto} from "./dto/createUserDto";
import {UpdateUserDto} from "./dto/updateUserDto";
import {RegisterUserDto} from "./dto/registerUserDto";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async create(createUserDto: CreateUserDto) {
        const user = await this.usersRepository.create(createUserDto);
        await this.usersRepository.save(user);
        return user;
    }

    async findOne(options: object): Promise<User> {
        return this.usersRepository.findOne(options)
    }

    async findAll(options: object): Promise<User[]> {
        return this.usersRepository.find(options)
    }

    async update(user: User, updateUserDto: UpdateUserDto) {
        if (updateUserDto.username) user.username = updateUserDto.username
        if (updateUserDto.password) user.password = updateUserDto.password
        if (updateUserDto.is_active) user.is_active = updateUserDto.is_active
        if (updateUserDto.is_admin) user.is_admin = updateUserDto.is_admin
        return this.usersRepository.save(user);
    }

    async delete(user: User) {
        return this.usersRepository.delete(user.id);
    }

    async activate(user: User) {
        user.is_active = true;
        return this.usersRepository.save(user);
    }

    async deactivate(user: User) {
        user.is_active = false;
        return this.usersRepository.save(user);
    }

    async register(registerUserDto: RegisterUserDto): Promise<User> {
        const {username} = registerUserDto;
        const user = await this.usersRepository.findOne({where: {username: username}})
        if (user) {
            throw new HttpException(
                MESSAGES.USERS_EXISTS,
                HttpStatus.BAD_REQUEST
            )
        }
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10)
        const newUser =  await this.usersRepository.create({
            username: username,
            password: hashedPassword
        })
        return this.usersRepository.save(newUser);
    }

    async getFavoritesThreads(user: User) {
        //return user.favorite_threads
    }
}
