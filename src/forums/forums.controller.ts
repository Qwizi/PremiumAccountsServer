import {Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {ForumsService} from "./forums.service";
import {CreateForumDto} from "./dto/createForumDto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('forums')
export class ForumsController {
    constructor(private readonly forumsService: ForumsService) {}

    @Get()
    async findAll() {
        return this.forumsService.findAll()
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.forumsService.findOne({where: {id: id}})
    }
}
