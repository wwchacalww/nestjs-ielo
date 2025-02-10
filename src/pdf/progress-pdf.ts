import { OutputProgress } from '@/controllers/progress/dto'
import { Injectable } from '@nestjs/common'
import { intlFormat } from 'date-fns'
import * as PDFKit from 'pdfkit'

@Injectable()
export class ProgressPDF {
  async generatePDF(progress: OutputProgress): Promise<Buffer> {
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const pdf = new PDFKit({
        size: 'A4',
        bufferPages: true,
      })

      // Logo
      let y = 25
      pdf.image('./src/pdf/assets/Logo.jpg', 25, y, { width: 90 })
      pdf.fontSize(16)
      pdf.font('Helvetica-Bold')
      let txt = 'Instituto Elo Terapêutico de Psicologia'
      pdf.text(txt, 125, y, { align: 'left', width: 450 })
      y += 20
      pdf.fontSize(10)
      pdf.font('Helvetica')
      txt =
        'Rua das Figueiras lote 07, 1º andar, loja 60 – Águas Claras/DF – CEP 71.906-750.'
      pdf.text(txt, 125, y, { align: 'left', width: 450 })
      y += 14
      txt = 'Telefone: (61) 9 9973-1541'
      pdf.text(txt, 125, y, { align: 'left', width: 450 })
      y += 14
      txt = 'E-mail: institutoeloterapeutico@gmail.com'
      pdf.text(txt, 125, y, { align: 'left', width: 450 })

      y += 20
      let yTxt = y + 6
      for (let i = 0; i <= 5; i++) {
        if (i === 0 || i === 3) {
          pdf.rect(20, y, 555, 20).fillAndStroke('#475569', '#000')
        } else {
          pdf.rect(20, y, 555, 20).stroke()
        }
        y += 20
      }

      pdf.fontSize(12)
      pdf.font('Helvetica-Bold')
      pdf.fillColor('#F1F5F9')
      txt = 'Paciente'
      pdf.text(txt, 20, yTxt, { align: 'center', width: 550 })
      yTxt += 20
      pdf.fillColor('#000')
      txt = 'Nome: '
      pdf.text(txt, 25, yTxt, { align: 'left', width: 550 })
      txt = 'Data de Nascimento: '
      pdf.text(txt, 330, yTxt, { align: 'left', width: 550 })
      pdf.font('Helvetica')
      txt = progress.patient.name
      pdf.text(txt, 65, yTxt, { align: 'left', width: 550 })

      const birthDate = intlFormat(
        progress.patient.birthDate,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          // weekday: 'long',
        },
        { locale: 'pt-BR' },
      )
      pdf.text(birthDate, 450, yTxt, { align: 'left', width: 550 })

      yTxt += 20
      pdf.font('Helvetica-Bold')
      txt = 'Telefone: '
      pdf.text(txt, 25, yTxt, { align: 'left', width: 550 })
      txt = 'Forma de pagamento: '
      pdf.text(txt, 220, yTxt, { align: 'left', width: 550 })
      pdf.font('Helvetica')
      pdf.text(progress.patient.fone, 80, yTxt, { align: 'left', width: 550 })
      pdf.text(progress.patient.payment, 350, yTxt, {
        align: 'left',
        width: 550,
      })

      yTxt += 20
      pdf.font('Helvetica-Bold')
      pdf.fillColor('#F1F5F9')
      txt = 'Psicóloga e Supervisora'
      pdf.text(txt, 20, yTxt, { align: 'center', width: 550 })
      yTxt += 20
      pdf.fillColor('#000')
      txt = 'Psicóloga:'
      pdf.text(txt, 25, yTxt, { align: 'left', width: 550 })
      txt = 'Registro: '
      pdf.text(txt, 415, yTxt, { align: 'left', width: 550 })
      pdf.font('Helvetica')
      txt = progress.professional.name
      pdf.text(txt, 90, yTxt, { align: 'left', width: 550 })
      txt = progress.professional.register
      pdf.text(txt, 470, yTxt, { align: 'left', width: 550 })
      yTxt += 20
      pdf.font('Helvetica-Bold')
      txt = 'Supervisora: '
      pdf.text(txt, 25, yTxt, { align: 'left', width: 550 })
      txt = 'Registro: '
      pdf.text(txt, 415, yTxt, { align: 'left', width: 550 })
      pdf.font('Helvetica')
      txt = progress.supervisor.name
      pdf.text(txt, 100, yTxt, { align: 'left', width: 550 })
      txt = progress.supervisor.register
      pdf.text(txt, 470, yTxt, { align: 'left', width: 550 })

      yTxt += 30
      pdf.font('Helvetica-Bold')
      pdf.fontSize(16)
      txt = 'REGISTRO DE ATENDIMENTOS'
      pdf.text(txt, 25, yTxt, { align: 'center', width: 550 })

      yTxt += 30
      pdf.y = yTxt
      pdf.fontSize(12)
      pdf.font('Helvetica')
      txt = '1 - Queixa principal e CID:'
      pdf.text(txt, { align: 'left', width: 550, lineGap: 10 })
      txt = '  ' + progress.progressData.majorComplaint
      pdf.text(txt, { align: 'left', width: 540, lineBreak: true, lineGap: 20 })
      txt = '2 - Procedimento Técnico e Científico:'
      pdf.text(txt, { align: 'left', width: 550, lineGap: 10 })
      txt = '  ' + progress.progressData.procedures
      pdf.text(txt, { align: 'left', width: 540, lineBreak: true, lineGap: 20 })
      txt = '3 - Evoluções:'
      pdf.text(txt, { align: 'left', width: 550, lineGap: 10 })
      progress.progressData.progress.forEach((progress) => {
        pdf.font('Helvetica-Bold')
        const appointmentDate = intlFormat(
          progress.appointmentDate,
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
          },
          { locale: 'pt-BR' },
        )
        pdf.text(appointmentDate, {
          align: 'right',
          width: 540,
          lineBreak: true,
          lineGap: 5,
        })
        pdf.font('Helvetica')
        txt = '     ' + progress.text
        pdf.text(txt, {
          align: 'left',
          width: 540,
          lineBreak: true,
          lineGap: 5,
        })
      })

      pdf.end()

      const buffer = []
      pdf.on('data', buffer.push.bind(buffer))
      pdf.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
    })

    return pdfBuffer
  }
}
