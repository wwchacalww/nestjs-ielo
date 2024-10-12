import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('List professionals (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let accessToken: string
  let failToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    accessToken = jwt.sign({
      sub: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
      role: 'atendente',
    })

    failToken = jwt.sign({
      sub: 'd0b9ab25-fa8b-4191-a683-81fb4e054040',
      role: 'fake-role',
    })
    // d0b9ab25-fa8b-4191-a683-81fb4e054040
    await app.init()
  })

  test('[GET] /professionals', async () => {
    const userOne = await prisma.user.create({
      data: {
        name: 'Fulano',
        email: 'fulano@example.com',
        password: '123456',
        role: 'profissional',
      },
    })
    const userTwo = await prisma.user.create({
      data: {
        name: 'Fulano Two',
        email: 'fulano2@example.com',
        password: '123456',
        role: 'profissional',
      },
    })
    const data = new Date('2000-01-01T12:00:00.123Z')

    await prisma.professional.createMany({
      data: [
        {
          name: 'Fulano One',
          email: 'fulano@example.com',
          address: 'Teste endereço',
          birthDate: data,
          cpf: '022.773.210-36',
          description: ' test',
          fone: 'fake fone',
          register: 'fake register',
          specialty: 'Psicólogo',
          userId: userOne.id,
        },
        {
          name: 'Fulano Two',
          email: 'fulano2@example.com',
          address: 'Teste endereço',
          birthDate: data,
          cpf: '807.017.890-69',
          description: ' test',
          fone: 'fake fone',
          register: 'fake register',
          specialty: 'Psicólogo',
          userId: userTwo.id,
        },
      ],
    })
    const response = await request(app.getHttpServer())
      .get('/professionals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual({
      professionals: [
        expect.objectContaining({ name: 'Fulano One' }),
        expect.objectContaining({ name: 'Fulano Two' }),
      ],
    })
  })

  test('[GET] /professionals', async () => {
    const response = await request(app.getHttpServer())
      .get('/professionals')
      .set('Authorization', `Bearer ${failToken}`)
      .send()

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual(
      'Você não permissão para acessar a lista de proficionais!',
    )
  })
})
