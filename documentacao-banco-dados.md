# FallsCar Enterprise - Documentação do Banco de Dados

## 1. DESCRIÇÃO DO MINIMUNDO

### 1.1 Contexto da Empresa
A **FallsCar Enterprise** é uma empresa de locação de veículos que opera em múltiplas cidades, oferecendo uma frota diversificada de veículos para atender diferentes perfis de clientes. A empresa necessita de um sistema de gestão integrado que permita controlar todas as operações de locação, desde a reserva até a devolução do veículo.

### 1.2 Descrição do Negócio
O sistema deve gerenciar:

- **Frota de Veículos**: Carros organizados por categorias (econômico, intermediário, SUV, luxo, etc.), cada uma com valores de diária específicos. Cada veículo possui atributos como modelo, placa, cor, ano, status atual (Livre, Alugado, Reservado, Manutenção) e localização na loja onde está disponível.

- **Clientes**: Pessoas físicas ou jurídicas que realizam locações. O sistema armazena dados cadastrais completos incluindo CPF/CNPJ, contato e endereço.

- **Locações (Reservas)**: Processo central do sistema onde um cliente reserva um veículo específico para um período determinado. A locação possui código único, datas de retirada e devolução prevista, valor total calculado, status de acompanhamento e pode incluir serviços extras.

- **Motoristas**: Profissionais opcionais que podem ser contratados junto com a locação para conduzir o veículo. Possuem dados de CNH, telefone, valor da diária e status de disponibilidade.

- **Serviços Extras**: Itens adicionais que podem ser contratados junto com a locação, como GPS, cadeira de bebê, proteção adicional, etc., cobrados por taxa única ou por dia.

- **Vistorias**: Inspeções realizadas na retirada e devolução do veículo, registrando quilometragem, nível do tanque, avarias existentes e observações.

- **Multas**: Registro de infrações de trânsito ocorridas durante o período de locação, com tipificação, valor e status de pagamento.

- **Avaliações**: Sistema de feedback onde clientes avaliam o veículo alugado após a conclusão da locação.

### 1.3 Processos de Negócio Principais

1. **Reserva de Veículo**: Cliente escolhe veículo → define datas → adiciona serviços extras → opta por motorista → sistema calcula valor total → confirmação da reserva.

2. **Retirada do Veículo**: Apresentação de documentos → vistoria de retirada → liberação do veículo → status muda para "Alugado".

3. **Devolução do Veículo**: Recebimento do veículo → vistoria de devolução → cálculo de possíveis multas ou danos → liberação do veículo para nova locação.

4. **Fechamento Financeiro**: Consolidação dos valores (diárias + serviços extras + multas) → pagamento → avaliação do cliente.

---

## 2. ENGENHARIA DE REQUISITOS

### 2.1 Levantamento de Requisitos - Questionários

#### Questionário para Clientes da Locadora

**Objetivo**: Compreender as necessidades e expectativas dos clientes ao alugar um veículo.

| Nº | Pergunta | Resposta |
|----|----------|----------|
| 1 | Qual sua idade? | ( ) 18-25 ( ) 26-35 ( ) 36-50 ( ) 51+ |
| 2 | Qual o principal motivo para alugar um veículo? | ( ) Viagem de lazer ( ) Trabalho/Negócios ( ) Evento especial ( ) Carro na oficina ( ) Outro: _______ |
| 3 | Qual tipo de veículo você mais aluga? | ( ) Econômico ( ) Sedan ( ) SUV ( ) Pick-up ( ) Luxo |
| 4 | Como prefere fazer a reserva? | ( ) Internet/Site ( ) Aplicativo ( ) Telefone ( ) Presencial na loja |
| 5 | Você já precisou adicionar serviços extras? | ( ) Sim ( ) Não |
| 5a | Se sim, quais? | ( ) GPS ( ) Cadeira de bebê ( ) Seguro adicional ( ) Motorista ( ) Outro: _______ |
| 6 | Qual meio de pagamento prefere usar? | ( ) Cartão de crédito ( ) Cartão de débito ( ) PIX ( ) Dinheiro |
| 7 | Você gostaria de avaliar o veículo após a devolução? | ( ) Sim ( ) Não |
| 8 | Qual informação é mais importante na hora da reserva? | ( ) Preço da diária ( ) Marca/modelo exato ( ) Local da retirada ( ) Disponibilidade imediata |
| 9 | Você já recebeu multas durante uma locação? | ( ) Sim ( ) Não |
| 10 | O que você sugere para melhorar o processo de locação? | [Campo de texto aberto] |

#### Questionário para Funcionários da Locadora

**Objetivo**: Entender os processos internos e dificuldades operacionais.

| Nº | Pergunta | Resposta |
|----|----------|----------|
| 1 | Qual seu cargo/função? | ( ) Atendente ( ) Gerente de loja ( ) Vistoriador ( ) Financeiro ( ) Outro: _______ |
| 2 | Quantas locações você processa por dia em média? | ( ) 1-5 ( ) 6-15 ( ) 16-30 ( ) 30+ |
| 3 | Qual sistema atualmente é usado para gerenciar locações? | ( ) Planilha Excel ( ) Sistema próprio ( ) Papel/ficha ( ) Nenhum |
| 4 | Quais dados você precisa cadastrar de um cliente? | [Campo de texto aberto] |
| 5 | Você faz vistoria no veículo na retirada e devolução? | ( ) Sim, apenas retirada ( ) Sim, apenas devolução ( ) Sim, ambas ( ) Não faz |
| 6 | O que você verifica na vistoria? | ( ) Quilometragem ( ) Tanque de combustível ( ) Avarias ( ) Documentos ( ) Limpeza |
| 7 | Como você consulta veículos disponíveis? | ( ) Lista impressa ( ) Planilha ( ) Sistema ( ) Verificação física |
| 8 | Você já teve problemas com reservas duplicadas? | ( ) Frequentemente ( ) Às vezes ( ) Raramente ( ) Nunca |
| 9 | Como é calculado o valor total da locação? | ( ) Manualmente ( ) Calculadora ( ) Sistema automático ( ) Tabela fixa |
| 10 | Quais relatórios você precisa emitir? | ( ) Faturamento ( ) Veículos alugados ( ) Multas pendentes ( ) Clientes inadimplentes ( ) Outros: _______ |
| 11 | Você trabalha com motoristas terceirizados? | ( ) Sim ( ) Não |
| 12 | Quais informações você mais precisa durante o atendimento? | [Campo de texto aberto] |

---

### 2.2 Levantamento de Requisitos - Entrevistas

#### Entrevista 1 - Gerente da Locadora

**Data**: 01/04/2025  
**Entrevistador**: Aluno A  
**Entrevistado**: João Silva, Gerente da FallsCar  
**Cargo**: Gerente Operacional  
**Local**: Sede da FallsCar

**Resumo da Entrevista**:

**Pergunta 1**: Como funciona atualmente o processo de reserva de um veículo?  
**Resposta**: "O cliente entra em contato por telefone ou WhatsApp, verificamos disponibilidade em uma planilha do Excel, se tiver disponível anotamos os dados do cliente num caderno e reservamos o carro. Isso gera muito problema de reserva duplicada quando dois atendentes atendem ao mesmo tempo."

**Pergunta 2**: Quais informações do cliente são essenciais para uma locação?  
**Resposta**: "Precisamos do nome completo, CPF ou CNPJ, telefone, e-mail e endereço. Para pessoa jurídica pedimos também a razão social. É importante guardar o histórico porque clientes frequentes pedem desconto e a gente precisa verificar se ele já alugou antes."

**Pergunta 3**: Como é feito o controle da frota de veículos?  
**Resposta**: "Temos carros de diferentes categorias: econômico, intermediário, SUV e luxo. Cada um tem um valor de diária diferente. Controlamos por planilha qual carro está em qual loja, se está alugado, livre ou em manutenção. Mas é difícil saber em tempo real."

**Pergunta 4**: Existe processo de vistoria?  
**Resposta**: "Sim, fazemos vistoria na retirada e na devolução. Anotamos a quilometragem, nível do tanque e se tem alguma avaria. Isso é importante para cobrar danos depois. Mas às vezes perdemos as fichas de vistoria."

**Pergunta 5**: Como funcionam os serviços extras?  
**Resposta**: "Oferecemos GPS, cadeira de bebê, seguro adicional e motorista. O motorista é terceirizado, cada um cobra uma diária diferente. Precisamos controlar quando o motorista está disponível ou ocupado."

**Pergunta 6**: Como vocês lidam com multas de trânsito?  
**Resposta**: "Quando chega uma multa, procuramos a locação correspondente pelo período da infração. Cobramos do cliente que estava com o carro naquele dia. Mas é difícil rastrear às vezes."

**Pergunta 7**: O que o senhor espera de um sistema novo?  
**Resposta**: "Preciso saber em tempo real quais carros estão disponíveis em cada loja. Quero emitir relatórios de faturamento mensal. E quero que o sistema calcule automaticamente o valor total incluindo diárias, serviços extras e multas. Também quero que os clientes possam avaliar os carros depois, isso ajuda a manter a frota boa."

**Requisitos identificados**:
- Cadastro de múltiplas lojas e cidades
- Controle de disponibilidade em tempo real
- Cadastro de veículos por categoria com valores de diária
- Processo de reserva com código único
- Vistorias de retirada e devolução
- Cadastro de serviços extras
- Cadastro de motoristas terceirizados
- Controle de multas vinculadas a locações
- Relatórios de faturamento
- Sistema de avaliações

---

#### Entrevista 2 - Cliente Frequente

**Data**: 03/04/2025  
**Entrevistador**: Aluno B  
**Entrevistado**: Maria Oliveira  
**Perfil**: Cliente frequente, aluga 2x por mês para viagens de trabalho

**Resumo da Entrevista**:

**Pergunta 1**: Com que frequência você aluga veículos?  
**Resposta**: "Alugo pelo menos duas vezes por mês para viajar a trabalho para outras cidades."

**Pergunta 2**: Quais informações você considera importantes no momento da reserva?  
**Resposta**: "Quero saber exatamente qual é o modelo do carro, não só a categoria. Já aconteceu de reservar 'SUV' e vir um modelo muito pequeno. Também quero saber onde posso retirar, se posso devolver em outra cidade, e o valor exsto antes de confirmar."

**Pergunta 3**: Você já teve problemas com devolução?  
**Resposta**: "Sim, uma vez fui cobrada por um arranhão que já estava no carro quando peguei. Não tinha como provar que não fui eu. Agora tiro fotos de tudo, mas seria melhor se a locadora tivesse registro oficial da vistoria."

**Pergunta 4**: Você usaria um site para fazer reservas?  
**Resposta**: "Com certeza! Hoje tenho que ligar durante o horário comercial. Um site ou app seria muito mais prático, principalmente para reservar fora do expediente."

**Pergunta 5**: Você gostaria de avaliar o carro depois?  
**Resposta**: "Sim, isso ajudaria outros clientes e também a locadora a manter os carros em bom estado. Às vezes pego carros muito rodados, seria bom saber antes pela avaliação de outros."

**Requisitos identificados**:
- Site/app para reservas online
- Informações detalhadas do veículo (modelo exato, imagens)
- Possibilidade de devolução em outra loja/cidade
- Sistema de vistoria registrado oficialmente
- Sistema de avaliações por clientes

---

#### Entrevista 3 - Vistoriador

**Data**: 05/04/2025  
**Entrevistador**: Aluno A  
**Entrevistado**: Carlos Santos  
**Cargo**: Vistoriador de Veículos

**Resumo da Entrevista**:

**Pergunta 1**: Descreva seu trabalho diário.  
**Resposta**: "Eu faço a vistoria dos carros na hora que o cliente vem buscar e quando ele devolve. Anoto a quilometragem, tanque, e marco se tem avarias. Às vezes o cliente reclama que uma avaria já existia, mas sem registro fica difícil."

**Pergunta 2**: Quais informações você registra?  
**Resposta**: "Registro KM inicial e final, nível do tanque (vazio, meio, cheio), se tem riscos, amassados, problema nos pneus. Tento ser o mais detalhado possível."

**Pergunta 3**: O que precisaria para melhorar o processo?  
**Resposta**: "Um sistema onde eu possa digitar essas informações e imprimir um laudo para o cliente assinar. Assim fica registrado oficialmente e evita confusão depois."

**Requisitos identificados**:
- Registro formal de vistorias
- Laudo impresso para assinatura do cliente
- Histórico de vistorias por veículo

---

### 2.3 Requisitos Funcionais Consolidados

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF01 | Cadastro de Cidades | O sistema deve permitir cadastrar cidades onde a empresa possui lojas (nome e UF). |
| RF02 | Cadastro de Lojas | O sistema deve permitir cadastrar lojas associadas a cidades, com nome e status de ativo/inativo. |
| RF03 | Cadastro de Categorias | O sistema deve permitir criar categorias de veículos com nome, descrição e valor de diária. |
| RF04 | Cadastro de Veículos | O sistema deve permitir cadastrar veículos com modelo, placa (única), cor, ano, status, imagem, categoria e loja atual. |
| RF05 | Cadastro de Clientes | O sistema deve permitir cadastrar clientes com nome, CPF/CNPJ (único), email, telefone e endereço. |
| RF06 | Cadastro de Motoristas | O sistema deve permitir cadastrar motoristas com nome, CPF (único), CNH (único), telefone, valor diária e status. |
| RF07 | Cadastro de Serviços Extras | O sistema deve permitir cadastrar serviços adicionais com nome, valor unitário, tipo de cobrança (única ou por dia) e status. |
| RF08 | Criar Locação | O sistema deve permitir criar uma locação vinculando cliente, veículo, loja de retirada, datas, período em dias, motorista opcional, serviços extras e calcular valor total automaticamente. |
| RF09 | Gerenciar Status de Locação | O sistema deve permitir alterar status da locação (Ativa, Concluída, Cancelada, Atrasada) com atualização automática do veículo. |
| RF10 | Registrar Vistorias | O sistema deve permitir registrar vistorias na retirada e devolução com quilometragem, nível do tanque e avarias. |
| RF11 | Registrar Multas | O sistema deve permitir registrar multas vinculadas a locações com tipo, data, valor e status de pagamento. |
| RF12 | Registrar Avaliações | O sistema deve permitir que clientes avaliem veículos após conclusão da locação (nota 1-5 e comentário). |
| RF13 | Consultar Veículos Disponíveis | O sistema deve permitir consultar veículos livres por cidade/categoria para reserva. |
| RF14 | Relatório de Faturamento | O sistema deve gerar relatório mensal de faturamento por período. |
| RF15 | Logs de Auditoria | O sistema deve registrar logs automáticos de ações importantes (reservas, conclusões). |

### 2.2 Requisitos Não-Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF01 | Banco de Dados | Utilizar MySQL como SGBD principal. |
| RNF02 | Charset | Suportar UTF-8 para caracteres especiais (acentos). |
| RNF03 | Engine | Utilizar InnoDB para suporte a transações e integridade referencial. |
| RNF04 | UUID | Utilizar UUID (CHAR(36)) como chave primária de todas as tabelas. |
| RNF05 | Índices | Criar índices em campos frequentemente pesquisados (status, datas, códigos). |
| RNF06 | Integridade Referencial | Implementar foreign keys com ações ON DELETE RESTRICT e ON DELETE CASCADE apropriadas. |
| RNF07 | Triggers | Utilizar triggers para automatizar atualizações de status e auditoria. |
| RNF08 | Views | Criar views para simplificar consultas complexas e relatórios. |

### 2.3 Regras de Negócio

| ID | Regra |
|----|-------|
| RN01 | A placa do veículo deve ser única no sistema. |
| RN02 | O CPF/CNPJ do cliente deve ser único no sistema. |
| RN03 | O CPF e CNH do motorista devem ser únicos no sistema. |
| RN04 | O código da reserva deve ser único e gerado automaticamente. |
| RN05 | A nota de avaliação deve estar entre 1 e 5. |
| RN06 | Cada locação pode ter apenas uma avaliação. |
| RN07 | Ao criar uma locação, o veículo deve ter status alterado automaticamente para "Reservado". |
| RN08 | Ao concluir uma locação, o veículo deve ter status alterado automaticamente para "Livre". |
| RN09 | Se houver motorista na locação, seu status deve ser alterado para "Ocupado". |
| RN10 | O período em dias deve ser calculado automaticamente baseado nas datas. |
| RN11 | O valor total deve incluir diárias do veículo, motorista (se aplicável) e serviços extras. |

---

## 3. MODELO CONCEITUAL DE BANCO DE DADOS (MER)

### 3.1 Ferramenta de Modelagem

Para o desenvolvimento da modelagem conceitual e lógica do banco de dados foi utilizada a ferramenta **BrModelo** (versão 3.0 ou superior).

**BrModelo** é uma ferramenta CASE (Computer-Aided Software Engineering) desenvolvida especificamente para modelagem de bancos de dados relacionais, que permite:

- Criação de Diagramas Entidade-Relacionamento (DER/MER)
- Definição de entidades, atributos e relacionamentos
- Cardinalidade e participação
- Transformação automática para modelo lógico relacional
- Geração de script SQL para diferentes SGBDs (MySQL, PostgreSQL, Oracle, etc.)

**Por que BrModelo foi escolhido**:
- Interface simples e intuitiva
- Suporte completo à notação Peter Chen para MER
- Conversão automatizada de conceitual para lógico
- Geração de código SQL compatível com MySQL
- Ferramenta gratuita e amplamente utilizada em instituições de ensino brasileiras

### 3.2 Entidades e Atributos

**CIDADES** (Entidade de Localização)
- id (PK, UUID)
- nome
- uf

**LOJAS** (Entidade de Negócio)
- id (PK, UUID)
- nome
- cidade_id (FK)
- ativo

**CATEGORIAS_VEICULO** (Entidade de Classificação)
- id (PK, UUID)
- nome
- descricao
- valor_diaria

**VEICULOS** (Entidade Central)
- id (PK, UUID)
- modelo
- placa (único)
- cor
- ano
- status (enum)
- imagem_url
- categoria_id (FK)
- loja_atual_id (FK)

**CLIENTES** (Entidade de Pessoa)
- id (PK, UUID)
- nome
- cpf_cnpj (único)
- email
- telefone
- endereco

**CLIENT_PROFILES** (Entidade Auxiliar)
- id (PK, UUID)
- user_id (FK)
- nome
- cpf_cnpj
- telefone

**MOTORISTAS** (Entidade de Recurso)
- id (PK, UUID)
- nome
- cpf (único)
- cnh (único)
- telefone
- valor_diaria
- status (enum)

**SERVICOS_EXTRA** (Entidade de Serviço)
- id (PK, UUID)
- nome
- valor_unitario
- tipo_cobranca (enum)
- ativo

**LOCACOES** (Entidade Central - Processo Principal)
- id (PK, UUID)
- codigo_reserva (único)
- cliente_id (FK)
- veiculo_id (FK)
- loja_retirada_id (FK)
- motorista_id (FK, opcional)
- user_id (opcional)
- data_reserva
- data_retirada
- data_devolucao_prevista
- data_devolucao_real
- periodo_dias
- com_motorista
- valor_total
- status (enum)
- observacoes

**LOCACOES_ITENS** (Entidade Associativa)
- id (PK, UUID)
- locacao_id (FK)
- servico_id (FK)
- quantidade
- valor_total_item

**VISTORIAS** (Entidade de Registro)
- id (PK, UUID)
- locacao_id (FK)
- veiculo_id (FK)
- fase (enum: Retirada/Devolução)
- data_vistoria
- quilometragem
- nivel_tanque (enum)
- tem_avarias
- observacoes
- responsavel_vistoria

**TIPOS_MULTA** (Entidade de Classificação)
- id (PK, UUID)
- descricao
- valor_referencia
- gravidade (enum)

**MULTAS** (Entidade de Ocorrência)
- id (PK, UUID)
- locacao_id (FK)
- tipo_multa_id (FK)
- data_infracao
- valor_cobrado
- status_pagamento (enum)
- observacoes

**AVALIACOES_VEICULOS** (Entidade de Feedback)
- id (PK, UUID)
- veiculo_id (FK)
- cliente_id (FK)
- locacao_id (FK)
- nota (1-5)
- comentario

**LOGS_SISTEMA** (Entidade de Auditoria)
- id (PK, UUID)
- usuario
- acao
- descricao
- data_ocorrencia

### 3.3 Relacionamentos

| Entidade 1 | Cardinalidade | Entidade 2 | Descrição |
|------------|---------------|------------|-----------|
| CIDADES | 1:N | LOJAS | Uma cidade possui várias lojas |
| LOJAS | 1:N | VEICULOS | Uma loja possui vários veículos |
| CATEGORIAS_VEICULO | 1:N | VEICULOS | Uma categoria possui vários veículos |
| CLIENTES | 1:N | LOCACOES | Um cliente pode ter várias locações |
| VEICULOS | 1:N | LOCACOES | Um veículo pode ter várias locações |
| LOJAS | 1:N | LOCACOES | Uma loja pode ter várias locações (retirada) |
| MOTORISTAS | 1:N | LOCACOES | Um motorista pode participar de várias locações |
| LOCACOES | 1:N | LOCACOES_ITENS | Uma locação possui vários itens de serviço |
| SERVICOS_EXTRA | 1:N | LOCACOES_ITENS | Um serviço pode estar em várias locações |
| LOCACOES | 1:N | VISTORIAS | Uma locação possui vistorias de retirada/devolução |
| VEICULOS | 1:N | VISTORIAS | Um veículo pode ter várias vistorias |
| LOCACOES | 1:N | MULTAS | Uma locação pode ter várias multas |
| TIPOS_MULTA | 1:N | MULTAS | Um tipo de multa pode ter várias ocorrências |
| VEICULOS | 1:N | AVALIACOES_VEICULOS | Um veículo pode ter várias avaliações |
| CLIENTES | 1:N | AVALIACOES_VEICULOS | Um cliente pode fazer várias avaliações |
| LOCACOES | 1:1 | AVALIACOES_VEICULOS | Uma locação gera no máximo uma avaliação |

### 3.4 Diagrama ER (Textual)

```
+----------------+       +----------------+       +------------------+
|    CIDADES     |1     N|     LOJAS      |1     N|     VEICULOS     |
|----------------|<>-----|----------------|<>-----|------------------|
| PK id          |       | PK id          |       | PK id            |
| nome           |       | nome           |       | modelo           |
| uf             |       | FK cidade_id   |       | placa (UQ)       |
+----------------+       | ativo          |       | cor              |
                         +----------------+       | ano              |
                                                   | status           |
                                                   | FK categoria_id  |
                                                   | FK loja_atual_id |
                                                   +------------------+
                                                            |1
                                                            |
                                                            |N
+----------------+       +----------------+       +------------------+
|   CATEGORIAS   |1     N|    CLIENTES    |1     N|     LOCACOES     |
|----------------|<>-----|----------------|<>-----|------------------|
| PK id          |       | PK id          |       | PK id            |
| nome           |       | nome           |       | codigo_reserva   |
| valor_diaria   |       | cpf_cnpj (UQ)  |       | FK cliente_id    |
+----------------+       | email          |       | FK veiculo_id    |
                         | telefone       |       | FK loja_retirada |
                         +----------------+       | FK motorista_id  |
                                                   | periodo_dias     |
                                                   | valor_total      |
                                                   | status           |
                                                   +------------------+
                                                            |1
                                                            |
                                       +--------------------+--------------------+
                                       |1                                       |1
                                       |                                       |
                                       N                                       N
                          +--------------------+                     +-------------------+
                          |  LOCACOES_ITENS    |                     |    VISTORIAS      |
                          |--------------------|                     |-------------------|
                          | PK id              |                     | PK id             |
                          | FK locacao_id      |                     | FK locacao_id     |
                          | FK servico_id      |                     | FK veiculo_id     |
                          | quantidade         |                     | fase              |
                          | valor_total_item   |                     | quilometragem     |
                          +--------------------+                     | tem_avarias     |
                                                                       +-------------------+

                          +--------------------+                     +-------------------+
                          |  SERVICOS_EXTRA    |                     |     MULTAS        |
                          |--------------------|                     |-------------------|
                          | PK id              |                     | PK id             |
                          | nome               |                     | FK locacao_id     |
                          | valor_unitario     |                     | FK tipo_multa_id  |
                          | tipo_cobranca      |                     | valor_cobrado     |
                          +--------------------+                     | status_pagamento  |
                                                                       +-------------------+

                          +--------------------+                     +-------------------+
                          |   TIPOS_MULTA      |                     |  AVALIACOES_      |
                          |--------------------|                     |  VEICULOS         |
                          | PK id              |                     |-------------------|
                          | descricao          |                     | PK id             |
                          | gravidade          |                     | FK veiculo_id     |
                          +--------------------+                     | FK cliente_id     |
                                                                       | FK locacao_id (UQ)|
                                                                       | nota (1-5)        |
                                                                       +-------------------+

                          +--------------------+
                          |   MOTORISTAS       |
                          |--------------------|
                          | PK id              |
                          | nome               |
                          | cpf (UQ)           |
                          | cnh (UQ)           |
                          | valor_diaria       |
                          | status             |
                          +--------------------+
```

---

## 4. MODELO LÓGICO RELACIONAL

### 4.1 Esquema Relacional

```
CIDADES (<u>id</u>, nome, uf, created_at)

LOJAS (<u>id</u>, nome, cidade_id → CIDADES, ativo, created_at)
    FK: cidade_id REFERENCES CIDADES(id) ON DELETE RESTRICT

CATEGORIAS_VEICULO (<u>id</u>, nome, descricao, valor_diaria, created_at)

VEICULOS (<u>id</u>, modelo, placa, cor, ano, status, imagem_url, 
          categoria_id → CATEGORIAS_VEICULO, loja_atual_id → LOJAS, created_at)
    FK: categoria_id REFERENCES CATEGORIAS_VEICULO(id) ON DELETE RESTRICT
    FK: loja_atual_id REFERENCES LOJAS(id) ON DELETE RESTRICT
    UQ: placa

CLIENTES (<u>id</u>, nome, cpf_cnpj, email, telefone, endereco, created_at)
    UQ: cpf_cnpj

CLIENT_PROFILES (<u>id</u>, user_id, nome, cpf_cnpj, telefone, created_at)
    UQ: user_id

MOTORISTAS (<u>id</u>, nome, cpf, cnh, telefone, valor_diaria, status, created_at)
    UQ: cpf
    UQ: cnh

SERVICOS_EXTRA (<u>id</u>, nome, valor_unitario, tipo_cobranca, ativo, created_at)

LOCACOES (<u>id</u>, codigo_reserva, cliente_id → CLIENTES, veiculo_id → VEICULOS,
          loja_retirada_id → LOJAS, motorista_id → MOTORISTAS, user_id,
          data_reserva, data_retirada, data_devolucao_prevista, 
          data_devolucao_real, periodo_dias, com_motorista, valor_total, 
          status, observacoes, created_at)
    FK: cliente_id REFERENCES CLIENTES(id) ON DELETE RESTRICT
    FK: veiculo_id REFERENCES VEICULOS(id) ON DELETE RESTRICT
    FK: loja_retirada_id REFERENCES LOJAS(id) ON DELETE RESTRICT
    FK: motorista_id REFERENCES MOTORISTAS(id) ON DELETE SET NULL
    UQ: codigo_reserva

LOCACOES_ITENS (<u>id</u>, locacao_id → LOCACOES, servico_id → SERVICOS_EXTRA,
               quantidade, valor_total_item, created_at)
    FK: locacao_id REFERENCES LOCACOES(id) ON DELETE CASCADE
    FK: servico_id REFERENCES SERVICOS_EXTRA(id) ON DELETE RESTRICT

VISTORIAS (<u>id</u>, locacao_id → LOCACOES, veiculo_id → VEICULOS,
          fase, data_vistoria, quilometragem, nivel_tanque, tem_avarias,
          observacoes, responsavel_vistoria, created_at)
    FK: locacao_id REFERENCES LOCACOES(id) ON DELETE CASCADE
    FK: veiculo_id REFERENCES VEICULOS(id) ON DELETE RESTRICT

TIPOS_MULTA (<u>id</u>, descricao, valor_referencia, gravidade, created_at)

MULTAS (<u>id</u>, locacao_id → LOCACOES, tipo_multa_id → TIPOS_MULTA,
       data_infracao, valor_cobrado, status_pagamento, observacoes, created_at)
    FK: locacao_id REFERENCES LOCACOES(id) ON DELETE CASCADE
    FK: tipo_multa_id REFERENCES TIPOS_MULTA(id) ON DELETE RESTRICT

AVALIACOES_VEICULOS (<u>id</u>, veiculo_id → VEICULOS, cliente_id → CLIENTES,
                   locacao_id → LOCACOES, nota, comentario, created_at)
    FK: veiculo_id REFERENCES VEICULOS(id) ON DELETE CASCADE
    FK: cliente_id REFERENCES CLIENTES(id) ON DELETE CASCADE
    FK: locacao_id REFERENCES LOCACOES(id) ON DELETE CASCADE
    UQ: locacao_id
    CK: nota >= 1 AND nota <= 5

LOGS_SISTEMA (<u>id</u>, usuario, acao, descricao, data_ocorrencia)
```

### 4.2 Dicionário de Dados

| Tabela | Campo | Tipo | Tamanho | Obrigatório | Descrição |
|--------|-------|------|---------|-------------|-----------|
| **CIDADES** | id | CHAR | 36 | Sim | UUID da cidade |
| | nome | VARCHAR | 100 | Sim | Nome da cidade |
| | uf | CHAR | 2 | Sim | Sigla do estado |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **LOJAS** | id | CHAR | 36 | Sim | UUID da loja |
| | nome | VARCHAR | 150 | Sim | Nome da loja |
| | cidade_id | CHAR | 36 | Sim | FK para cidade |
| | ativo | BOOLEAN | - | Não | Status da loja |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **CATEGORIAS_VEICULO** | id | CHAR | 36 | Sim | UUID da categoria |
| | nome | VARCHAR | 100 | Sim | Nome da categoria |
| | descricao | TEXT | - | Não | Descrição detalhada |
| | valor_diaria | DECIMAL | 10,2 | Sim | Valor da diária |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **VEICULOS** | id | CHAR | 36 | Sim | UUID do veículo |
| | modelo | VARCHAR | 100 | Sim | Modelo do veículo |
| | placa | VARCHAR | 10 | Sim | Placa (única) |
| | cor | VARCHAR | 50 | Não | Cor do veículo |
| | ano | INT | - | Não | Ano de fabricação |
| | status | ENUM | - | Não | Livre/Alugado/Reservado/Manutencao |
| | imagem_url | TEXT | - | Não | URL da imagem |
| | categoria_id | CHAR | 36 | Sim | FK para categoria |
| | loja_atual_id | CHAR | 36 | Sim | FK para loja atual |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **CLIENTES** | id | CHAR | 36 | Sim | UUID do cliente |
| | nome | VARCHAR | 150 | Sim | Nome completo |
| | cpf_cnpj | VARCHAR | 18 | Sim | CPF/CNPJ (único) |
| | email | VARCHAR | 150 | Não | Email de contato |
| | telefone | VARCHAR | 20 | Não | Telefone |
| | endereco | TEXT | - | Não | Endereço completo |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **MOTORISTAS** | id | CHAR | 36 | Sim | UUID do motorista |
| | nome | VARCHAR | 150 | Sim | Nome completo |
| | cpf | VARCHAR | 14 | Sim | CPF (único) |
| | cnh | VARCHAR | 20 | Sim | CNH (única) |
| | telefone | VARCHAR | 20 | Não | Telefone |
| | valor_diaria | DECIMAL | 10,2 | Não | Valor da diária |
| | status | ENUM | - | Não | Disponivel/Ocupado/Ferias/Inativo |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **SERVICOS_EXTRA** | id | CHAR | 36 | Sim | UUID do serviço |
| | nome | VARCHAR | 100 | Sim | Nome do serviço |
| | valor_unitario | DECIMAL | 10,2 | Sim | Valor unitário |
| | tipo_cobranca | ENUM | - | Não | Taxa Unica/Por Dia |
| | ativo | BOOLEAN | - | Não | Status do serviço |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **LOCACOES** | id | CHAR | 36 | Sim | UUID da locação |
| | codigo_reserva | VARCHAR | 20 | Sim | Código único da reserva |
| | cliente_id | CHAR | 36 | Sim | FK para cliente |
| | veiculo_id | CHAR | 36 | Sim | FK para veículo |
| | loja_retirada_id | CHAR | 36 | Sim | FK para loja de retirada |
| | motorista_id | CHAR | 36 | Não | FK para motorista (opcional) |
| | user_id | CHAR | 36 | Não | ID do usuário sistema |
| | data_reserva | TIMESTAMP | - | Não | Data/hora da reserva |
| | data_retirada | DATE | - | Sim | Data de retirada |
| | data_devolucao_prevista | DATE | - | Sim | Data prevista de devolução |
| | data_devolucao_real | DATE | - | Não | Data real de devolução |
| | periodo_dias | INT | - | Sim | Quantidade de dias |
| | com_motorista | BOOLEAN | - | Não | Se inclui motorista |
| | valor_total | DECIMAL | 12,2 | Sim | Valor total calculado |
| | status | ENUM | - | Não | Ativa/Concluida/Cancelada/Atrasada |
| | observacoes | TEXT | - | Não | Observações gerais |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **LOCACOES_ITENS** | id | CHAR | 36 | Sim | UUID do item |
| | locacao_id | CHAR | 36 | Sim | FK para locação |
| | servico_id | CHAR | 36 | Sim | FK para serviço |
| | quantidade | INT | - | Não | Quantidade |
| | valor_total_item | DECIMAL | 10,2 | Sim | Valor total do item |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **VISTORIAS** | id | CHAR | 36 | Sim | UUID da vistoria |
| | locacao_id | CHAR | 36 | Sim | FK para locação |
| | veiculo_id | CHAR | 36 | Sim | FK para veículo |
| | fase | ENUM | - | Sim | Retirada/Devolucao |
| | data_vistoria | TIMESTAMP | - | Não | Data/hora da vistoria |
| | quilometragem | INT | - | Sim | Quilometragem registrada |
| | nivel_tanque | ENUM | - | Sim | Vazio/1/4/1/2/3/4/Cheio |
| | tem_avarias | BOOLEAN | - | Não | Se há avarias |
| | observacoes | TEXT | - | Não | Observações |
| | responsavel_vistoria | VARCHAR | 100 | Não | Nome do responsável |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **TIPOS_MULTA** | id | CHAR | 36 | Sim | UUID do tipo |
| | descricao | VARCHAR | 200 | Sim | Descrição da infração |
| | valor_referencia | DECIMAL | 10,2 | Não | Valor de referência |
| | gravidade | ENUM | - | Não | Leve/Media/Grave/Gravissima/Contratual |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **MULTAS** | id | CHAR | 36 | Sim | UUID da multa |
| | locacao_id | CHAR | 36 | Sim | FK para locação |
| | tipo_multa_id | CHAR | 36 | Sim | FK para tipo de multa |
| | data_infracao | TIMESTAMP | - | Não | Data/hora da infração |
| | valor_cobrado | DECIMAL | 10,2 | Sim | Valor cobrado |
| | status_pagamento | ENUM | - | Não | Pendente/Pago/Contestado |
| | observacoes | TEXT | - | Não | Observações |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **AVALIACOES_VEICULOS** | id | CHAR | 36 | Sim | UUID da avaliação |
| | veiculo_id | CHAR | 36 | Sim | FK para veículo |
| | cliente_id | CHAR | 36 | Sim | FK para cliente |
| | locacao_id | CHAR | 36 | Sim | FK para locação (única) |
| | nota | INT | - | Sim | Nota de 1 a 5 |
| | comentario | TEXT | - | Não | Comentário do cliente |
| | created_at | TIMESTAMP | - | Não | Data de criação |
| **LOGS_SISTEMA** | id | CHAR | 36 | Sim | UUID do log |
| | usuario | VARCHAR | 100 | Não | Usuário que executou ação |
| | acao | VARCHAR | 100 | Não | Tipo de ação |
| | descricao | TEXT | - | Não | Descrição detalhada |
| | data_ocorrencia | TIMESTAMP | - | Não | Data/hora do evento |

### 4.3 Índices Definidos

| Tabela | Índice | Campos | Tipo |
|--------|--------|--------|------|
| CIDADES | idx_cidades_uf | uf | B-tree |
| CIDADES | idx_cidades_nome | nome | B-tree |
| LOJAS | idx_lojas_cidade | cidade_id | B-tree |
| LOJAS | idx_lojas_ativo | ativo | B-tree |
| CATEGORIAS_VEICULO | idx_categorias_nome | nome | B-tree |
| VEICULOS | idx_veiculos_status | status | B-tree |
| VEICULOS | idx_veiculos_categoria | categoria_id | B-tree |
| VEICULOS | idx_veiculos_loja | loja_atual_id | B-tree |
| VEICULOS | idx_veiculos_placa | placa | B-tree |
| CLIENTES | idx_clientes_cpf | cpf_cnpj | B-tree |
| CLIENTES | idx_clientes_email | email | B-tree |
| CLIENT_PROFILES | idx_client_profiles_user | user_id | B-tree |
| MOTORISTAS | idx_motoristas_status | status | B-tree |
| MOTORISTAS | idx_motoristas_cpf | cpf | B-tree |
| SERVICOS_EXTRA | idx_servicos_ativo | ativo | B-tree |
| LOCACOES | idx_locacoes_codigo | codigo_reserva | B-tree |
| LOCACOES | idx_locacoes_cliente | cliente_id | B-tree |
| LOCACOES | idx_locacoes_veiculo | veiculo_id | B-tree |
| LOCACOES | idx_locacoes_status | status | B-tree |
| LOCACOES | idx_locacoes_data_retirada | data_retirada | B-tree |
| LOCACOES | idx_locacoes_data_devolucao | data_devolucao_prevista | B-tree |
| LOCACOES_ITENS | idx_locacoes_itens_locacao | locacao_id | B-tree |
| VISTORIAS | idx_vistorias_locacao | locacao_id | B-tree |
| VISTORIAS | idx_vistorias_veiculo | veiculo_id | B-tree |
| VISTORIAS | idx_vistorias_fase | fase | B-tree |
| MULTAS | idx_multas_locacao | locacao_id | B-tree |
| MULTAS | idx_multas_status | status_pagamento | B-tree |
| AVALIACOES_VEICULOS | idx_avaliacoes_veiculo | veiculo_id | B-tree |
| AVALIACOES_VEICULOS | idx_avaliacoes_cliente | cliente_id | B-tree |
| LOGS_SISTEMA | idx_logs_usuario | usuario | B-tree |
| LOGS_SISTEMA | idx_logs_data | data_ocorrencia | B-tree |
| LOGS_SISTEMA | idx_logs_acao | acao | B-tree |

### 4.4 Triggers Implementados

| Trigger | Evento | Tabela | Descrição |
|---------|--------|--------|-----------|
| trg_locacao_reservar_veiculo | AFTER INSERT | LOCACOES | Atualiza status do veículo para 'Reservado' e registra log |
| trg_locacao_concluir | AFTER UPDATE | LOCACOES | Libera veículo (status 'Livre') quando locação é concluída |
| trg_locacao_motorista | AFTER INSERT | LOCACOES | Atualiza status do motorista para 'Ocupado' se houver motorista |

### 4.5 Views Criadas

| View | Descrição |
|------|-----------|
| vw_locacoes_detalhadas | Relatório completo de locações com dados de cliente, veículo, categoria, loja, cidade e motorista |
| vw_faturamento_mensal | Resumo mensal de faturamento com total de locações, valor faturado e ticket médio |
| vw_veiculos_disponiveis | Lista de veículos disponíveis para locação com dados completos de categoria e localização |

---

## 5. SCRIPT SQL COMPLETO

O script de criação do banco de dados encontra-se no arquivo:
- **Caminho**: `c:\Users\Thalles Costa\Desktop\Falls-to-Car\supabase\MySQL\FallsCar.sql`

O script inclui:
- Criação do banco de dados `fallscar_enterprise`
- Criação de todas as 16 tabelas com PK, FK, constraints e índices
- Triggers para automação de processos
- Views para relatórios
- Engine InnoDB com UTF-8

---

**Fim da Documentação**
