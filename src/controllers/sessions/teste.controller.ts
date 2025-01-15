import { Controller, Get } from '@nestjs/common'

@Controller('/api/teste')
export class TesteController {
  @Get()
  handle() {
    return { message: 'Hello World' }
  }
}
