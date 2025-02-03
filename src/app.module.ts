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
import { ListAppointmentsProfessionalController } from './controllers/appointments/list-appointments-professional.controller'
import { GetAppointmentById } from './controllers/appointments/get-appointment-by-id.controller'
import { RegisterProgressController } from './controllers/progress/register-progress.controller'
import { GetProgressByIdController } from './controllers/progress/get-progress-by-id.controller'
import { GetProgressPatientAndMonthController } from './controllers/progress/get-progress-by-patient-and-month.controller'
import { GetProgressByAppointmentIdController } from './controllers/progress/get-progress-by-appointment-id.controller'
import { ChangeStatusProgressController } from './controllers/progress/change-status-progress.controller'

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
    GetAppointmentById,
    ListAppointmentsController,
    ListAppointmentsProfessionalController,
    AlterAppointmentController,
    ChangeStatusAppointmentController,
    DeleteAppointmentController,
    RegisterProgressController,
    GetProgressPatientAndMonthController,
    GetProgressByAppointmentIdController,
    GetProgressByIdController,
    ChangeStatusProgressController,
    TesteController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
