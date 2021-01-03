import {Forum} from './entities/forum.entitiy';
import {FORUMS_REPOSITORY} from "./forums.constants";

export const forumsProviders = [
    {
        provide: FORUMS_REPOSITORY,
        useValue: Forum
    }
];