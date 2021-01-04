import {Column, Model, Table} from "sequelize-typescript";

@Table
export class Forum extends Model<Forum> {
    @Column
    fid: number;

    @Column
    title: string;
}