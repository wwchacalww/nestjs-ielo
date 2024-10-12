import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

const appointmentBodySchema = z.object({
  specialty: z.string().min(3),
  start: z.string().datetime(),
  end: z.string().datetime(),
  local: z.string(),
  status: z.string().optional().default('agendado'),
  payment: z.string().optional().default('aguardando pagamento'),
  value: z.number(),
  professionalId: z.string().uuid(),
  patientId: z.string().uuid(),
})

const bodyValidationPipe = new ZodValidationPipe(appointmentBodySchema)
type AppointmentBodySchema = z.infer<typeof appointmentBodySchema>

@Controller('/appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: AppointmentBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'atendente', 'profissional']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para agendar um horário!',
      )
    }

    const {
      start,
      end,
      local,
      patientId,
      payment,
      professionalId,
      specialty,
      value,
    } = body
    const startTS = new Date(start)
    const endTS = new Date(end)
    if (startTS.getTime() >= endTS.getTime()) {
      throw new ConflictException('Horário de agendamento inválido!')
    }

    const appointmentPatientInSameTime =
      await this.prisma.appointment.findFirst({
        where: {
          patientId,
          OR: [
            { start: { lte: endTS }, end: { gte: startTS } },
            { start: { gte: startTS }, end: { lte: endTS } },
          ],
        },
      })
    if (appointmentPatientInSameTime) {
      throw new ConflictException(
        'Paciente já tem atendimento agendado para este horário!',
      )
    }
    const appointmentProfessionalInSameTime =
      await this.prisma.appointment.findFirst({
        where: {
          professionalId,
          OR: [
            { start: { lte: endTS }, end: { gte: startTS } },
            { start: { gte: startTS }, end: { lte: endTS } },
          ],
        },
      })
    if (appointmentProfessionalInSameTime) {
      throw new ConflictException(
        'Profissional já tem atendimento agendado para este horário!',
      )
    }

    await this.prisma.appointment.create({
      data: {
        start,
        end,
        local,
        payment,
        specialty,
        professionalId,
        patientId,
        status: 'agendado',
        value,
      },
    })
  }
}
