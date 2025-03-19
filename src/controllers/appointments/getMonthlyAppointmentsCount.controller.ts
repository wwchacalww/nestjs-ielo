import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { calculatePercentageDifference } from '@/utils/calculatePercentageDifference'
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

const getMonthlyAppointmentsCountQuerySchema = z.object({
  query: z.enum(['all', 'social', 'private', 'plan']).optional().default('all'),
})

const queryValidationPipe = new ZodValidationPipe(
  getMonthlyAppointmentsCountQuerySchema,
)
type GetMonthlyAppointmentsCountQuery = z.infer<
  typeof getMonthlyAppointmentsCountQuerySchema
>
@Controller('/api/appointments/monthly-appointments-count')
@UseGuards(AuthGuard('jwt'))
export class GetMonthlyAppointmentsCount {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: GetMonthlyAppointmentsCountQuery,
  ) {
    let appointments: {
      start: Date
    }[] = []

    if (query.query === 'all') {
      appointments = await this.prisma.appointment.findMany({
        select: {
          start: true,
        },
      })
    } else if (query.query === 'social') {
      appointments = await this.prisma.appointment.findMany({
        where: {
          payment: 'Social',
        },
        select: {
          start: true,
        },
      })
    } else if (query.query === 'private') {
      appointments = await this.prisma.appointment.findMany({
        where: {
          payment: 'Particular',
        },
        select: {
          start: true,
        },
      })
    } else if (query.query === 'plan') {
      appointments = await this.prisma.appointment.findMany({
        where: {
          NOT: {
            payment: 'Particular',
          },
          AND: {
            NOT: {
              payment: 'Social',
            },
          },
        },
        select: {
          start: true,
        },
      })
    }
    const mm = new Date().getMonth()

    const mmBefore = mm - 1 < 0 ? 11 : mm - 1

    const appointmentsCount = appointments.reduce(
      (acc, appointment) => {
        const month = appointment.start.getMonth()
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const now = appointmentsCount[mm] || 0
    const before = appointmentsCount[mmBefore] || 0
    const diff = calculatePercentageDifference(now, before)

    return {
      total: appointmentsCount[mm] || 0,
      percentage: diff,
    }
  }
}
