import { Controller, Get, Patch, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Роль должна быть одной из: admin, guide, user' })
  role: UserRole;
}

@ApiTags('Управление пользователями')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить список всех пользователей (только для админа)' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Изменить роль пользователя (только для админа)' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['admin', 'guide', 'user'],
          description: 'Новая роль пользователя'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Роль пользователя обновлена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req
  ) {
    // Проверяем, что админ не пытается изменить свою роль
    if (userId === req.user.userId) {
      throw new BadRequestException('Нельзя изменить собственную роль');
    }

    return this.usersService.updateRole(userId, updateUserRoleDto.role);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  async getCurrentUserProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }
}
