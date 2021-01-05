import {Sequelize} from "sequelize-typescript";
import {SEQUELIZE} from "./database.contants";
import {User} from "../users/entities/user.enitiy";
import {Forum} from "../forums/entities/forum.entitiy";
import {Thread} from "../threads/entities/thread.entity";
import {ThreadNotWork} from "../threads/entities/threadNotWork";

export const databaseProviders = [
    {
        provide: SEQUELIZE,
        useFactory: async () => {
            const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                //storage: './db.sqlite'
            })

            // @ts-ignore
            sequelize.addModels([
                User,
                Forum,
                Thread,
                ThreadNotWork
            ])
            await sequelize.sync({force: false});
            return sequelize;
        }
    }
]