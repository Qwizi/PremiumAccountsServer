import {IsNotEmpty} from "class-validator";

export class SearchThreadDto {
    @IsNotEmpty()
    name: string;
}