import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Excursion } from './excursion.entity';
import { Category } from '../categories/category.entity';

@Entity('excursion_categories')
@Unique(['excursionId', 'categoryId'])
export class ExcursionCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  excursionId: string;

  @Column('uuid')
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Excursion, excursion => excursion.excursionCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'excursionId' })
  excursion: Excursion;

  @ManyToOne(() => Category, category => category.excursionCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}

