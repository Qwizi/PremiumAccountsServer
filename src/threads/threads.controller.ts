import {
    Body,
    Controller, Delete,
    Get, HttpCode,
    NotFoundException,
    Param,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import {ThreadsService} from "./threads.service";
import {SearchThreadDto} from "./dto/searchThreadDto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
//import {ThreadNotWork} from "./entities/threadNotWork";

@UseGuards(JwtAuthGuard)
@Controller('threads')
export class ThreadsController {
    constructor(private threadsService: ThreadsService) {
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
        const thread = await this.threadsService.findOne({where: {id: id}});
        if (!thread) throw new NotFoundException();

        await this.threadsService.setThreadNotWork(thread, req.user);
        return {message: 'Successfully set thread not work'}
    }

    @Delete(":id/not_work")
    async removeNotWork(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}});
        if (!thread) throw new NotFoundException();

        await this.threadsService.removeThreadNotWork(thread, req.user);
        return {message: 'Successfully remove thread not work'}
    }

    @Post(":id/favorite")
    async addToFavorite(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}});
        if (!thread) throw new NotFoundException();

        await this.threadsService.addThreadToFavorite(thread, req.user);
        return {message: 'Successfully add thread to favorites'}
    }

    @Delete(':id/favorite')
    async removeFromFavorite(@Param('id') id: number, @Request() req) {
        const thread = await this.threadsService.findOne({where: {id: id}});
        if (!thread) throw new NotFoundException();

        await this.threadsService.removeThreadFromFavorite(thread, req.user);
        return {message: 'Successfully removed thread from favorites'}
    }

    @Post('sync')
    async sync() {
        return this.threadsService.addThreadsSyncToQueue();
    }

    @Post('search')
    @HttpCode(200)
    async search(@Body() searchThreadDto: SearchThreadDto) {
        /*const threads = await this.threadsService.findAll({
            where: {
                title: {
                    [Op.substring]: searchThreadDto.name
                },
                content_html: {
                    [Op.substring]: ':'
                }
            },
            order: [
                ['updatedAt', 'DESC']
            ]
        })
        if (!threads) throw new HttpException('Thread not found', HttpStatus.NOT_FOUND)
        return threads;*/
    }
}
