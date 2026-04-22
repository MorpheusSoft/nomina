import { Controller, Get, Post, Body, Param, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PortalService } from './portal.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post('login')
  login(@Body() data: { identityNumber: string; birthDate: string }) {
    return this.portalService.login(data.identityNumber, data.birthDate);
  }

  @Get('receipts/worker/:workerId')
  getReceipts(@Param('workerId') workerId: string) {
    return this.portalService.getReceipts(workerId);
  }

  @Get('receipts/by-token/:token')
  getReceiptByToken(@Param('token') token: string) {
    return this.portalService.getReceiptByToken(token);
  }

  @Post('receipts/:id/sign')
  signReceipt(@Param('id') id: string, @Req() req: any) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    return this.portalService.signReceipt(id, ip);
  }

  // Self-Service Documents
  @Get('documents/:workerId')
  getSelfServiceDocuments(@Param('workerId') workerId: string) {
    return this.portalService.getSelfServiceDocumentsByWorker(workerId);
  }

  @Get('documents/:templateId/preview/:workerId')
  previewSelfServiceDocument(@Param('templateId') templateId: string, @Param('workerId') workerId: string) {
    return this.portalService.compileSelfServiceDocument(templateId, workerId);
  }

  // Requerimientos (Tickets del Help Desk)
  @Get('worker-tickets/:workerId')
  getTickets(@Param('workerId') workerId: string) {
    return this.portalService.getTickets(workerId);
  }

  @Post('worker-tickets/upload/:workerId')
  @UseInterceptors(FilesInterceptor('files', 3, {
    storage: diskStorage({
      destination: './uploads/tickets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${req.params.workerId}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    limits: { fileSize: 2 * 1024 * 1024 } // Límite de 2MB por archivo
  }))
  uploadFiles(@Param('workerId') workerId: string, @UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) return { success: false, urls: [] };
    const urls = files.map(file => `/uploads/tickets/${file.filename}`);
    return { success: true, urls };
  }

  @Post('worker-tickets/:workerId')
  createTicket(
    @Param('workerId') workerId: string,
    @Body() data: any
  ) {
    return this.portalService.createTicket(workerId, data);
  }

  @Post('worker-tickets/:workerId/comments/:ticketId')
  addTicketComment(
    @Param('workerId') workerId: string,
    @Param('ticketId') ticketId: string,
    @Body() body: { text: string }
  ) {
    return this.portalService.addTicketComment(workerId, ticketId, body.text);
  }

  // Loans (Préstamos)
  @Get('loans/:workerId')
  getLoans(
    @Param('workerId') workerId: string,
    @Req() req: any
  ) {
    const currencyView = req.query.currencyView || 'VES';
    const exchangeRateString = req.query.exchangeRate || '1';
    return this.portalService.getLoansAccount(workerId, currencyView as string, exchangeRateString as string);
  }
}
