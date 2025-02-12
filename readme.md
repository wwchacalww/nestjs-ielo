## NESTJS - IELO
**Repositório com objetivo de criar uma api para um consultório**

  ### Banco de Dados
 - [X] Criar docker-compose com imagem do POSTGRES
 - [X] Instalar e configurar PRISMA no NESTJS
 - [X] Criar tabelas
 - [X] Criar serviço do Prisma no Nestjs

  ### Controllers
  - [X] Cria novas contas de usuário
  - [X] Gerando hash do password
  - [X] Criar pipe de validação de dados
  - [X] Configurar a authenticação
  - [X] Criar controller de Autheticação
  - [X] Protegendo rotas com guard
  - [X] Criando decorators de autenticação

  ### Perfil
  - [X] Controller de captura do perfil
  - [X] Trocar senha do usuário
  - [ ] Alterar status do usuário

  ### Profissionais
  - [X] Controller de registro de usuário e profissionais
  - [X] Controller listagem de profissionais com paginação
  - [X] Controller de edição de dados do profissional
  - [X] Configurar os testes
  - [X] Paginação

  ### Pacientes
  - [X] Controller de registro de pacientes
  - [X] Controller listagem de pacientes com paginação
  - [X] Controller listagem sem paginação
  - [X] Controller de edição de dados do paciente
  - [X] Configurar os testes
  - [X] Paginação
  - [X] Consultar paciente por id

  ### Agendamentos
  - [X] Controller de agendamento de pacientes
  - [X] Controller listagem de todos agendamentos
  - [X] Controller listagem de agendamentos do dia
  - [X] Controller listagem de agendamentos da Semana
  - [X] Controller listagem de todos agendamentos do Profissional
  - [X] Trocar a data do agendamento 
  - [X] Atualizar o status do agendamento
  - [X] Apagar o registro de uma agendamento
  - [X] Configurar os testes
  - [X] Consultar atendimento pelo Id

 ### Evoluções
  - [X] Controller de registro dos atendimentos do mês
  - [X] Controller de consulta do registro pelo id
  - [X] Controller de consulta do registro pelo paciente e o mês
  - [X] Controller de alteração do status
  - [X] Controller de geração de pdf da evolução pelo id

### Ajustes
 - [X] Adicionar o role de supervisora
 - [X] Ajustar os controllers de agendamentos
 - [X] Ajustar os controllers de pacientes
 - [X] Ajustar os controllers de profissionais
 - [X] Ajustar os controllers de evoluções

 ### Instruções
 - Crie e edite o arquivo .env com as variáveis de ambiente

 ```bash 
 # Clonar o repositório
 git clone www.github.com/wwchacalww/nestjs-ielo.git
 # Entrar na pasta do projeto
 cd nestjs-ielo
 # Instalar as dependências
 npm install
 # Executar o docker-compose
 docker-compose up -d
 # Executar o projeto
 npm run start:dev
 ```
