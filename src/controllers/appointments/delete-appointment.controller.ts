import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Controller,
  Delete,
  HttpCode,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

const idQueryParamSchema = z.string().transform(Number).pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(idQueryParamSchema)
type IdQueryParamSchema = z.infer<typeof idQueryParamSchema>
@Controller('/api/appointments')
@UseGuards(AuthGuard('jwt'))
export class DeleteAppointmentController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Query('id', queryValidationPipe) id: IdQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.role !== 'admin') {
      throw new UnauthorizedException(
        'Você não tem permissão para excluir um agendamento.',
      )
    }

    await this.prisma.appointment.delete({ where: { id } })
  }
}
