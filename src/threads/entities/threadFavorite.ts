import {ForeignKey, Model, Table} from "sequelize-typescript";
import {Thread} from "./thread.entity";
import {User} from "../../users/entities/user.enitiy";

@Table
export class ThreadFavorite extends Model<ThreadFavorite> {
    @ForeignKey(() => Thread)
    threadId: number;

    @ForeignKey(() => User)
    userId: number;
}