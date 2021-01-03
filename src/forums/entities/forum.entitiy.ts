import {Column, Model, Table} from "sequelize-typescript";

@Table
export class Forum extends Model<Forum> {
    @Column
    tid: number;

    @Column
    title: string;
}