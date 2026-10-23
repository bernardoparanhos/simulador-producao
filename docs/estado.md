# Estado da construção

Atualizado em 2026-10-23.

Este arquivo é o registro de andamento. Ele fica **fora** de
[`plano-de-construcao.md`](plano-de-construcao.md) de propósito: o plano é um
espelho do documento vivo mantido no claude.ai, e toda re-sincronização
sobrescreve o que for escrito lá. O plano diz o que fazer; este arquivo diz
onde estamos.

## Fases

| Fase | Estado | Registro |
| --- | --- | --- |
| 0 — Fundação e decisões | concluída | [fase-0.md](fases/fase-0.md) |
| 1 — Coleta e identidade | concluída | [fase-1.md](fases/fase-1.md) |
| 2 — Motor de cálculo | concluída | [fase-2.md](fases/fase-2.md) |
| **P1 — Parada de teste** | **aprovada**: 49/49 testes, as 15 atividades do robô batendo com a planilha | [fase-2.md](fases/fase-2.md) |
| 3 — Entradas | telas de abertura, entrada e **Cenário**, com a identidade DP-1 aplicada | [fase-3.md](fases/fase-3.md) |
| 4 — Construtor de sequência | não iniciada | — |
| **P2 — Parada de teste** | adiada para o fim da Fase 4 | — |
| 5 a 8 | não iniciadas | — |

**Atividades e a Parada P2 passaram para a Fase 4.** O plano previa as duas
telas de entrada na Fase 3, mas os frames aprovados (DP-1) cobrem Cenário e não
Atividades. A P2 depende de Atividades: sem elas o motor não devolve número
nenhum para comparar.

## O que a Parada P1 corrigiu

Três coisas na primeira entrega do motor: o tempo disponível não desconta o
descanso (D-10), a ocupação não usa o takt time (D-11) e a inspeção não entra no
tempo de ciclo (D-13).

Duas divergências que mexem nos números seguem abertas porque o cenário do robô
não as exercita: `numOperadores` fora das fórmulas (D-1, vai ao cenário do trem
na Fase 7) e a grandeza que propaga pela sequência (D-3, vai à **Parada P3**,
porque o fluxograma da planilha estava vazio).

## Documentos de referência

- [modelo-de-dados.md](modelo-de-dados.md) — as entidades, os campos, as
  unidades e o mapeamento contra as abas da planilha. É a referência de entrada
  e saída do motor de cálculo.
- [fases/fase-2.md](fases/fase-2.md) — as fórmulas, o resultado da P1 e as
  **dezessete divergências** entre as fórmulas da planilha e o modelo de dados,
  com impacto e responsável de cada uma.

### Decisões

- [0001 — Escolha da stack](decisoes/0001-escolha-da-stack.md)
- [0002 — Representação da sequência](decisoes/0002-representacao-da-sequencia.md)
  — por que o fluxo é um grafo dirigido.
- [0003 — Premissas do motor de cálculo](decisoes/0003-premissas-do-motor-de-calculo.md)
  — o que o motor faz quando a fórmula recebida e o modelo de dados não
  conversam, e por que ele não valida a entrada.
- [0004 — Camada de tela](decisoes/0004-camada-de-tela.md) — os dois modos da
  identidade, por que o formulário da tela não é o `Cenario` do motor e onde a
  validação entra.

## Decisões abertas, esperando o responsável do projeto

| # | O que | Onde |
| --- | --- | --- |
| D-10 | O descanso é esquecimento da planilha, ou já está embutido em outro desconto? | [fase-2.md](fases/fase-2.md) |
| D-13, D-4 | A inspeção está toda inerte: três parâmetros preenchidos, nenhum afeta número | [fase-2.md](fases/fase-2.md) |
| D-14 | Unidade dos campos de inspeção: `%` inteiro ou fração? | [fase-2.md](fases/fase-2.md) |
| D-7 | Falta renomear `producaoRealizadaDiaria`, que ficou com o sufixo antigo | [fase-2.md](fases/fase-2.md) |

Resolvidas depois da Fase 3: **D-16** (a conversão de segundos para minutos
ficou na fronteira `cenarioDoFormulario`) e **D-17** (o rótulo da demanda
acompanha a periodicidade escolhida).
