import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ExcursionCategory } from '../excursions/excursion-category.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Связь с экскурсиями через промежуточную таблицу
  @OneToMany(() => ExcursionCategory, excursionCategory => excursionCategory.category)
  excursionCategories: ExcursionCategory[];

  // Связь с подписками
  @OneToMany(() => Subscription, subscription => subscription.category)
  subscriptions: Subscription[];
}
