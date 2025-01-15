import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

const changeStatusAppointmentBodySchema = z.object({
  id: z.number().min(1),
  status: z.enum([
    'agendado',
    'em consulta',
    'finalizado',
    'cancelado',
    'faltou',
    'aguardando responsável técnico',
    'aguardando evolução',
  ]),
})

const bodyValidationPipe = new ZodValidationPipe(
  changeStatusAppointmentBodySchema,
)
type ChangeStatusAppointmentBodySchema = z.infer<
  typeof changeStatusAppointmentBodySchema
>

@Controller('/api/appointments/change/status')
@UseGuards(AuthGuard('jwt'))
export class ChangeStatusAppointmentController {
  constructor(private prisma: PrismaService) {}

  @Put()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: ChangeStatusAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'atendente', 'profissional']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para alterar o horário!',
      )
    }

    const { id, status } = body
    const appointment = await this.prisma.appointment.findFirst({
      where: { id },
      include: {
        professional: {
          select: {
            userId: true,
          },
        },
      },
    })
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado!')
    }

    if (user.role === 'profissional') {
      if (user.sub !== appointment.professional.userId) {
        throw new UnauthorizedException(
          'Você só pode alterar os status do próprio atendimentos.',
        )
      }
    }
    await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
      },
    })
  }
}
