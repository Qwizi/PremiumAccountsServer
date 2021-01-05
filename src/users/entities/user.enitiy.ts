import {Table, Column, Model, BelongsToMany} from "sequelize-typescript";
import {Thread} from "../../threads/entities/thread.entity";
import {ThreadFavorite} from "../../threads/entities/threadFavorite";

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

    @BelongsToMany(() => Thread, () => ThreadFavorite)
    favorite_threads: Thread[]
}