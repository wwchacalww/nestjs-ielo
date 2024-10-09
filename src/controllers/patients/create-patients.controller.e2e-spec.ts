import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import request from 'supertest'

describe('Create Patient (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let prisma: PrismaService
  let accessToken: string
  let failToken: string

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
    failToken = jwt.sign({
      sub: 'd0b9ab25-fa8b-4191-a683-81fb4e054040',
      role: 'fake-role',
    })
    await app.init()
  })

  test('[POST]/patients - JWT FAIL', async () => {
    const response = await request(app.getHttpServer()).post('/patients').send({
      name: 'Paciente Adulto',
      email: 'paciente@adulto.com',
      birthDate: '2000-01-01',
      cpf: '379.856.980-00',
      address: 'Endereço de teste',
      fone: '(61) 3356-1492',
      responsible: 'Paciente Adulto',
      parent: 'O Próprio',
      cpfResponsible: '379.856.980-00',
      payment: 'Particular',
    })
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('Unauthorized')
  })

  test('[POST]/patients - NOT Authorized', async () => {
    const response = await request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', `Bearer ${failToken}`)
      .send({
        name: 'Paciente Adulto',
        email: 'paciente@adulto.com',
        birthDate: '2000-01-01',
        cpf: '379.856.980-00',
        address: 'Endereço de teste',
        fone: '(55) 5555-5555',
        responsible: 'Paciente Adulto',
        parent: 'O Próprio',
        cpfResponsible: '379.856.980-00',
        payment: 'Particular',
      })
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual(
      'Você não permissão para registrar um novo paciente!',
    )
  })

  test('[POST]/patients - JWT Success', async () => {
    const response = await request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Paciente Adulto',
        email: 'paciente@adulto.com',
        birthDate: '2000-01-01',
        cpf: '379.856.980-00',
        address: 'Endereço de teste',
        fone: '(55) 5555-5555',
        responsible: 'Paciente Adulto',
        parent: 'O Próprio',
        cpfResponsible: '379.856.980-00',
        payment: 'Particular',
      })
    expect(response.statusCode).toBe(201)
    const patientOnDB = await prisma.patient.findFirst({
      where: {
        email: 'paciente@adulto.com',
      },
    })
    expect(patientOnDB).toBeTruthy()
  })

  test('[POST]/patients - Validation Fail', async () => {
    const response = await request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Paciente Adulto',
        email: 'failEmail',
        birthDate: '01/01/2001',
        cpf: '555.555.555-55',
        address: 'Endereço de teste',
        fone: '(55) 5555-5555',
        responsible: 'Paciente Adulto',
        parent: 'O Próprio',
        cpfResponsible: '555.555.555-55',
        payment: 'Particular',
      })
    expect(response.statusCode).toBe(400)
    expect(response.body.errors.details[0].message).toEqual('Invalid date')
    expect(response.body.errors.details[1].message).toEqual('Invalid email')
    expect(response.body.errors.details[2].message).toEqual(
      'Digite um cpf válido.',
    )
  })
})
