# Guia de implantação — TI Service Desk na escola

## 1. Objetivo
Centralizar chamados, inventário patrimonial de TI, SLA, técnicos e indicadores em um único sistema.

## 2. Perfis
### Solicitante
Abertura, acompanhamento, respostas, anexos, reabertura e avaliação.

### Técnico
Fila de chamados, assumir/atribuir, SLA, status, notas internas, inventário e histórico.

### Administrador
Todos os recursos + cadastros, permissões, auditoria e exclusões.

## 3. Cadastro de ativos
Para cada ativo, registrar no mínimo:
- patrimônio;
- tipo;
- fabricante;
- modelo;
- número de série;
- hostname;
- endereço MAC;
- IP;
- sistema operacional;
- setor;
- sala/localização;
- responsável;
- status;
- fornecedor;
- valor de aquisição;
- data de aquisição;
- garantia;
- observações.

## 4. Relação ativo x chamado
Quando houver problema em um equipamento, o chamado deve apontar para o ativo.
Exemplo:
PAT-023 — Dell OptiPlex — LAB TI
Chamado #1042 — computador não inicia.

Assim o técnico consegue consultar o histórico do equipamento e a direção consegue visualizar recorrência de problemas.

## 5. Exclusão
A exclusão definitiva deve ser excepcional e restrita ao administrador.
Para equipamentos fora de operação, usar BAIXADO.
Isso evita perder patrimônio e histórico.

## 6. Backup
Backup diário do PostgreSQL e cópia para outro equipamento/local.
Teste restauração periodicamente.

## 7. Apresentação para a direção
Indicadores sugeridos:
- total de ativos;
- ativos em operação;
- ativos em manutenção;
- ativos baixados;
- patrimônio estimado;
- chamados abertos;
- chamados críticos;
- chamados fora do SLA;
- tempo médio de atendimento;
- chamados por setor;
- chamados por técnico.
