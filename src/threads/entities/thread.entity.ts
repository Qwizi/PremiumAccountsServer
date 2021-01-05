import {Column, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Forum} from "../../forums/entities/forum.entitiy";
import {ThreadNotWork} from "./threadNotWork";

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

    @HasMany(() => ThreadNotWork)
    not_works: ThreadNotWork[]

    @ForeignKey(() => Forum)
    forumId: number;

    @Column({
        defaultValue: true
    })
    is_visible: boolean;
}