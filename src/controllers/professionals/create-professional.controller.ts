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
import { hash } from 'bcryptjs'

const createProfessionalBodySchema = z.object({
  name: z.string(),
  birthDate: z.string().date(),
  email: z.string().email(),
  cpf: z.string().refine((cpf: string) => {
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
  }, 'Digite um cpf válido.'),
  fone: z.string(),
  address: z.string(),
  register: z.string(),
  specialty: z.string(),
  description: z.string().optional().default(' '),
  status: z.boolean().optional().default(true),
})

const bodyValidationPipe = new ZodValidationPipe(createProfessionalBodySchema)
type CreateProfessionalBodySchema = z.infer<typeof createProfessionalBodySchema>

@Controller('/api/professionals')
@UseGuards(AuthGuard('jwt'))
export class CreateProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateProfessionalBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    // Permission role
    const can = ['admin', 'atendente', 'supervisora']
    if (!can.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não permissão para registrar um novo profissional!',
      )
    }
    const {
      name,
      email,
      birthDate,
      cpf,
      address,
      description,
      fone,
      register,
      specialty,
    } = body

    const professionalWithSameEmailorCPF =
      await this.prisma.professional.findFirst({
        where: {
          email,
          cpf,
        },
      })

    if (professionalWithSameEmailorCPF) {
      throw new ConflictException(
        'Profissional já cadastrado, confira o email ou cpf',
      )
    }

    const data = new Date(birthDate + 'T12:00:00.123Z')
    const hashedPassword = await hash(cpf, 8)

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'profissional',
      },
    })

    await this.prisma.professional.create({
      data: {
        name,
        email,
        birthDate: data,
        cpf,
        address,
        description,
        fone,
        register,
        specialty,
        userId: newUser.id,
      },
    })
  }
}
