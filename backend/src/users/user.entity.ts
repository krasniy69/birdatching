import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  GUIDE = 'guide', 
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID пользователя' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Email пользователя' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Имя пользователя' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя' })
  @Column()
  lastName: string;

  @Column()
  password: string;

  @ApiProperty({ description: 'Роль пользователя', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ description: 'VK ID для OAuth' })
  @Column({ nullable: true })
  vkId: string;

  @ApiProperty({ description: 'Аватар пользователя' })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ description: 'Телефон пользователя' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'Telegram ID пользователя' })
  @Column({ nullable: true })
  telegramId: string;

  @ApiProperty({ description: 'Дата создания' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  @UpdateDateColumn()
  updatedAt: Date;
}



