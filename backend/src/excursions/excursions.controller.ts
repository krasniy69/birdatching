import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExcursionsService } from './excursions.service';
import { CreateExcursionDto, UpdateExcursionDto } from './dto/excursion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Экскурсии')
@Controller('excursions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать новую экскурсию (только для админа)' })
  @ApiResponse({ status: 201, description: 'Экскурсия создана' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async create(@Body() createExcursionDto: CreateExcursionDto) {
    console.log('Получены данные для создания экскурсии:', createExcursionDto);
    try {
      const result = await this.excursionsService.create(createExcursionDto);
      console.log('Экскурсия успешно создана:', result.id);
      return result;
    } catch (error) {
      console.error('Ошибка создания экскурсии:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить список экскурсий' })
  @ApiQuery({ name: 'my', required: false, description: 'Только мои экскурсии (для экскурсоводов)' })
  @ApiQuery({ name: 'categories', required: false, description: 'Фильтр по категориям (через запятую)' })
  @ApiResponse({ status: 200, description: 'Список экскурсий' })
  async findAll(@Request() req, @Query('my') onlyMy?: string, @Query('categories') categories?: string) {
    const { role: userRole, userId } = req.user;
    
    // Если экскурсовод запрашивает только свои экскурсии или это его роль по умолчанию
    const shouldFilterByGuide = userRole === UserRole.GUIDE || onlyMy === 'true';
    
    // Парсим категории из строки
    const categoryIds = categories ? categories.split(',').filter(id => id.trim()) : undefined;
    
    return this.excursionsService.findAllWithCategories(
      shouldFilterByGuide ? userRole : undefined,
      shouldFilterByGuide ? userId : undefined,
      categoryIds
    );
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить статистику по экскурсиям (только для админа)' })
  @ApiResponse({ status: 200, description: 'Статистика экскурсий' })
  async getStatistics() {
    return this.excursionsService.getStatistics();
  }

  @Get(':id/bookings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'Получить список участников экскурсии (админ или экскурсовод)' })
  @ApiParam({ name: 'id', description: 'ID экскурсии' })
  @ApiResponse({ status: 200, description: 'Список участников экскурсии' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Экскурсия не найдена' })
  async getExcursionBookings(@Param('id') id: string, @Request() req) {
    const { role: userRole, userId } = req.user;
    return this.excursionsService.getExcursionBookings(id, userRole, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить экскурсию по ID' })
  @ApiParam({ name: 'id', description: 'ID экскурсии' })
  @ApiResponse({ status: 200, description: 'Данные экскурсии' })
  @ApiResponse({ status: 404, description: 'Экскурсия не найдена' })
  async findOne(@Param('id') id: string, @Request() req) {
    const { role: userRole, userId } = req.user;
    return this.excursionsService.findOne(id, userRole, userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'Обновить экскурсию (админ или экскурсовод)' })
  @ApiParam({ name: 'id', description: 'ID экскурсии' })
  @ApiResponse({ status: 200, description: 'Экскурсия обновлена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Экскурсия не найдена' })
  async update(
    @Param('id') id: string, 
    @Body() updateExcursionDto: UpdateExcursionDto,
    @Request() req
  ) {
    const { role: userRole, userId } = req.user;
    return this.excursionsService.update(id, updateExcursionDto, userRole, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'Удалить экскурсию (админ или экскурсовод)' })
  @ApiParam({ name: 'id', description: 'ID экскурсии' })
  @ApiResponse({ status: 200, description: 'Экскурсия удалена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Экскурсия не найдена' })
  async remove(@Param('id') id: string, @Request() req) {
    const { role: userRole, userId } = req.user;
    await this.excursionsService.remove(id, userRole, userId);
    return { message: 'Экскурсия удалена' };
  }
}
