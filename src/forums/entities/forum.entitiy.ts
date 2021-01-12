import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Forum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fid: number;

    @Column()
    title: string;

    // TODO dodac relacje do tematow
}

/*import {Column, HasMany, Model, Table} from "sequelize-typescript";
import {Thread} from "../../threads/entities/thread.entity";

@Table
export class Forum extends Model<Forum> {
    @Column
    fid: number;

    @Column
    title: string;

    @HasMany(() => Thread)
    threads: Thread[]
}*/