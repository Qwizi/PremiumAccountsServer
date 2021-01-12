import {CreateUserDto} from "./createUserDto";
import {IsBoolean, IsNotEmpty, IsOptional} from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    username: string;

    @IsOptional()
    password: string;

    @IsOptional()
    is_active: boolean

    @IsOptional()
    is_admin: boolean
}