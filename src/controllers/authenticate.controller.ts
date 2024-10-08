import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user || !user.status) {
      throw new UnauthorizedException('Email ou senha inválido.')
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials do not match.')
    }

    const accessToken = this.jwt.sign({ sub: user.id, role: user.role })

    return {
      access_token: accessToken,
    }
  }
}
