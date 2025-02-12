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

const updatePatientBodySchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional().nullable(),
  birthDate: z.string().date().optional().nullable(),
  email: z.string().email().optional().nullable(),
  cpf: z
    .string()
    .refine((cpf: string) => {
      if (typeof cpf !== 'string') return false
      cpf = cpf.replace(/[^\d]+/g, '')
      if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
      const cpfDigits = cpf.split('').map((el) => +el)
      const rest = (count: number): number => {
        return (
          ((cpfDigits
            .slice(0, count - 12)
            .reduce((soma, el, index) => soma + el * (count - index), 0) *
            10) %
            11) %
          10
        )
      }
      return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10]
    }, 'Digite um cpf válido.')
    .optional()
    .nullable(),
  fone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  payment: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  parent: z.string().optional().nullable(),
  cpfResponsible: z.string().optional().nullable(),
  status: z.string().optional().default('Ativo').optional().nullable(),
})
const bodyValidationPipe = new ZodValidationPipe(updatePatientBodySchema)
type UpdatePatientBodySchema = z.infer<typeof updatePatientBodySchema>

@Controller('/api/patient')
@UseGuards(AuthGuard('jwt'))
export class UpdatePatientController {
  constructor(private prisma: PrismaService) {}

  @Put()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: UpdatePatientBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    // Permission role
    const can = ['admin', 'atendente', 'supervisora']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para alterar os dados de um paciente!',
      )
    }
    const {
      id,
      name,
      email,
      birthDate,
      cpf,
      address,
      fone,
      responsible,
      parent,
      cpfResponsible,
      payment,
      status,
    } = body

    const patient = await this.prisma.patient.findUnique({
      where: { id },
    })
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado!')
    }
    const data = birthDate
      ? new Date(birthDate + 'T12:00:00.123Z')
      : patient.birthDate

    await this.prisma.patient.update({
      where: { id },
      data: {
        name: name ?? patient.name,
        email: email ?? patient.email,
        birthDate: data,
        cpf: cpf ?? patient.cpf,
        address: address ?? patient.address,
        fone: fone ?? patient.fone,
        payment: payment ?? patient.payment,
        parent: parent ?? patient.parent,
        responsible: responsible ?? patient.responsible,
        cpfResponsible: cpfResponsible ?? patient.cpfResponsible,
        status: status ?? patient.status,
      },
    })
  }
}
