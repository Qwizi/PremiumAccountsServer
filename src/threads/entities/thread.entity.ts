import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import {Forum} from "../../forums/entities/forum.entitiy";

@Table
export class Thread extends Model<Thread> {
    @Column
    tid: string;

    @Column
    url: string;

    @Column
    title: string;

    @Column
    content_html: string;

    @Column({
        defaultValue: 0
    })
    not_work_count: number;

    @ForeignKey(() => Forum)
    @Column
    forumId: number;
}