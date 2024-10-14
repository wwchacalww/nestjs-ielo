import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('List appointments (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let atendenteToken: string
  let profissionalToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    atendenteToken = jwt.sign({
      sub: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
      role: 'atendente',
    })

    profissionalToken = jwt.sign({
      sub: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
      role: 'profissional',
    })
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
          start: '2024-10-16T07:00:00Z',
          end: '2024-10-16T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          start: '2024-10-16T07:51:00Z',
          end: '2024-10-16T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          start: '2024-10-23T07:00:00Z',
          end: '2024-10-23T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          start: '2024-10-23T07:51:00Z',
          end: '2024-10-23T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          start: '2024-11-16T07:00:00Z',
          end: '2024-11-16T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          start: '2024-11-16T07:51:00Z',
          end: '2024-11-16T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          start: '2024-11-23T07:00:00Z',
          end: '2024-11-23T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: pro.id,
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          start: '2024-11-23T07:51:00Z',
          end: '2024-11-23T08:40:00Z',
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

  test('[GET] /appointments?range=mm&value=10 - profissional', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments?range=mm&value=10')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        address: 'Teste endereço',
        Appointment: [
          expect.objectContaining({
            patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          }),
          expect.objectContaining({
            patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          }),
          expect.objectContaining({
            patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          }),
          expect.objectContaining({
            patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          }),
        ],
      }),
    )
  })

  test('[GET] /appointments?range=wk&value=42 - profissional', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments?range=wk&value=42')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        address: 'Teste endereço',
        Appointment: [
          expect.objectContaining({
            patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          }),
          expect.objectContaining({
            patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          }),
        ],
      }),
    )
  })

  test('[GET] /appointments?range=patient&patId=uuid - profissional', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/appointments?range=patient&patId=a289ca33-0479-4965-a25c-510791644b48',
      )
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        address: 'Teste endereço',
        Appointment: [
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 3,
          }),
          expect.objectContaining({
            id: 5,
          }),
          expect.objectContaining({
            id: 7,
          }),
        ],
      }),
    )
  })

  test('[GET] /appointments?range=mm&value=10 - atendente', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments?range=mm&value=10')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([
      expect.objectContaining({ start: '2024-10-16T07:00:00.000Z' }),
      expect.objectContaining({ start: '2024-10-16T07:51:00.000Z' }),
      expect.objectContaining({ start: '2024-10-23T07:00:00.000Z' }),
      expect.objectContaining({ start: '2024-10-23T07:51:00.000Z' }),
    ])
  })
  test('[GET] /appointments?range=dd&value=290 - atendente', async () => {
    const response = await request(app.getHttpServer())
      .get('/appointments?range=dd&value=290')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send()
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([
      expect.objectContaining({ start: '2024-10-16T07:00:00.000Z' }),
      expect.objectContaining({ start: '2024-10-16T07:51:00.000Z' }),
    ])
  })
  test('[GET] /appointments?range=profissional&proId=uuid - atendente', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/appointments?range=profissional&proId=280b070b-9491-4e94-a39a-3d75052eb817',
      )
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send()
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        address: 'Teste endereço',
        Appointment: [
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 2,
          }),
          expect.objectContaining({
            id: 3,
          }),
          expect.objectContaining({
            id: 4,
          }),
          expect.objectContaining({
            id: 5,
          }),
          expect.objectContaining({
            id: 6,
          }),
          expect.objectContaining({
            id: 7,
          }),
          expect.objectContaining({
            id: 8,
          }),
        ],
      }),
    )
  })
  test('[GET] /appointments?range=patient&patId=uuid - atendente', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/appointments?range=patient&patId=a289ca33-0479-4965-a25c-510791644b48',
      )
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send()
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        address: 'Endereço de teste',
        Appointment: [
          expect.objectContaining({
            id: 1,
          }),

          expect.objectContaining({
            id: 3,
          }),

          expect.objectContaining({
            id: 5,
          }),

          expect.objectContaining({
            id: 7,
          }),
        ],
      }),
    )
  })
})
