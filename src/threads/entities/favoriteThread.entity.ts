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
/*
import {ForeignKey, Model, Table} from "sequelize-typescript";
import {Thread} from "./thread.entity";
import {User} from "../../users/entities/user.enitiy";

@Table
export class ThreadFavorite extends Model<ThreadFavorite> {
    @ForeignKey(() => Thread)
    threadId: number;

    @ForeignKey(() => User)
    userId: number;
}*/
