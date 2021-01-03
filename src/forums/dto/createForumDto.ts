import {IsNotEmpty} from "class-validator";

export class CreateForumDto {
    @IsNotEmpty()
    tid: number;

    @IsNotEmpty()
    title: string;
}