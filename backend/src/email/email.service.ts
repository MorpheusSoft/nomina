import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private defaultTransporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    // Configuración SMTP por defecto para la empresa principal (Morpheus/Nebula)
    this.defaultTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // SSL
      secure: true, 
      auth: {
        user: 'lzambrano@nebulapayrolls.com',
        pass: 'ocnonstzcgxsmylj' 
      }
    });
  }

  async sendPortalLink(toEmail: string, candidateName: string, processTitle: string, portalToken: string, fallbackCompanyName: string = 'Nebula ATS', tenantId?: string) {
    const portalUrl = `http://localhost:3000/candidates/${portalToken}`;

    let effectiveCompanyName = fallbackCompanyName;
    let transporter = this.defaultTransporter;
    let fromEmail = 'lzambrano@nebulapayrolls.com';

    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (tenant?.name) {
        effectiveCompanyName = tenant.name;
      }
      if (tenant?.smtpEmail && tenant?.smtpPassword) {
        transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', // Asumiendo gmail por defecto, o se podría hacer dinámico
          port: 465,
          secure: true,
          auth: {
            user: tenant.smtpEmail,
            pass: tenant.smtpPassword
          }
        });
        fromEmail = tenant.smtpEmail;
      }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${effectiveCompanyName}</h1>
          <p style="color: #64748b; font-size: 16px; margin-top: 5px;">Portal del Candidato</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
          <h2 style="margin-top: 0; color: #0f172a;">Hola ${candidateName},</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Avanzamos al siguiente paso en tu postulación para la vacante de <strong>${processTitle}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Hemos asignado algunas evaluaciones técnicas o psicotécnicas a tu perfil. Por favor, ingresa a tu Portal de Candidato para resolverlas.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${portalUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Acceder al Portal
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
            <a href="${portalUrl}" style="color: #3b82f6; word-break: break-all;">${portalUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #94a3b8;">
          <p>Este es un correo automático, por favor no respondas a esta dirección.</p>
          <p>&copy; ${new Date().getFullYear()} ${effectiveCompanyName}. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"${effectiveCompanyName} Reclutamiento" <${fromEmail}>`,
        to: toEmail,
        subject: `Evaluaciones Asignadas - ${processTitle}`,
        html: htmlContent,
      });
      console.log('Correo enviado exitosamente: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error al enviar correo:', error);
      return false;
    }
  }
}
