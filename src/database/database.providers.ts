import {Sequelize} from "sequelize-typescript";
import {SEQUELIZE} from "./database.contants";
import {User} from "../users/entities/user.enitiy";
import {Forum} from "../forums/entities/forum.entitiy";

export const databaseProviders = [
    {
        provide: SEQUELIZE,
        useFactory: async () => {
            const sequelize = new Sequelize({
                dialect: 'sqlite',
                storage: './db.sqlite'
            })

            // @ts-ignore
            sequelize.addModels([User, Forum])
            await sequelize.sync({force: false});
            return sequelize;
        }
    }
]