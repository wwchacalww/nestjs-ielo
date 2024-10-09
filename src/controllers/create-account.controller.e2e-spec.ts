import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import request from 'supertest'
import { PrismaService } from '@/prisma/prisma.service'

describe('Create account (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })
  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Fulano de Tal',
      email: 'fulano@example.com',
      password: 'password',
      role: 'role-test',
    })
    expect(response.statusCode).toBe(201)

    const useOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'fulano@example.com',
      },
    })

    expect(useOnDatabase).toBeTruthy()
  })

  test('[POST] /accounts - Failed', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Fulano de Tal',
      email: 'fulano',
      password: 'pass',
      role: 'role-test',
    })

    expect(response.statusCode).toBe(400)
    expect(response.body.errors.details[0].message).toEqual('Invalid email')
    expect(response.body.errors.details[1].message).toEqual(
      'A senha deve ter no mínimo 6 caracteres',
    )

    const useOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'fulano',
      },
    })

    expect(useOnDatabase).toBeFalsy()
  })
})
