import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/api/patient/:patientId')
@UseGuards(AuthGuard('jwt'))
export class GetPatientController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async getPatient(@Param('patientId') patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    })

    return { patient }
  }
}
