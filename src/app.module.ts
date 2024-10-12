import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateAccountController } from './controllers/create-account.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from 'env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateProfessionalController } from './controllers/professionals/create-professional.controller'
import { ListProfessionalsController } from './controllers/professionals/list-professionals.controller'
import { CreatePatientController } from './controllers/patients/create-patients.controller'
import { ListPatientsController } from './controllers/patients/list-patients.controller'
import { AppointmentController } from './controllers/appointments/appointment.controller'
import { ListAppointmentsController } from './controllers/appointments/list-appointments.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateProfessionalController,
    ListProfessionalsController,
    CreatePatientController,
    ListPatientsController,
    AppointmentController,
    ListAppointmentsController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
