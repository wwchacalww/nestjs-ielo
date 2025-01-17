import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('List patients (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let accessToken: string

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

    await app.init()
  })

  test('[GET] /patient/:id', async () => {
    const data = new Date('2000-01-01T12:00:00.123Z')

    await prisma.patient.createMany({
      data: [
        {
          id: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
          name: 'Paciente Adulto',
          email: 'paciente@adulto.com',
          birthDate: data,
          cpf: '379.856.980-00',
          address: 'Endereço de teste',
          fone: '(55) 5555-5555',
          responsible: 'Paciente Adulto',
          parent: 'O Próprio',
          cpfResponsible: '379.856.980-00',
          payment: 'Particular',
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Paciente Criança',
          birthDate: data,
          address: 'Endereço de teste',
          fone: '(55) 5555-5555',
          responsible: 'Mãe do Paciente',
          parent: 'Mãe',
          cpfResponsible: '379.856.980-00',
          payment: 'Convênio-INAS',
        },
      ],
    })
    const response = await request(app.getHttpServer())
      .get('/patient/123e4567-e89b-12d3-a456-426614174000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual({
      patient: expect.objectContaining({ name: 'Paciente Criança' }),
    })
  })
})