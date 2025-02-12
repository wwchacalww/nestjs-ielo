import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from 'src/auth/current-user.decorator'
import { UserPayload } from 'src/auth/jwt.strategy'

const createPatientBodySchema = z.object({
  name: z.string(),
  birthDate: z.string().date(),
  email: z.string().email().optional(),
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
  fone: z.string(),
  address: z.string(),
  payment: z.string(),
  responsible: z.string(),
  parent: z.string(),
  cpfResponsible: z.string().optional().nullable(),
  status: z.string().optional().default('Ativo'),
})

const bodyValidationPipe = new ZodValidationPipe(createPatientBodySchema)
type CreatePatientBodySchema = z.infer<typeof createPatientBodySchema>

@Controller('/api/patients')
@UseGuards(AuthGuard('jwt'))
export class CreatePatientController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreatePatientBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    // Permission role
    const can = ['admin', 'atendente', 'supervisora']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para registrar um novo paciente!',
      )
    }
    const {
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
    } = body

    const patientWithSameEmailorCPF = await this.prisma.patient.findFirst({
      where: {
        email,
        cpf,
      },
    })

    if (patientWithSameEmailorCPF) {
      throw new ConflictException(
        'Paciente já cadastrado, confira o email ou cpf',
      )
    }

    const data = new Date(birthDate + 'T12:00:00.123Z')

    await this.prisma.patient.create({
      data: {
        name,
        email,
        birthDate: data,
        cpf,
        address,
        fone,
        payment,
        parent,
        responsible,
        cpfResponsible,
      },
    })
  }
}
