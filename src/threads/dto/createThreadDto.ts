import {IsNotEmpty} from "class-validator";

export class CreateThreadDto {
    @IsNotEmpty()
    tid: string;

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    created_at: string;

    @IsNotEmpty()
    updated_at: string;

    @IsNotEmpty()
    is_visible: boolean;
}