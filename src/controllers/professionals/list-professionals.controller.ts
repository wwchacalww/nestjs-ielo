import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/auth/current-user.decorator'
import { UserPayload } from 'src/auth/jwt.strategy'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))
const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
@Controller('/api/professionals')
@UseGuards(AuthGuard('jwt'))
export class ListProfessionalsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {
    // Permission role
    const can = ['admin', 'atendente']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para acessar a lista de proficionais!',
      )
    }

    const perPage = 20

    const [totalCount, professionals] = await this.prisma.$transaction([
      this.prisma.professional.count(),
      this.prisma.professional.findMany({
        take: perPage,
        skip: (page - 1) * perPage,
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    const result = {
      professionals,
      meta: {
        page,
        perPage,
        totalCount,
      },
    }

    return result
  }
}
