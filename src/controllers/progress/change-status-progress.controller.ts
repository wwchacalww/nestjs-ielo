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

const changeStatusProgressBodySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['rascunho', 'aguardando responsável técnico', 'finalizado']),
})

const bodyValidationPipe = new ZodValidationPipe(changeStatusProgressBodySchema)
type ChangeStatusProgressBodySchema = z.infer<
  typeof changeStatusProgressBodySchema
>

@Controller('/api/progress/change/status')
@UseGuards(AuthGuard('jwt'))
export class ChangeStatusProgressController {
  constructor(private prisma: PrismaService) {}

  @Put()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: ChangeStatusProgressBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'profissional', 'supervisora']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para alterar o horário!',
      )
    }

    const { id, status } = body
    const progress = await this.prisma.progress.findUnique({
      where: { id },
      include: {
        profissional: {
          select: {
            userId: true,
          },
        },
        Appointment: {
          select: {
            id: true,
          },
        },
      },
    })
    if (!progress) {
      throw new NotFoundException('Evolução não encontrada!')
    }

    if (user.role === 'profissional') {
      if (user.sub !== progress.profissional.userId) {
        throw new UnauthorizedException(
          'Você só pode alterar os status do próprio atendimentos.',
        )
      }
    }
    await this.prisma.progress.update({
      where: { id },
      data: {
        status,
      },
    })
    progress.Appointment.forEach(async (app) => {
      const statusApp = status === 'rascunho' ? 'aguardando evolução' : status
      await this.prisma.appointment.update({
        where: {
          id: app.id,
        },
        data: {
          status: statusApp,
        },
      })
    })
  }
}
