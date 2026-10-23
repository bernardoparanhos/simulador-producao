/**
 * Cenário do robô — a referência da Parada P1.
 *
 * Dados extraídos da planilha `SIMULADOR DE PRODUÇÃO ROBÔ.xlsm`, abas DADOS
 * INICIAIS e DADOS (formulário ATIVIDADES). Os resultados esperados estão no
 * gabarito de `src/engine/__tests__/robo.test.ts`, extraídos da aba RELATÓRIO.
 *
 * Montagem de um robô de peças de encaixe, em 15 atividades distribuídas por
 * três etapas e três linhas de produção.
 *
 * ## Particularidades deste cenário, e o que elas não provam
 *
 * - **A sequência está vazia.** O fluxograma da planilha não estava preenchido,
 *   então não há conexões. Consequência: a produção realizada de cada atividade
 *   é igual à própria capacidade, e a propagação do gargalo pelo grafo não é
 *   exercitada pela P1 — ela é testada à parte, com o cenário sintético de
 *   `exemplo.ts`. Esta ausência é, em si, a razão de ser do projeto: na planilha
 *   o fluxo não alimenta o cálculo.
 * - **Todas as atividades têm um operador só.** Logo a P1 não resolve a dúvida
 *   da divergência D-1 (`numOperadores` não entra em nenhuma fórmula): o cenário
 *   daria o mesmo resultado nas duas leituras.
 * - **Nenhum parâmetro de inspeção afeta resultado algum.** Os três estão
 *   preenchidos e nenhum aparece nos números do relatório (divergência D-13).
 * - **Não há parada não planejada** registrada na planilha.
 */

import type { Atividade, Cenario, EntradaSimulacao, Sequencia } from '@/types'

/**
 * Dados iniciais do robô, da aba DADOS INICIAIS.
 *
 * Tempo disponível resultante: `(480 - 30 * 2 - 20) * 2 * 7 = 5600` min.
 *
 * TODO(D-10): `tempoDescansoMin` vale 20 min na planilha, mas não entra na
 * fórmula do tempo disponível — descontá-lo daria 5320, e a planilha mostra
 * 5600. O campo fica registrado aqui porque é dado real do cenário.
 *
 * TODO(D-14): os campos de inspeção estão na unidade do **modelo** — `%` de 0 a
 * 100. A planilha guarda 0,20 e 0,90, que são células de porcentagem do Excel
 * (fração), e a conversão para 20 e 90 preserva o significado (20% e 90%). Se o
 * modelo passar a usar fração nestes campos, é aqui que muda.
 */
export const cenarioRobo: Cenario = {
  demanda: 400,
  tamanhoLote: 20,
  tempoRefeicaoMin: 30,
  trocaTurnoMin: 20,
  tempoTurnoMin: 480,
  numRefeicoesPorTurno: 2,
  tempoDescansoMin: 20,
  turnosDiarios: 2,
  diasOuSemanasNoMes: 7,
  periodicidade: 'Semanal',
  inspecao: {
    porcentagemInspecionada: 20,
    tempoPorPecaMin: 1,
    minimoAprovacao: 90,
  },
  paradaNaoPlanejada: null,
}

/**
 * As 15 atividades do robô, da aba DADOS (formulário ATIVIDADES).
 *
 * O `id` reproduz a codificação da planilha: etapa, linha e processo
 * concatenados. A atividade `'211'`, por exemplo, é a etapa 2, linha 1,
 * processo 1. A ordem da lista é a da planilha, que agrupa por linha e não por
 * etapa — por isso `'211'` aparece entre as atividades da linha 1.
 *
 * Valores iguais em todas: `setupMin` 1,0, `fatorRitmo` 100%,
 * `fatorTolerancia` 1%, `numOperadores` 1.
 */
export const atividadesRobo: Atividade[] = [
  {
    id: '111',
    descricao: '1 - SUPORTE SUPERIOR',
    etapa: 1,
    linha: 1,
    processo: 1,
    tempoCronometradoMin: 6.16,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '112',
    descricao: '2 - ENCAIXAR 2 S8 EM 2 D2',
    etapa: 1,
    linha: 1,
    processo: 2,
    tempoCronometradoMin: 15.936,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '211',
    descricao: '3 - POSICIONAR AS DUAS D4',
    etapa: 2,
    linha: 1,
    processo: 1,
    tempoCronometradoMin: 8.82,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '121',
    descricao: '4 - EXTREMIDADE LATERAL',
    etapa: 1,
    linha: 2,
    processo: 1,
    tempoCronometradoMin: 9.19,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '122',
    descricao: '5 - ENCAIXAR UMA PEÇA S8 NO TERCEIRO PINO',
    etapa: 1,
    linha: 2,
    processo: 2,
    tempoCronometradoMin: 4.78,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '123',
    descricao: '6 - ENCAIXAR UMA PÇ S8 NO SEXTO PINO',
    etapa: 1,
    linha: 2,
    processo: 3,
    tempoCronometradoMin: 4.204,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '124',
    descricao: '7 - ENCAIXAR A OUTRA EXTREMIDADE LATERAL',
    etapa: 1,
    linha: 2,
    processo: 4,
    tempoCronometradoMin: 11.45,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '131',
    descricao: '8 - BASE CENTRAL: JUNTAR 2 S8',
    etapa: 1,
    linha: 3,
    processo: 1,
    tempoCronometradoMin: 4.86,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '132',
    descricao: '9 - ENCAIXAR 1 D4',
    etapa: 1,
    linha: 3,
    processo: 2,
    tempoCronometradoMin: 9.068,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '133',
    descricao: '10 - EXTREMIDADE DA BASE',
    etapa: 1,
    linha: 3,
    processo: 3,
    tempoCronometradoMin: 7.668,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '134',
    descricao: '11 - JUNTAR BASE CENTRAL',
    etapa: 1,
    linha: 3,
    processo: 4,
    tempoCronometradoMin: 9.724,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '135',
    descricao: '12 - ENCAIXAR 2 PEÇAS RL',
    etapa: 1,
    linha: 3,
    processo: 5,
    tempoCronometradoMin: 12.418,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '221',
    descricao: '13 - UTILIZANDO OS S8 DA BASE',
    etapa: 2,
    linha: 2,
    processo: 1,
    tempoCronometradoMin: 13.58,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '311',
    descricao: '14 - UTILIZANDO OS D4 DO SUPORTE SUPERIOR',
    etapa: 3,
    linha: 1,
    processo: 1,
    tempoCronometradoMin: 8.944,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
  {
    id: '312',
    descricao: '15 - ENCAIXAR AS RODAS',
    etapa: 3,
    linha: 1,
    processo: 2,
    tempoCronometradoMin: 7.974,
    setupMin: 1,
    fatorRitmo: 100,
    fatorTolerancia: 1,
    numOperadores: 1,
  },
]

/**
 * Sequência do robô: **vazia**.
 *
 * O fluxograma da planilha não estava preenchido. Não é dado em falta — é o
 * estado real do arquivo, e é exatamente o problema que o projeto resolve: na
 * planilha, o fluxo e o cálculo são coisas separadas.
 *
 * Sem conexões, nenhuma atividade tem predecessora, então cada uma produz a
 * própria capacidade. É o que o gabarito da P1 confirma.
 *
 * TODO(P3): montar o fluxo real do robô no construtor de sequência e conferir
 * que mudar o fluxo muda os números de forma coerente — é a Parada P3 do plano.
 */
export const sequenciaRobo: Sequencia = {
  nos: atividadesRobo.map((atividade) => ({ atividadeId: atividade.id })),
  conexoes: [],
}

/** O cenário do robô completo, pronto para `simular()`. */
export const robo: EntradaSimulacao = {
  cenario: cenarioRobo,
  atividades: atividadesRobo,
  sequencia: sequenciaRobo,
}
