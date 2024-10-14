import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Change status appointment (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let atendenteToken: string
  let profissionalTwoToken: string
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

    profissionalTwoToken = jwt.sign({
      sub: '189697df-9929-433d-b6b4-29a19920f0d1',
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

    await prisma.user.createMany({
      data: [
        {
          id: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
          name: 'Psicoterapeuta Winnecotte',
          email: 'winnecotte@example.com',
          password: '123456',
          role: 'profissional',
        },
        {
          id: '189697df-9929-433d-b6b4-29a19920f0d1',
          name: 'Piscologa Lacan',
          email: 'lacan@example.com',
          password: '123456',
          role: 'profissional',
        },
      ],
    })

    await prisma.professional.createMany({
      data: [
        {
          id: '280b070b-9491-4e94-a39a-3d75052eb817',
          name: 'Psicoterapeuta Winnecotte',
          email: 'winnecotte@example.com',
          address: 'Teste endereço',
          birthDate: data,
          cpf: '022.773.210-36',
          description: ' test',
          fone: 'fake fone',
          register: 'fake register',
          specialty: 'Psicólogo',
          userId: 'fa5d3b41-51bb-448d-bd79-b01ba6a77b45',
        },
        {
          id: '288466a8-e16d-4552-912d-860f96ae2ade',
          name: 'Piscologa Lacan',
          email: 'lacan@example.com',
          address: 'Teste endereço',
          birthDate: data,
          cpf: '826.879.730-41',
          description: ' test',
          fone: 'fake fone',
          register: 'fake register',
          specialty: 'Psicólogo',
          userId: '189697df-9929-433d-b6b4-29a19920f0d1',
        },
      ],
    })

    await prisma.appointment.createManyAndReturn({
      data: [
        {
          id: 1,
          start: '2024-10-16T07:00:00Z',
          end: '2024-10-16T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: '280b070b-9491-4e94-a39a-3d75052eb817',
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          id: 2,
          start: '2024-10-16T07:51:00Z',
          end: '2024-10-16T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: '288466a8-e16d-4552-912d-860f96ae2ade',
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          id: 3,
          start: '2024-10-23T07:00:00Z',
          end: '2024-10-23T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: '280b070b-9491-4e94-a39a-3d75052eb817',
          patientId: 'a289ca33-0479-4965-a25c-510791644b48',
          status: 'agendado',
          value: 60,
        },
        {
          id: 4,
          start: '2024-10-23T07:51:00Z',
          end: '2024-10-23T08:40:00Z',
          local: 'online',
          payment: 'Particular',
          specialty: 'Psicoterapia',
          professionalId: '288466a8-e16d-4552-912d-860f96ae2ade',
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 160,
        },
        {
          id: 5,
          start: '2024-10-24T07:00:00Z',
          end: '2024-10-24T07:50:00Z',
          local: 'online',
          payment: 'Convênio-INAS',
          specialty: 'Psicoterapia',
          professionalId: '280b070b-9491-4e94-a39a-3d75052eb817',
          patientId: '515a0a02-0320-4408-aa77-6d9636750688',
          status: 'agendado',
          value: 60,
        },
      ],
    })

    await app.init()
  })

  test('[PUT] /appointments/change/status - Profissional - Fail', async () => {
    const response = await request(app.getHttpServer())
      .put('/appointments/change/status')
      .set('Authorization', `Bearer ${profissionalTwoToken}`)
      .send({
        id: 1,
        status: 'aguardando evolução',
      })

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toEqual(
      'Você só pode alterar os status do próprio atendimentos.',
    )
  })

  test('[PUT] /appointments/change/status - Profissional - Success', async () => {
    const response = await request(app.getHttpServer())
      .put('/appointments/change/status')
      .set('Authorization', `Bearer ${profissionalTwoToken}`)
      .send({
        id: 2,
        status: 'aguardando evolução',
      })

    const appAltered = await prisma.appointment.findUnique({ where: { id: 2 } })
    expect(response.statusCode).toBe(201)
    expect(appAltered?.status).toEqual('aguardando evolução')
  })

  test('[PUT] /appointments/change/status - Atendente - Status invalid', async () => {
    const response = await request(app.getHttpServer())
      .put('/appointments/alter')
      .set('Authorization', `Bearer ${atendenteToken}`)
      .send({
        id: 3,
        status: 'fail status',
      })
    expect(response.statusCode).toBe(400)
    expect(response.body.message).toEqual('Validation failed')
  })
})
