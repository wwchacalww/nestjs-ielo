import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateAccountController } from './controllers/sessions/create-account.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from 'env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/sessions/authenticate.controller'
import { CreateProfessionalController } from './controllers/professionals/create-professional.controller'
import { ListProfessionalsController } from './controllers/professionals/list-professionals.controller'
import { CreatePatientController } from './controllers/patients/create-patients.controller'
import { ListPatientsController } from './controllers/patients/list-patients.controller'
import { AppointmentController } from './controllers/appointments/appointment.controller'
import { ListAppointmentsController } from './controllers/appointments/list-appointments.controller'
import { AlterAppointmentController } from './controllers/appointments/alter-appointment.controller'
import { ChangeStatusAppointmentController } from './controllers/appointments/change-status-appointment.controller'
import { DeleteAppointmentController } from './controllers/appointments/delete-appointment.controller'
import { TesteController } from './controllers/sessions/teste.controller'
import { GetProfileController } from './controllers/sessions/get-profile.controller'
import { ChangeMyPasswordController } from './controllers/sessions/change-my-password.controller'
import { GetPatientController } from './controllers/patients/get-patient.controller'

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
    ChangeMyPasswordController,
    GetProfileController,
    AuthenticateController,
    CreateProfessionalController,
    ListProfessionalsController,
    CreatePatientController,
    GetPatientController,
    ListPatientsController,
    AppointmentController,
    ListAppointmentsController,
    AlterAppointmentController,
    ChangeStatusAppointmentController,
    DeleteAppointmentController,
    TesteController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
