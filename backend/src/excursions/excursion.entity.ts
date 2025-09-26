import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

@Entity('excursions')
export class Excursion {
  @ApiProperty({ description: 'ID экскурсии' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Название экскурсии' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Описание экскурсии' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Дата проведения экскурсии' })
  @Column('date')
  date: Date;

  @ApiProperty({ description: 'Время начала экскурсии' })
  @Column('time')
  time: string;

  @ApiProperty({ description: 'Местоположение (название)' })
  @Column()
  location: string;

  @ApiProperty({ description: 'Координаты места (широта)' })
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty({ description: 'Координаты места (долгота)' })
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty({ description: 'Место встречи (описание)' })
  @Column('text', { nullable: true })
  meetingPoint: string;

  @ApiProperty({ description: 'Координаты места встречи (широта)' })
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  meetingLatitude: number;

  @ApiProperty({ description: 'Координаты места встречи (долгота)' })
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  meetingLongitude: number;

  @ApiProperty({ description: 'Максимальное количество участников' })
  @Column('int')
  capacity: number;

  @ApiProperty({ description: 'Количество мест в резерве' })
  @Column('int', { default: 0 })
  reserve: number;

  @ApiProperty({ description: 'ID экскурсовода' })
  @Column('uuid')
  guideId: string;

  @ApiProperty({ description: 'Экскурсовод', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'guideId' })
  guide: User;

  @ApiProperty({ description: 'Стоимость экскурсии (рубли)' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @ApiProperty({ description: 'Длительность экскурсии (минуты)' })
  @Column('int', { nullable: true })
  duration: number;

  @ApiProperty({ description: 'Уровень сложности (1-5)' })
  @Column('int', { default: 1 })
  difficulty: number;

  @ApiProperty({ description: 'Активна ли экскурсия' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Дата создания' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  @UpdateDateColumn()
  updatedAt: Date;
}
