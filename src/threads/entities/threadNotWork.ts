import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../../users/entities/user.enitiy";
import {Thread} from "./thread.entity";

@Table
export class ThreadNotWork extends Model<ThreadNotWork> {
    @ForeignKey(() => User)
    @Column
    userId: number;

    @ForeignKey(() => Thread)
    @Column
    threadId: number;
}