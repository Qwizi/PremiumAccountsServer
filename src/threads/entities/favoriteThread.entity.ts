import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Thread} from "./thread.entity";
import {User} from "../../users/entities/user.enitiy";

@Entity()
export class FavoriteThread {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => Thread, (thread: Thread) => thread.favorites)
    thread: Promise<Thread>;

    @ManyToOne(() => User, (user: User) => user.favorite_threads)
    user: Promise<User>;
}