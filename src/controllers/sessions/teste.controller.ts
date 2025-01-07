import { Controller, Get } from '@nestjs/common'

@Controller('/teste')
export class TesteController {
  @Get()
  handle() {
    return { message: 'Hello World' }
  }
}
