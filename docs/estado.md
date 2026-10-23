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
| 4 — Atividades | lista, drawer de cadastro/edição e prévia ao vivo (DP-2) | [fase-4.md](fases/fase-4.md) |
| **P2 — Parada de teste** | **aprovada** — robô inserido pela interface, motor devolve os mesmos valores da P1 (`tempoDisponivelMin` = 5600, gargalo `'112'`) | [fase-4.md](fases/fase-4.md) |
| 5 — Construtor de sequência | não iniciada | — |
| 6 a 8 | não iniciadas | — |

**As fases deslizaram um número.** O plano previa Cenário e Atividades juntas na
Fase 3, com a P2 no fim. Os frames vieram em duas entregas (DP-1 e DP-2), então
Atividades e a P2 ficaram na Fase 4, e o construtor de sequência — que o plano
chamava de Fase 4 — passa a ser a Fase 5. A ordem do caminho dos dados não
mudou.

## O que a Parada P2 encontrou

A interface **não reproduz o cenário da planilha por inteiro**: a tela de
Cenário não tem o campo de tempo de descanso, porque a P1 provou que a planilha
não o desconta (D-10). Hoje é inofensivo — os dois cenários dão o mesmo tempo
disponível, e há um teste que prova isso. Mas esse teste falha de propósito no
dia em que D-10 for resolvida a favor de descontar o descanso, e aí a tela
precisa ganhar o campo de volta.

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
| D-18 | Duas classificações de ocupação com cortes diferentes: 0,75 na tela (DP-2) e 0,85 no motor (Fase 2) | [fase-4.md](fases/fase-4.md) |
| DP-1 × DP-2 | O guia do DP-2 repete cores, bordas e altura de header diferentes das aprovadas no DP-1. Mantidos os do DP-1 | [fase-4.md](fases/fase-4.md) |

Resolvidas depois da Fase 3: **D-16** (a conversão de segundos para minutos
ficou na fronteira `cenarioDoFormulario`) e **D-17** (o rótulo da demanda
acompanha a periodicidade escolhida). **D-19** é um arredondamento do mock de
design, não uma decisão pendente — ver [fase-4.md](fases/fase-4.md).
