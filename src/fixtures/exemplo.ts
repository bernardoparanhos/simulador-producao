/**
 * Cenário sintético de exemplo — dados fictícios, escolhidos para testar.
 *
 * **Não é um produto real e não serve de referência para nenhuma parada de
 * teste.** Os números foram escolhidos para dar contas redondas e para exercitar
 * o motor nos pontos que importam:
 *
 * - um **afunilamento** real: duas atividades da etapa 1 alimentam uma única
 *   atividade da etapa 2, que alimenta a etapa 3;
 * - um **gargalo no meio do caminho**, e não na primeira atividade, para provar
 *   que a limitação se propaga a jusante;
 * - uma atividade com **setup** e outras sem, para o termo `setupMin/tamanhoLote`
 *   aparecer em algumas linhas e não em outras;
 * - **inspeção desligada** (`porcentagemInspecionada: 0`), para que o cenário
 *   base exercite as fórmulas da planilha sem a parcela de inspeção, que é
 *   premissa do motor e não fórmula recebida. Os testes ligam a inspeção à parte.
 *
 * Os números esperados, conferidos à mão:
 *
 * ```text
 * tempoDisponivelMin = (480 - 60*1 - 20 - 10) * 1 * 1 = 390
 * taktTimeMin        = (390 / (20 * 480)) * 60         = 2,4375
 * quantidadeCiclos   = 480 / 20                        = 24
 *
 * atividade  etapa/linha  ciclo (min)  capacidade  produção  gargalo
 * ex-01      1 / 1        1,5          260         260
 * ex-02      1 / 2        2,0          195         195       <- gargalo
 * ex-03      2 / 1        0,5          780         195
 * ex-04      3 / 1        1,0          390         195
 * ```
 *
 * A atividade `ex-03` tem a maior capacidade de todas (780) e ainda assim produz
 * 195: é o afunilamento limitando pelo ramo mais lento, que é o ponto do
 * projeto.
 */

import type { Atividade, Cenario, EntradaSimulacao, Sequencia } from '@/types'

/** Dados iniciais fictícios: um turno de 8 h, um dia, lote de 20, demanda de 480. */
export const cenarioExemplo: Cenario = {
  demanda: 480,
  tamanhoLote: 20,
  tempoRefeicaoMin: 60,
  trocaTurnoMin: 10,
  tempoTurnoMin: 480,
  numRefeicoesPorTurno: 1,
  tempoDescansoMin: 20,
  turnosDiarios: 1,
  diasOuSemanasNoMes: 1,
  periodicidade: 'Diario',
  inspecao: {
    porcentagemInspecionada: 0,
    tempoPorPecaMin: 2,
    minimoAprovacao: 95,
  },
  paradaNaoPlanejada: null,
}

/** Quatro atividades fictícias em três etapas, com duas linhas na etapa 1. */
export const atividadesExemplo: Atividade[] = [
  {
    id: 'ex-01',
    descricao: 'Cortar chapa',
    etapa: 1,
    linha: 1,
    processo: 1,
    tempoCronometradoMin: 1,
    setupMin: 10,
    fatorRitmo: 100,
    fatorTolerancia: 0,
    numOperadores: 1,
  },
  {
    id: 'ex-02',
    descricao: 'Dobrar perfil',
    etapa: 1,
    linha: 2,
    processo: 1,
    tempoCronometradoMin: 2,
    setupMin: 0,
    fatorRitmo: 100,
    fatorTolerancia: 0,
    numOperadores: 1,
  },
  {
    id: 'ex-03',
    descricao: 'Soldar conjunto',
    etapa: 2,
    linha: 1,
    processo: 1,
    tempoCronometradoMin: 0.5,
    setupMin: 0,
    fatorRitmo: 100,
    fatorTolerancia: 0,
    numOperadores: 1,
  },
  {
    id: 'ex-04',
    descricao: 'Pintar e embalar',
    etapa: 3,
    linha: 1,
    processo: 1,
    tempoCronometradoMin: 1,
    setupMin: 0,
    fatorRitmo: 100,
    fatorTolerancia: 0,
    numOperadores: 1,
  },
]

/**
 * O fluxo: `ex-01` e `ex-02` afunilam em `ex-03`, que alimenta `ex-04`.
 *
 * ```text
 * ex-01 ─┐
 *        ├─> ex-03 ──> ex-04
 * ex-02 ─┘
 * ```
 */
export const sequenciaExemplo: Sequencia = {
  nos: [
    { atividadeId: 'ex-01' },
    { atividadeId: 'ex-02' },
    { atividadeId: 'ex-03' },
    { atividadeId: 'ex-04' },
  ],
  conexoes: [
    { id: 'ex-c1', origem: 'ex-01', destino: 'ex-03' },
    { id: 'ex-c2', origem: 'ex-02', destino: 'ex-03' },
    { id: 'ex-c3', origem: 'ex-03', destino: 'ex-04' },
  ],
}

/** O cenário de exemplo completo, pronto para `simular()`. */
export const exemplo: EntradaSimulacao = {
  cenario: cenarioExemplo,
  atividades: atividadesExemplo,
  sequencia: sequenciaExemplo,
}
