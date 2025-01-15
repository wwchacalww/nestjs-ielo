import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

const alterAppointmentBodySchema = z.object({
  id: z.number().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
})

const bodyValidationPipe = new ZodValidationPipe(alterAppointmentBodySchema)
type AlterAppointmentBodySchema = z.infer<typeof alterAppointmentBodySchema>

@Controller('/api/appointments/alter')
@UseGuards(AuthGuard('jwt'))
export class AlterAppointmentController {
  constructor(private prisma: PrismaService) {}

  @Put()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: AlterAppointmentBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'atendente', 'profissional']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para alterar o horário!',
      )
    }

    const { start, end, id } = body
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

    const startTS = new Date(start)
    const endTS = new Date(end)
    if (startTS.getTime() >= endTS.getTime()) {
      throw new ConflictException('Horário de agendamento inválido!')
    }

    const appointmentPatientInSameTime =
      await this.prisma.appointment.findFirst({
        where: {
          patientId: appointment.patientId,
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
          professionalId: appointment.professionalId,
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

    if (user.role === 'profissional') {
      if (user.sub !== appointment.professional.userId) {
        throw new UnauthorizedException(
          'Você só pode alterar os horário do próprio atendimentos.',
        )
      }
    }
    await this.prisma.appointment.update({
      where: { id },
      data: {
        start,
        end,
      },
    })
  }
}
