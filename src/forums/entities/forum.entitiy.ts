import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Thread} from "../../threads/entities/thread.entity";

@Entity()
export class Forum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fid: number;

    @Column()
    title: string;

    @OneToMany(() => Thread, (thread: Thread) => thread.forum)
    threads: Promise<Thread[]>

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;
}