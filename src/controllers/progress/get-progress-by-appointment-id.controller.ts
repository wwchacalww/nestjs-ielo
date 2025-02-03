import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { OutputProgress, progressProps } from './dto'

@Controller('/api/progress/appointment/:appoinmentId')
@UseGuards(AuthGuard('jwt'))
export class GetProgressByAppointmentIdController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('appoinmentId') appointmentId: number,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'profissional']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não tem acesso ao registro de evoluções',
      )
    }
    const proUser = await this.prisma.professional.findFirst({
      where: { userId: user.sub },
    })

    if (!proUser) {
      throw new UnauthorizedException(
        'Você não tem autorização para acessar esse relatório de evolução.',
      )
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: Number(appointmentId),
      },
      include: {
        patient: true,
        professional: true,
      },
    })

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada.')
    }

    const { start, patientId, professionalId, patient, professional } =
      appointment

    const mm = start.getMonth()

    const gte = new Date(Date.UTC(start.getFullYear(), mm, 1, 5, 0, 0))
    const lte = new Date(Date.UTC(start.getFullYear(), mm + 1, 0, 23, 59, 0))

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
      const result: OutputProgress = {
        id: '',
        patientId,
        professionalId,
        supervisorId: '',
        status: 'rascunho',
        createdAt: new Date(),
        updatedAt: null,
        patient: {
          name: patient.name,
          birthDate: String(patient.birthDate),
          fone: patient.fone,
          payment: patient.payment,
        },
        professional: {
          name: professional.name,
          register: professional.register,
        },
        supervisor: {
          name: professional.name,
          register: professional.register,
        },
        progressData: {
          majorComplaint: '',
          procedures: '',
          progress: [],
        },
      }
      return { progress: result, appointment }
    }

    const {
      supervisorId,
      progress: progressTable,
      id: progressId,
      status,
      createdAt,
      updatedAt,
    } = findAppointmentWithProgress.progress

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
    return { progress: result, appointment }
  }
}
