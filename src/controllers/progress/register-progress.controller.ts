import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'
import { progressProps } from './dto'

const progressBodySchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  supervisorId: z.string().uuid(),
  appointmentId: z.number(),
  majorComplaint: z.string().min(3),
  procedures: z.string().min(3),
  progress: z.string().min(3),
  appointmentDate: z.string(),
  status: z.enum(['rascunho', 'aguardando responsável técnico', 'finalizado']),
})

const bodyValidationPipe = new ZodValidationPipe(progressBodySchema)
type ProgressBodySchema = z.infer<typeof progressBodySchema>

@Controller('/api/progress')
@UseGuards(AuthGuard('jwt'))
export class RegisterProgressController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: ProgressBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const {
      professionalId,
      supervisorId,
      patientId,
      appointmentId,
      majorComplaint,
      procedures,
      progress,
      appointmentDate,
      status,
    } = body

    const proUser = await this.prisma.professional.findFirst({
      where: { userId: user.sub },
    })

    if (!proUser || proUser.id !== professionalId) {
      throw new UnauthorizedException(
        'Você só pode alterar os status do próprio atendimentos.',
      )
    }

    const findProgress = await this.prisma.progress.findFirst({
      where: {
        patientId,
        professionalId,
        status: 'rascunho',
      },
    })

    if (!findProgress) {
      const progressData: progressProps = {
        majorComplaint,
        procedures,
        progress: [
          {
            appointmentDate,
            text: progress,
          },
        ],
      }

      const progressText = JSON.stringify(progressData)

      const result = await this.prisma.progress.create({
        data: {
          patientId,
          professionalId,
          supervisorId,
          progress: progressText,
          status,
        },
      })
      await this.prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          progressId: result.id,
        },
      })

      return result
    } else {
      const { progress: progressTable } = findProgress
      const progressData: progressProps = JSON.parse(progressTable)
      const { progress: progressArray } = progressData
      const checkIfExists = progressArray.findIndex(
        (pro) => pro.appointmentDate === appointmentDate,
      )
      if (checkIfExists !== -1) {
        progressArray[checkIfExists].text = progress
      } else {
        progressArray.push({
          appointmentDate,
          text: progress,
        })
      }
      progressData.progress = progressArray
      progressData.majorComplaint = majorComplaint
      progressData.procedures = procedures
      const progressText = JSON.stringify(progressData)
      const result = await this.prisma.progress.update({
        where: {
          id: findProgress.id,
        },
        data: {
          progress: progressText,
          status,
          updatedAt: new Date(),
        },
      })
      await this.prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          progressId: result.id,
        },
      })
      return result
    }
  }
}
