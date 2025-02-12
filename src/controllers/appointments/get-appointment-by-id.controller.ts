import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Controller,
  Get,
  HttpCode,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/api/appointments/show/:appoinmentId')
@UseGuards(AuthGuard('jwt'))
export class GetAppointmentById {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('appoinmentId') appointmentId: number,
    @CurrentUser() user: UserPayload,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: Number(appointmentId),
      },
      include: {
        patient: true,
        professional: true,
      },
    })
    if (!appointment) {
      throw new Error('Consulta não encontrada!')
    }
    if (['admin', 'atendente', 'supervisora'].includes(user.role)) {
      return { appointment }
    }
    if (user.role === 'profissional') {
      const professional = await this.prisma.professional.findFirst({
        where: {
          userId: user.sub,
        },
      })

      if (!professional) {
        throw new UnauthorizedException(
          'Você não tem acesso a agenda de horários!',
        )
      }

      const { id: professionalId } = professional
      if (appointment.professionalId !== professionalId) {
        throw new UnauthorizedException(
          'Você não tem acesso a esse atendimento.',
        )
      }

      return { appointment }
    }
  }
}
