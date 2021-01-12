import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Forum} from "../../forums/entities/forum.entitiy";
import {User} from "../../users/entities/user.enitiy";

@Entity()
export class Thread {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tid: string;

    @Column()
    url: string;

    @Column()
    title: string;

    @Column()
    content_html: string;

    @Column({default: true})
    is_visible: boolean;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @ManyToOne(() => Forum, (forum: Forum) => forum.threads)
    forum: Promise<Forum>

    @OneToMany(() => User, (user: User) => user.favorite_threads)
    favorites: Promise<User[]>

    @OneToMany(() => User, (user: User) => user.not_works)
    not_works: Promise<User[]>
}

/*import {BelongsToMany, Column, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Forum} from "../../forums/entities/forum.entitiy";
import {ThreadNotWork} from "./threadNotWork";
import {User} from "../../users/entities/user.enitiy";
import {ThreadFavorite} from "./threadFavorite";

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

    @BelongsToMany(() => User, () => ThreadFavorite)
    users: User[]
}*/