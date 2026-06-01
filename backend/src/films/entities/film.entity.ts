import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ nullable: true })
  director: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  cover: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film, { cascade: true })
  schedule: Schedule[];
}
