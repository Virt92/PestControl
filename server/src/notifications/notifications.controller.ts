import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('unread')
  findUnread(@Req() req: any) { return this.service.findUnread(); }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id/read')
  markRead(@Param('id') id: string) { return this.service.markRead(id); }

  @Post('read-all')
  markAllRead(@Req() req: any) { return this.service.markAllRead(); }
}
