import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {MESSAGES, USERS_REPOSITORY} from "./users.constants";
import {User} from './entities/user.enitiy';
import * as bcrypt from 'bcrypt';
import {CreateUserDto} from "./dto/createUserDto";
import {UpdateUserDto} from "./dto/updateUserDto";
import {RegisterUserDto} from "./dto/registerUserDto";

@Injectable()
export class UsersService {
    constructor(@Inject(USERS_REPOSITORY) private usersRepository: typeof User) {}

    async create(createUserDto: CreateUserDto) {
        return this.usersRepository.create<User>(createUserDto);
    }

    async findOne(options: object): Promise<User> {
        return this.usersRepository.findOne(options)
    }

    async findAll(options: object): Promise<User[]> {
        return this.usersRepository.findAll(options)
    }

    async update(user: User, updateUserDto: UpdateUserDto) {
        await user.update(updateUserDto);
    }

    async destroy(user: User) {
        user.destroy();
    }

    async activate(user: User) {
        await user.update({is_active: true})
    }

    async deactivate(user: User) {
        await user.update({is_active: false})
    }

    async register(registerUserDto: RegisterUserDto): Promise<User> {
        const {username} = registerUserDto;
        const user = await this.findOne({where: {username: username}})
        if (user) {
            throw new HttpException(
                MESSAGES.USERS_EXISTS,
                HttpStatus.BAD_REQUEST
            )
        }
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10)
        return this.usersRepository.create<User>({
            username: username,
            password: hashedPassword
        })
    }

    async getFavoritesThreads(user: User) {
        return user.$get('favorite_threads')
    }
}
