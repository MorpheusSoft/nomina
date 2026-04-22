import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { WorkerTicketsService } from './worker-tickets.service';
import { CreateWorkerTicketDto } from './dto/create-worker-ticket.dto';
import { UpdateWorkerTicketDto } from './dto/update-worker-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('worker-tickets')
@UseGuards(JwtAuthGuard)
export class WorkerTicketsController {
  constructor(private readonly workerTicketsService: WorkerTicketsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createWorkerTicketDto: CreateWorkerTicketDto) {
    return this.workerTicketsService.create(user.tenantId, createWorkerTicketDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('workerId') workerId?: string) {
    return this.workerTicketsService.findAll(user.tenantId, workerId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workerTicketsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateWorkerTicketDto: UpdateWorkerTicketDto) {
    return this.workerTicketsService.update(id, user.tenantId, updateWorkerTicketDto);
  }

  @Post(':id/comments')
  addComment(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { text: string }) {
    // Se utiliza el nombre del usuario logeado desde el token JWT
    const authorName = user?.firstName ? `${user.firstName} ${user.lastName}` : 'Analista de RRHH';
    return this.workerTicketsService.addComment(id, user.tenantId, authorName, body.text);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workerTicketsService.remove(id, user.tenantId);
  }
}
