import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Forum} from "../../forums/entities/forum.entitiy";
import {JoinTable} from "typeorm/browser";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({
        default: true
    })
    is_active: boolean;

    @Column({
        default: false
    })
    is_admin: boolean;

    /*
    @ManyToMany(() => Thread, (thread: Thread) => thread.user_favorites)
    @JoinTable()
    favorite_threads: Thread[]
     */

}
/*import {Table, Column, Model, BelongsToMany} from "sequelize-typescript";
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
}*/