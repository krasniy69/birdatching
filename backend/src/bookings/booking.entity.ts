import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Excursion } from '../excursions/excursion.entity';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  RESERVE = 'RESERVE',
  CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  excursionId: string;

  @Column({ type: 'int', default: 1 })
  peopleCount: number;

  @Column({ type: 'boolean', default: false })
  binocularNeeded: boolean;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Excursion, { eager: true })
  @JoinColumn({ name: 'excursionId' })
  excursion: Excursion;
}




