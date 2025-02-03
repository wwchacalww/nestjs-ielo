import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { OutputProgress, progressProps } from './dto'

const getProgressPatientAndMonthQuerySchema = z.object({
  patientId: z.string().uuid(),
  month: z.string().transform(Number),
})
const queryValidationPipe = new ZodValidationPipe(
  getProgressPatientAndMonthQuerySchema,
)

type GetProgressPatientAndMonthQuerySchema = z.infer<
  typeof getProgressPatientAndMonthQuerySchema
>

@Controller('/api/progress/show/patient/month')
@UseGuards(AuthGuard('jwt'))
export class GetProgressPatientAndMonthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: GetProgressPatientAndMonthQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'profissional']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não tem acesso ao registro de evoluções',
      )
    }

    const { month, patientId } = query
    const today = new Date()
    const mm = month === 0 ? today.getMonth() : month - 1

    const gte = new Date(Date.UTC(today.getFullYear(), mm, 1, 5, 0, 0))
    const lte = new Date(Date.UTC(today.getFullYear(), mm + 1, 0, 23, 59, 0))

    const findAppointmentWithProgress = await this.prisma.appointment.findFirst(
      {
        where: {
          patientId,
          NOT: {
            progressId: null,
          },
          start: {
            lte,
            gte,
          },
        },
        select: {
          patient: true,
          progress: true,
        },
      },
    )

    if (!findAppointmentWithProgress?.progress) {
      throw new NotFoundException('Não existe evoluções no mês informado.')
    }

    const { patient } = findAppointmentWithProgress

    const {
      professionalId,
      supervisorId,
      progress: progressTable,
      id: progressId,
      status,
      createdAt,
      updatedAt,
    } = findAppointmentWithProgress.progress

    const proUser = await this.prisma.professional.findFirst({
      where: { userId: user.sub },
    })

    if (!proUser) {
      throw new UnauthorizedException(
        'Você não tem autorização para acessar esse relatório de evolução.',
      )
    }

    if ([professionalId, supervisorId].includes(proUser.id) === false) {
      throw new UnauthorizedException(
        'Você não tem autorização para acessar esse relatório de evolução.',
      )
    }

    const supervisor = await this.prisma.professional.findFirst({
      where: { id: supervisorId ?? '' },
      select: {
        name: true,
        register: true,
      },
    })
    if (!supervisor) {
      throw new NotFoundException('Supervisor não encontrado.')
    }

    const progressData: progressProps = JSON.parse(progressTable)

    const result: OutputProgress = {
      id: progressId,
      patientId,
      professionalId,
      supervisorId: supervisorId ?? '',
      status,
      createdAt,
      updatedAt,
      patient: {
        name: patient.name,
        birthDate: String(patient.birthDate),
        fone: patient.fone,
        payment: patient.payment,
      },
      professional: {
        name: proUser.name,
        register: proUser.register,
      },
      supervisor,
      progressData,
    }
    return result
  }
}
