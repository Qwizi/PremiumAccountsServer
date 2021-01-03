import {User} from './entities/user.enitiy';
import {USERS_REPOSITORY} from "./users.constants";

export const usersProviders = [
    {
        provide: USERS_REPOSITORY,
        useValue: User
    }
]