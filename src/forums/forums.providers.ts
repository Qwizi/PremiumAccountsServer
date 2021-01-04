import {Forum} from './entities/forum.entitiy';
import {FORUMS_AXIOS_PROVIDER, FORUMS_REPOSITORY} from "./forums.constants";
import {forumAxios} from "./forums.axios";

export const forumsProviders = [
    {
        provide: FORUMS_REPOSITORY,
        useValue: Forum
    }
];

export const axiosProvider = [
    {
        provide: FORUMS_AXIOS_PROVIDER,
        useValue: forumAxios
    }
]