import {IsNotEmpty} from "class-validator";

export class CreateThreadDto {
    @IsNotEmpty()
    tid: string;

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    content_html: string;
}