import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import {
  Body,
  Controller,
  HttpCode,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'

const changeMyPasswordBodySchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  newPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

const bodyValidationPipe = new ZodValidationPipe(changeMyPasswordBodySchema)
type ChangeMyPasswordBodySchema = z.infer<typeof changeMyPasswordBodySchema>

@Controller('/change/my/password')
@UseGuards(AuthGuard('jwt'))
export class ChangeMyPasswordController {
  constructor(private prisma: PrismaService) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: ChangeMyPasswordBodySchema,
    @CurrentUser() authicateUser: UserPayload,
  ) {
    const { sub: userId } = authicateUser
    const { password, newPassword } = body
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user || !user.status) {
      throw new UnauthorizedException('Usuário inválido.')
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Verifique a sua senha.')
    }

    const hashedPassword = await hash(newPassword, 8)

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    })
  }
}
