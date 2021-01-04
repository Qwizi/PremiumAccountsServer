import {Column, HasMany, Model, Table} from "sequelize-typescript";
import {Thread} from "../../threads/entities/thread.entity";

@Table
export class Forum extends Model<Forum> {
    @Column
    fid: number;

    @Column
    title: string;

    @HasMany(() => Thread)
    threads: Thread[]
}