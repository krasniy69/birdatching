import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, IsOptional, IsNumber, Min, Max, IsBoolean, IsUUID } from 'class-validator';

export class CreateExcursionDto {
  @ApiProperty({ description: 'Название экскурсии', example: 'Утренние птицы в Сокольниках' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание экскурсии', example: 'Наблюдение за утренней активностью птиц в парке Сокольники' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Дата проведения', example: '2025-04-22' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Время начала', example: '10:00' })
  @IsString()
  time: string;

  @ApiProperty({ description: 'Название места', example: 'Парк Сокольники, центральный вход' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Широта', example: 55.7887, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Долгота', example: 37.6517, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Место встречи', example: 'У главного входа в парк, возле фонтана', required: false })
  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @ApiProperty({ description: 'Широта места встречи', example: 55.7887, required: false })
  @IsOptional()
  @IsNumber()
  meetingLatitude?: number;

  @ApiProperty({ description: 'Долгота места встречи', example: 37.6517, required: false })
  @IsOptional()
  @IsNumber()
  meetingLongitude?: number;

  @ApiProperty({ description: 'Максимальное количество участников', example: 15 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ description: 'Количество резервных мест', example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  reserve?: number;

  @ApiProperty({ description: 'ID экскурсовода' })
  @IsUUID()
  guideId: string;

  @ApiProperty({ description: 'Стоимость экскурсии', example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Длительность в минутах', example: 120, required: false })
  @IsOptional()
  @IsInt()
  @Min(30)
  duration?: number;

  @ApiProperty({ description: 'Уровень сложности (1-5)', example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;
}

export class UpdateExcursionDto {
  @ApiProperty({ description: 'Название экскурсии', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Описание экскурсии', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Дата проведения', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Время начала', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ description: 'Название места', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Широта', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Долгота', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Место встречи', required: false })
  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @ApiProperty({ description: 'Широта места встречи', required: false })
  @IsOptional()
  @IsNumber()
  meetingLatitude?: number;

  @ApiProperty({ description: 'Долгота места встречи', required: false })
  @IsOptional()
  @IsNumber()
  meetingLongitude?: number;

  @ApiProperty({ description: 'Максимальное количество участников', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ description: 'Количество резервных мест', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  reserve?: number;

  @ApiProperty({ description: 'ID экскурсовода', required: false })
  @IsOptional()
  @IsUUID()
  guideId?: string;

  @ApiProperty({ description: 'Стоимость экскурсии', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Длительность в минутах', required: false })
  @IsOptional()
  @IsInt()
  @Min(30)
  duration?: number;

  @ApiProperty({ description: 'Уровень сложности (1-5)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiProperty({ description: 'Активна ли экскурсия', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
