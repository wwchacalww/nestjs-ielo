import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { getDayOfYear, getWeek, setWeek } from 'date-fns'
import { z } from 'zod'

const listAppointmentsQuerySchema = z.object({
  range: z.string().optional().default('mm'),
  value: z.string().optional().default('0').transform(Number),
  proId: z.string().uuid().optional(),
  patId: z.string().uuid().optional(),
})

const queryValidationPipe = new ZodValidationPipe(listAppointmentsQuerySchema)
type ListAppointmentsQuerySchema = z.infer<typeof listAppointmentsQuerySchema>

@Controller('/appointments')
@UseGuards(AuthGuard('jwt'))
export class ListAppointmentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query(queryValidationPipe) query: ListAppointmentsQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const can = ['admin', 'atendente', 'profissional']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não tem acesso a agenda de horários!',
      )
    }
    const { range, patId, proId, value } = query
    const today = new Date()
    if (user.role === 'profissional') {
      if (range === 'mm') {
        const mm = value === 0 ? today.getMonth() : value - 1
        const gte = new Date(Date.UTC(today.getFullYear(), mm, 1, 5, 0, 0))
        const lte = new Date(
          Date.UTC(today.getFullYear(), mm + 1, 0, 23, 59, 0),
        )
        const appointments = await this.prisma.professional.findMany({
          where: {
            userId: user.sub,
          },
          include: {
            Appointment: {
              where: {
                start: {
                  gte,
                  lte,
                },
              },
            },
          },
        })
        return appointments
      } else if (range === 'wk') {
        const firthDay = new Date('2024-01-01')
        const dayFirth = getDayOfYear(firthDay)
        const today = getDayOfYear(new Date())
        const firthWeek = getWeek(firthDay)
        const secWeek = setWeek(firthDay, 41)
        console.log(firthDay)
        console.log(dayFirth)
        console.log(today)
        console.log('Week: ', firthWeek)
        console.log(secWeek)
      }
      const appointments = await this.prisma.professional.findMany({
        where: {
          userId: user.sub,
        },
        include: {
          Appointment: true,
        },
      })
      return appointments
    }

    return {
      user,
      value,
      range,
      patId,
      proId,
    }
  }
}
