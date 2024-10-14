import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import request from 'supertest'

describe('Appointment (E2E)', () => {
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

  test('[POST]/appointments - JWT FAIL', async () => {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .send()
    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual('Unauthorized')
  })

  test('[POST]/appointments', async () => {
    const userOne = await prisma.user.create({
      data: {
        name: 'Fulano',
        email: 'fulano@example.com',
        password: '123456',
        role: 'profissional',
      },
    })

    const professional = await prisma.professional.create({
      data: {
        name: 'Fulano One',
        email: 'fulano@example.com',
        address: 'Teste endereço',
        birthDate: '2000-01-01T12:00:00.123Z',
        cpf: '022.773.210-36',
        description: ' test',
        fone: 'fake fone',
        register: 'fake register',
        specialty: 'Psicólogo',
        userId: userOne.id,
      },
    })

    const adulto = await prisma.patient.create({
      data: {
        name: 'Paciente Adulto',
        email: 'paciente@adulto.com',
        birthDate: '2000-01-01T12:00:00Z',
        cpf: '379.856.980-00',
        address: 'Endereço de teste',
        fone: '(55) 5555-5555',
        responsible: 'Paciente Adulto',
        parent: 'O Próprio',
        cpfResponsible: '379.856.980-00',
        payment: 'Particular',
      },
    })

    const crianca = await prisma.patient.create({
      data: {
        name: 'Paciente Criança',
        birthDate: '2010-01-01T12:00:00Z',
        address: 'Endereço de teste',
        fone: '(55) 5555-5555',
        responsible: 'Mãe do Paciente',
        parent: 'Mãe',
        cpfResponsible: '379.856.980-00',
        payment: 'Convênio-INAS',
      },
    })

    const responseSuccess = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        specialty: 'Psicoterapia',
        start: '2024-10-10T08:00:00Z',
        end: '2024-10-10T08:40:00Z',
        local: 'Consultório 01',
        payment: 'Convênio-INAS',
        value: 60.5,
        professionalId: professional.id,
        patientId: adulto.id,
      })

    expect(responseSuccess.statusCode).toBe(201)

    const resPatientSameTime = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        specialty: 'Psicoterapia',
        start: '2024-10-10T08:10:00Z',
        end: '2024-10-10T08:50:00Z',
        local: 'Consultório 01',
        payment: 'Convênio-INAS',
        value: 60.5,
        professionalId: professional.id,
        patientId: adulto.id,
      })
    expect(resPatientSameTime.statusCode).toBe(409)
    expect(resPatientSameTime.body.message).toEqual(
      'Paciente já tem atendimento agendado para este horário!',
    )
    const resProfessionalSameTime = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        specialty: 'Psicoterapia',
        start: '2024-10-10T08:30:00Z',
        end: '2024-10-10T09:15:00Z',
        local: 'Consultório 01',
        payment: 'Convênio-INAS',
        value: 60.5,
        professionalId: professional.id,
        patientId: crianca.id,
      })
    expect(resProfessionalSameTime.statusCode).toBe(409)
    expect(resProfessionalSameTime.body.message).toEqual(
      'Profissional já tem atendimento agendado para este horário!',
    )
  })
})
