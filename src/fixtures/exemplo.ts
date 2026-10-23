/**
 * Cenário sintético de exemplo — dados fictícios, escolhidos para testar.
 *
 * **Não é um produto real e não serve de referência para nenhuma parada de
 * teste.** O caso real é `robo.ts`. Este cenário existe para exercitar o que o
 * robô não exercita:
 *
 * - um **afunilamento** real: duas atividades da etapa 1 alimentam uma única
 *   atividade da etapa 2, que alimenta a etapa 3. O fluxograma do robô estava
 *   vazio, então a propagação do gargalo só é testada aqui;
 * - um **gargalo no meio do caminho**, para provar que a limitação se propaga a
 *   jusante por toda a cadeia, e não só um passo adiante;
 * - uma atividade com **setup** e outras sem, para o termo `setupMin/tamanhoLote`
 *   aparecer em algumas linhas e não em outras;
 * - as **três faixas de ocupação** (`ok`, `atencao`, `acima`) e **estoque dos
 *   dois sinais** (sobra e falta), num cenário só.
 *
 * Os números esperados, conferidos à mão:
 *
 * ```text
 * tempoDisponivelMin = (480 - 60*1 - 10) * 1 * 1 = 410
 * taktTimeMin        = (410 / (20 * 240)) * 60    = 5,125
 * quantidadeCiclos   = 240 / 20                   = 12
 *
 * atividade  etapa/linha  ciclo  capacid.  ocupação  status    produção  estoque
 * ex-01      1 / 1        1,5    273,33    0,87805   atencao   273,33    +33,33
 * ex-02      1 / 2        2,0    205,00    1,17073   acima     205,00    -35,00
 * ex-03      2 / 1        0,5    820,00    0,29268   ok        205,00    -35,00
 * ex-04      3 / 1        1,0    410,00    0,58537   ok        205,00    -35,00
 * ```
 *
 * A atividade `ex-03` tem a maior capacidade de todas (820) e ainda assim produz
 * 205: é o afunilamento limitando pelo ramo mais lento, que é o ponto do
 * projeto. E `ex-04`, duas etapas depois do gargalo, também cai para 205.
 *
 * A demanda foi fixada em 240 depois da Parada P1: com a fórmula de ocupação
 * corrigida (`tempoCicloMin * demanda / tempoDisponivelMin`), a demanda de 480
 * do rascunho original punha quase todas as atividades em `'acima'` e o cenário
 * deixava de cobrir as três faixas.
 */

import type { Atividade, Cenario, EntradaSimulacao, Sequencia } from '@/types'

/** Dados iniciais fictícios: um turno de 8 h, um dia, lote de 20, demanda de 240. */
export const cenarioExemplo: Cenario = {
  demanda: 240,
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
