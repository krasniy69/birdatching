import { IsInt, IsBoolean, IsOptional, IsEnum, IsString, Min, Max } from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class CreateBookingDto {
  @IsInt({ message: 'Количество человек должно быть числом' })
  @Min(1, { message: 'Минимальное количество человек: 1' })
  @Max(3, { message: 'Максимальное количество человек: 3' })
  peopleCount: number;

  @IsBoolean({ message: 'Поле "бинокль" должно быть булевым значением' })
  @IsOptional()
  binocularNeeded?: boolean;

  @IsString({ message: 'Заметки должны быть строкой' })
  @IsOptional()
  notes?: string;
}

export class UpdateBookingDto {
  @IsInt({ message: 'Количество человек должно быть числом' })
  @Min(1, { message: 'Минимальное количество человек: 1' })
  @Max(3, { message: 'Максимальное количество человек: 3' })
  @IsOptional()
  peopleCount?: number;

  @IsBoolean({ message: 'Поле "бинокль" должно быть булевым значением' })
  @IsOptional()
  binocularNeeded?: boolean;

  @IsEnum(BookingStatus, { message: 'Некорректный статус бронирования' })
  @IsOptional()
  status?: BookingStatus;

  @IsString({ message: 'Заметки должны быть строкой' })
  @IsOptional()
  notes?: string;
}

export class BookingResponseDto {
  id: string;
  peopleCount: number;
  binocularNeeded: boolean;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  excursion: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
}



