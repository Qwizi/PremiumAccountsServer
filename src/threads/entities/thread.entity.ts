import {
    Column,
    CreateDateColumn,
    Entity, ManyToMany,
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

    @Column('text', {nullable: true})
    content_html: string;

    @Column({default: true})
    is_visible: boolean;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @ManyToOne(() => Forum, (forum: Forum) => forum.threads)
    forum: Promise<Forum>

    @ManyToMany(() => User, user => user.not_work_threads)
    not_work_users: User[]

    @ManyToMany(() => User, user => user.favorite_threads)
    favorite_users: User[]
}
