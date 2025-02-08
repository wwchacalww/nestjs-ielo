import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/api/professional/:professionalId')
@UseGuards(AuthGuard('jwt'))
export class GetProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async getProfessional(@Param('professionalId') professionalId: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
    })

    return { professional }
  }
}
