import {Table, Column, Model} from "sequelize-typescript";

@Table
export class User extends Model<User> {
    @Column
    username: string;

    @Column
    password: string;

    @Column({
        defaultValue: true
    })
    is_active: boolean;

    @Column({
        defaultValue: false
    })
    is_admin: boolean;
}