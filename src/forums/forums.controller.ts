import {Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards} from '@nestjs/common';
import {ForumsService} from "./forums.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Thread} from "../threads/entities/thread.entity";

@UseGuards(JwtAuthGuard)
@Controller('forums')
export class ForumsController {
    constructor(private readonly forumsService: ForumsService) {}

    @Get()
    async findAll() {
        return this.forumsService.findAll({include: [Thread]})
    }

    @Post("sync")
    async syncForums() {
        return this.forumsService.sync()
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        const forum = await this.forumsService.findOne({where: {id: id}});
        if (!forum) throw new HttpException('Forum not found', HttpStatus.NOT_FOUND)
        return forum
    }
}
