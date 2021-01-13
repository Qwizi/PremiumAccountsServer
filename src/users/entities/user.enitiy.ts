import {
    Column,
    CreateDateColumn,
    Entity, ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinTable
} from "typeorm";
import {Thread} from "../../threads/entities/thread.entity";

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

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @ManyToMany(() => Thread, thread => thread.not_work_users)
    @JoinTable()
    not_work_threads: Thread[]

    @ManyToMany(() => Thread, thread => thread.favorite_users)
    @JoinTable()
    favorite_threads: Thread[]

    /*
    @ManyToMany(() => Thread, (thread: Thread) => thread.user_favorites)
    @JoinTable()
    favorite_threads: Thread[]
     */

}
