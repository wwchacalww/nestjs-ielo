import { CurrentUser } from '@/auth/current-user.decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/api/profile/me')
@UseGuards(AuthGuard('jwt'))
export class GetProfileController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const { sub: profileId } = user

    const profile = await this.prisma.user.findUnique({
      where: { id: profileId },
      include: {
        Professional: true,
      },
    })

    const result = {
      id: profile?.id,
      name: profile?.name,
      email: profile?.email,
      role: profile?.role,
      status: profile?.status,
      Professional: profile?.Professional,
    }
    return { profile: result }
  }
}
