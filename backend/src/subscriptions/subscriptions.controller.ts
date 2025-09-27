import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  subscribe(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(req.user.userId, createSubscriptionDto);
  }

  @Delete(':categoryId')
  unsubscribe(@Request() req, @Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.subscriptionsService.unsubscribe(req.user.userId, categoryId);
  }

  @Get('my')
  getUserSubscriptions(@Request() req) {
    return this.subscriptionsService.getUserSubscriptions(req.user.userId);
  }

  @Get('my-with-categories')
  getUserSubscriptionsWithCategories(@Request() req) {
    return this.subscriptionsService.getUserSubscriptionsWithCategories(req.user.userId);
  }
}
