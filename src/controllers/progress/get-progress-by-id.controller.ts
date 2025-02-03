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

@Controller('/api/progress/show/:progressId')
@UseGuards(AuthGuard('jwt'))
export class GetProgressByIdController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Param('progressId') progressId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const progress = await this.prisma.progress.findFirst({
      where: { id: progressId },
    })

    if (!progress) {
      throw new NotFoundException('Relatório de evolução não encontrado.')
    }

    const {
      professionalId,
      supervisorId,
      patientId,
      progress: progressTable,
      status,
      createdAt,
      updatedAt,
    } = progress

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

    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId },
      select: {
        name: true,
        birthDate: true,
        fone: true,
        payment: true,
      },
    })
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.')
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
      id: progress.id,
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
