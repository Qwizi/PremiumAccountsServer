import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post, Query,
    Request,
    UseGuards
} from '@nestjs/common';
import {ThreadsService} from "./threads.service";
import {SearchThreadDto} from "./dto/searchThreadDto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Like} from "typeorm";
import {User} from "../users/entities/user.enitiy";

@UseGuards(JwtAuthGuard)
@Controller('threads')
export class ThreadsController {
    constructor(
        private threadsService: ThreadsService) {}

    @Get('search')
    async search(
        @Query('name') name: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 9
    ) {
        const searchThreadDto = new SearchThreadDto();
        searchThreadDto.name = name;
        return this.threadsService.search(searchThreadDto, {page, limit, route: `http://localhost:${process.env.PORT}/threads/search`});
    }

    @Get(":id")
    async findOne(@Param('id') id: number) {
        //const thread = await this.threadsService.findOne({where: {id: id}, include: [ThreadNotWork]});
        const thread = await this.threadsService.findOne({where: {id: id}});
        if (!thread) throw new NotFoundException();
        return thread;
    }

    @Post(":id/not_work")
    async setNotWork(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}, relations: ["not_work_users"]});
        if (!thread) throw new NotFoundException();
        return this.threadsService.setThreadNotWork(thread, req.user);
    }

    @Delete(":id/not_work")
    async removeNotWork(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}, relations: ["not_work_users"]});
        if (!thread) throw new NotFoundException();

        return this.threadsService.removeThreadNotWork(thread, req.user);
    }

    @Post(":id/favorite")
    async addToFavorite(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}, relations: ["favorite_users"]});
        if (!thread) throw new NotFoundException();
        return this.threadsService.addThreadToFavorite(thread, req.user);
    }

    @Delete(':id/favorite')
    async removeFromFavorite(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}, relations: ["favorite_users"]});
        if (!thread) throw new NotFoundException();
        return this.threadsService.removeThreadFromFavorite(thread, req.user);
    }

    @Post('sync')
    async sync() {
        return this.threadsService.addThreadsSyncToQueue();
    }
}
