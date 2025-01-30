export type progressTextProps = {
  appointmentDate: string
  text: string
}

export type progressProps = {
  majorComplaint: string
  procedures: string
  progress: progressTextProps[]
}

export interface OutputProgress {
  id: string
  patientId: string
  professionalId: string
  supervisorId: string
  status: string
  createdAt: Date
  updatedAt?: Date | null
  patient: {
    name: string
    birthDate: string
    fone: string
    payment: string
  }
  professional: {
    name: string
    register: string
  }
  supervisor: {
    name: string
    register: string
  }
  progressData: progressProps
}
