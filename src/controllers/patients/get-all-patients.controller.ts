import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/auth/current-user.decorator'
import { UserPayload } from 'src/auth/jwt.strategy'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('/api/patients/all')
@UseGuards(AuthGuard('jwt'))
export class GetAllPatientsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    // Permission role
    const can = ['admin', 'atendente', 'profissional', 'supervisora']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para acessar a lista de proficionais!',
      )
    }

    return await this.prisma.patient.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  }
}
