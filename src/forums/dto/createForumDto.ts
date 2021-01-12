import {IsNotEmpty} from "class-validator";

export class CreateForumDto {
    @IsNotEmpty()
    fid: number;

    @IsNotEmpty()
    title: string;
}