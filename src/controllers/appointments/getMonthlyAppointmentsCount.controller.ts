import { PrismaService } from '@/prisma/prisma.service'
import { calculatePercentageDifference } from '@/utils/calculatePercentageDifference'
import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/api/appointments/monthly-appointments-count')
@UseGuards(AuthGuard('jwt'))
export class GetMonthlyAppointmentsCount {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle() {
    const appointments = await this.prisma.appointment.findMany({
      select: {
        start: true,
      },
    })
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
    const diff = calculatePercentageDifference(
      appointmentsCount[mm],
      appointmentsCount[mmBefore],
    )

    return {
      total: appointmentsCount[mm],
      percentage: diff,
    }
  }
}
