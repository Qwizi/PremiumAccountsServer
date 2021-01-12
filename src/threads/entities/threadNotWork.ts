import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Thread} from "./thread.entity";
import {User} from "../../users/entities/user.enitiy";

@Entity()
export class ThreadNotWork {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Thread, (thread: Thread) => thread.not_works)
    thread: Promise<Thread>;

    @ManyToOne(() => User, (user: User) => user.not_works)
    user: Promise<User>;
}
