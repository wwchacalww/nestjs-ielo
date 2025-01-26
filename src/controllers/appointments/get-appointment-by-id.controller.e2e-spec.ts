import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Get appointment by Id (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let profissionalToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    profissionalToken = jwt.sign(
      {
        sub: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
        role: 'profissional',
      },
      { expiresIn: '12h' },
    )

    const data = new Date('2000-01-01T12:00:00.123Z')

    await prisma.patient.createMany({
      data: [
        {
          id: '515a0a02-0320-4408-aa77-6d9636750688',
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
          id: 'a289ca33-0479-4965-a25c-510791644b48',
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

    const userOne = await prisma.user.create({
      data: {
        id: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
        name: 'Fulano',
        email: 'fulano@example.com',
        password: '123456',
        role: 'profissional',
      },
    })

    const pro = await prisma.professional.create({
      data: {
        id: '280b070b-9491-4e94-a39a-3d75052eb817',
        name: 'Profissional Um',
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
    })

    await prisma.appointment.createManyAndReturn({
      data: [
        {
          id: 1,
          start: '2025-01-16T07:00:00Z',
          end: '2025-01-16T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          id: 2,
          start: '2025-01-16T07:51:00Z',
          end: '2025-01-16T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          id: 3,
          start: '2025-01-23T07:00:00Z',
          end: '2025-01-23T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          id: 4,
          start: '2025-01-23T07:51:00Z',
          end: '2025-01-23T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          id: 5,
          start: '2025-02-16T07:00:00Z',
          end: '2025-02-16T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          id: 6,
          start: '2025-02-16T07:51:00Z',
          end: '2025-02-16T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          id: 7,
          start: '2025-02-23T07:00:00Z',
          end: '2025-02-23T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          id: 8,
          start: '2025-02-23T07:51:00Z',
          end: '2025-02-23T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
      ],
    })

    await app.init()
  })

  test('[GET] /api/appointments/show/:appoinmentId - profissional', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/appointments/show/6')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send()

    console.log(response.body)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        appointment: expect.objectContaining({
          id: 6,
          specialty: 'Psicoterapia',
          start: '2025-02-16T07:51:00.000Z',
          end: '2025-02-16T08:40:00.000Z',
          local: 'online',
          status: 'agendado',
          payment: 'Particular',
          value: '160',
        }),
      }),
    )
  })
})
