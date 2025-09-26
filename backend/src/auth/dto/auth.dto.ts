import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ description: 'Пароль', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({ description: 'Имя', example: 'Иван' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Фамилия', example: 'Иванов' })
  @IsString()
  lastName: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email пользователя', example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ description: 'Пароль', example: 'password123' })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT токен доступа' })
  accessToken: string;

  @ApiProperty({ description: 'JWT токен обновления' })
  refreshToken: string;

  @ApiProperty({ description: 'Информация о пользователе' })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}



