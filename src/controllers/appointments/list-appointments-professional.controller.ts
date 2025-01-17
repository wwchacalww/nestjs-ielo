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
import { getDayOfYear, setDayOfYear, setWeek } from 'date-fns'
import { z } from 'zod'

const listAppointmentsProfessionalQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  range: z.string().optional().default('mm'),
  value: z.string().optional().default('0').transform(Number),
})

const queryValidationPipe = new ZodValidationPipe(
  listAppointmentsProfessionalQuerySchema,
)
type ListAppointmentsProfessionalQuerySchema = z.infer<
  typeof listAppointmentsProfessionalQuerySchema
>

@Controller('/api/appointments/list/professional')
@UseGuards(AuthGuard('jwt'))
export class ListAppointmentsProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query(queryValidationPipe) query: ListAppointmentsProfessionalQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { range, value, page } = query
    const perPage = 20
    const today = new Date()
    today.setUTCHours(3)
    today.setUTCMinutes(0)
    today.setUTCSeconds(0)
    const dayOfYear = getDayOfYear(new Date())
    const professional = await this.prisma.professional.findFirst({
      where: {
        userId: user.sub,
      },
    })

    if (!professional) {
      throw new UnauthorizedException(
        'Você não tem acesso a agenda de horários!',
      )
    }

    const { id: professionalId } = professional

    if (range === 'mm') {
      const mm = value === 0 ? today.getMonth() : value - 1
      const gte = new Date(Date.UTC(today.getFullYear(), mm, 1, 5, 0, 0))
      const lte = new Date(Date.UTC(today.getFullYear(), mm + 1, 0, 23, 59, 0))
      const [totalCount, appointments] = await this.prisma.$transaction([
        this.prisma.appointment.count(),
        this.prisma.appointment.findMany({
          where: {
            professionalId,
            start: {
              lte,
              gte,
            },
          },
          take: perPage,
          skip: (page - 1) * perPage,
          orderBy: {
            start: 'asc',
          },
          include: {
            professional: {
              select: {
                name: true,
              },
            },
            patient: {
              select: {
                name: true,
              },
            },
          },
        }),
      ])
      const result = {
        appointments,
        meta: {
          page,
          perPage,
          totalCount,
        },
      }
      return result
    } else if (range === 'wk') {
      const year = new Date().getFullYear().toString()
      const firthDay = new Date(year + '-01-01')
      const wkNumber = value === 0 ? Math.ceil(dayOfYear / 7) : value
      const startWeek = setWeek(firthDay, wkNumber)
      const endWeek = new Date(
        startWeek.getFullYear(),
        startWeek.getMonth(),
        startWeek.getDate() + 7,
        20,
        59,
        0,
      )

      const [totalCount, appointments] = await this.prisma.$transaction([
        this.prisma.appointment.count(),
        this.prisma.appointment.findMany({
          where: {
            professionalId,
            start: {
              lte: endWeek,
              gte: startWeek,
            },
          },
          take: perPage,
          skip: (page - 1) * perPage,
          orderBy: {
            start: 'asc',
          },
          include: {
            professional: {
              select: {
                name: true,
              },
            },
            patient: {
              select: {
                name: true,
              },
            },
          },
        }),
      ])

      const result = {
        appointments,
        meta: {
          page,
          perPage,
          totalCount,
        },
      }
      return result
    } else if (range === 'dd') {
      const dof = value === 0 ? dayOfYear : value
      const gte = setDayOfYear(today, dof)
      const lte = setDayOfYear(today, dof)
      lte.setUTCHours(23)
      lte.setUTCMinutes(59)
      lte.setUTCSeconds(59)

      const [totalCount, appointments] = await this.prisma.$transaction([
        this.prisma.appointment.count(),
        this.prisma.appointment.findMany({
          where: {
            professionalId,
            start: {
              gte,
              lte,
            },
          },
          take: perPage,
          skip: (page - 1) * perPage,
          orderBy: {
            start: 'asc',
          },
          include: {
            professional: {
              select: {
                name: true,
              },
            },
            patient: {
              select: {
                name: true,
              },
            },
          },
        }),
      ])
      const result = {
        appointments,
        meta: {
          page,
          perPage,
          totalCount,
        },
      }
      return result
    }
  }
}
