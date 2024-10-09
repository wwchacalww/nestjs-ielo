import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import request from 'supertest'

describe('Create Professional (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let prisma: PrismaService
  let accessToken: string
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)

    accessToken = jwt.sign({
      sub: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
      role: 'admin',
    })
    await app.init()
  })

  test('[POST]/professionals - JWT FAIL', async () => {
    const response = await request(app.getHttpServer())
      .post('/professionals')
      .send({
        name: 'Fulano de Tal',
        email: 'fulano@gmail.com',
        birthDate: '1990-06-30',
        cpf: '022.773.210-36',
        address: 'Rua dos bobos número 3',
        description: 'teste',
        fone: '(55) 555-5555',
        register: 'CRP-555',
        specialty: 'Psicóloga',
      })
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('Unauthorized')
  })

  test('[POST]/professionals - JWT Success', async () => {
    const response = await request(app.getHttpServer())
      .post('/professionals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Fulano de Tal',
        email: 'fulano@gmail.com',
        birthDate: '1990-06-30',
        cpf: '022.773.210-36',
        address: 'Rua dos bobos número 3',
        description: 'teste',
        fone: '(55) 555-5555',
        register: 'CRP-555',
        specialty: 'Psicóloga',
      })
    expect(response.statusCode).toBe(201)
    const professionalOnDB = await prisma.professional.findUnique({
      where: {
        email: 'fulano@gmail.com',
      },
    })
    expect(professionalOnDB).toBeTruthy()
  })

  test('[POST]/professionals - Validation Fail', async () => {
    const response = await request(app.getHttpServer())
      .post('/professionals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Fulano de Tal',
        email: 'fulano',
        birthDate: '01/01/2001',
        cpf: 'cpfinvalido',
        address: 'Rua dos bobos número 3',
        description: 'teste',
        fone: '(55) 555-5555',
        register: 'CRP-555',
        specialty: 'Psicóloga',
      })
    expect(response.statusCode).toBe(400)
    expect(response.body.errors.details[0].message).toEqual('Invalid date')
    expect(response.body.errors.details[1].message).toEqual('Invalid email')
    expect(response.body.errors.details[2].message).toEqual(
      'Digite um cpf válido.',
    )
  })
})
