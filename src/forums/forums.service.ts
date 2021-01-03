import {Inject, Injectable} from '@nestjs/common';
import {FORUMS_REPOSITORY} from "./forums.constants";
import {Forum} from "./entities/forum.entitiy";
import {CreateForumDto} from "./dto/createForumDto";

@Injectable()
export class ForumsService {
    constructor(@Inject(FORUMS_REPOSITORY) private forumsRepository: typeof Forum) {}

    async create(createForumDto: CreateForumDto): Promise<Forum> {
        return this.forumsRepository.create<Forum>(createForumDto);
    }

    async findAll(options?: object): Promise<Forum[]> {
        return options !== null ? this.forumsRepository.findAll(options): this.forumsRepository.findAll();
    }

    async findOne(options: object): Promise<Forum> {
        return this.forumsRepository.findOne(options);
    }

    async update(forum: Forum, createForumDto: CreateForumDto): Promise<Forum> {
        await forum.update(createForumDto);
        return forum;
    }

    async remove(forum: Forum) {
        return forum.destroy();
    }
}
