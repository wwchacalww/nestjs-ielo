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

const updateProfessionalBodySchema = z.object({
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
  register: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  description: z.string().optional().default(' '),
  status: z.boolean().optional().default(true),
})
const bodyValidationPipe = new ZodValidationPipe(updateProfessionalBodySchema)
type UpdateProfessionalBodySchema = z.infer<typeof updateProfessionalBodySchema>

@Controller('/api/professional')
@UseGuards(AuthGuard('jwt'))
export class UpdateProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Put()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: UpdateProfessionalBodySchema,
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
      specialty,
      register,
      description,
      status,
    } = body

    const professional = await this.prisma.professional.findUnique({
      where: { id },
    })
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado!')
    }
    const data = birthDate
      ? new Date(birthDate + 'T12:00:00.123Z')
      : professional.birthDate

    await this.prisma.professional.update({
      where: { id },
      data: {
        name: name ?? professional.name,
        email: email ?? professional.email,
        birthDate: data,
        cpf: cpf ?? professional.cpf,
        address: address ?? professional.address,
        fone: fone ?? professional.fone,
        register: register ?? professional.register,
        specialty: specialty ?? professional.specialty,
        description: description ?? professional.description,
        status: status ?? professional.status,
        updatedAt: new Date(),
      },
    })
  }
}
