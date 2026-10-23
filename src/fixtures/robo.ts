/**
 * Cenário do robô — a referência da Parada P1.
 *
 * # ATENÇÃO: OS NÚMEROS DO ROBÔ NÃO ESTÃO NESTE REPOSITÓRIO
 *
 * Este arquivo é o **lugar** do cenário do robô, não o cenário do robô. Nenhum
 * valor real foi preenchido, porque nenhum valor real existe no projeto: o
 * plano de construção aponta os números para "a especificação viva" e para "o
 * pacote de extração" (`docs/plano-de-construcao.md`), documentos que vivem
 * fora do repositório. Inventar números aqui seria pior do que deixá-los em
 * falta — eles passariam a parecer dados da planilha na hora de comparar na
 * Parada P1.
 *
 * Por isso todo campo numérico vale {@link PENDENTE}, que é `NaN`. A escolha é
 * deliberada: `NaN` contamina toda conta que o toca, então qualquer resultado
 * calculado a partir deste cenário sai visivelmente inválido. Com zeros, o
 * motor devolveria números de aparência plausível e completamente falsos.
 *
 * ## O que é preciso para fechar a Parada P1
 *
 * Da aba DADOS INICIAIS da planilha do robô:
 *
 * - demanda, tamanho do lote;
 * - tempo de turno, turnos diários, dias ou semanas no mês, periodicidade;
 * - tempo de refeição e refeições por turno, tempo de descanso, troca de turno;
 * - inspeção: porcentagem inspecionada, tempo por peça, mínimo de aprovação;
 * - parada não planejada: qual atividade e quantos minutos.
 *
 * Da aba DADOS (formulário ATIVIDADES), **uma linha por atividade** — e o
 * número de atividades do robô também é desconhecido:
 *
 * - descrição, etapa, linha, processo;
 * - tempo cronometrado, setup;
 * - fator de ritmo, fator de tolerância, número de operadores.
 *
 * Das abas LOGICA PROCESSO e FLUXOGRAMA, o fluxo: quais atividades alimentam
 * quais.
 *
 * E, para o teste comparar, os **resultados** da planilha: tempo padrão, tempo
 * de ciclo, takt time, ocupação, gargalo e estoque final de cada atividade.
 *
 * Enquanto isso não chegar, o motor é verificado contra as próprias fórmulas em
 * `src/engine/__tests__/motor.test.ts`, com o cenário sintético de
 * `src/fixtures/exemplo.ts`. Isso prova que o código implementa as fórmulas
 * recebidas; não prova que as fórmulas batem com a planilha. Só a P1 prova isso.
 */

import type { Atividade, Cenario, EntradaSimulacao, Sequencia } from '@/types'

/**
 * Marcador de valor ausente.
 *
 * `NaN` de propósito, para que nenhum resultado calculado a partir do cenário
 * do robô possa ser confundido com um número válido. Ao preencher o cenário,
 * substitua cada ocorrência pelo valor da planilha e apague o `TODO(P1)` da
 * linha.
 */
export const PENDENTE = Number.NaN

/**
 * Dados iniciais do robô.
 *
 * TODO(P1): todos os campos numéricos abaixo vêm da aba DADOS INICIAIS da
 * planilha do robô e estão em falta.
 */
export const cenarioRobo: Cenario = {
  demanda: PENDENTE,
  tamanhoLote: PENDENTE,
  tempoRefeicaoMin: PENDENTE,
  trocaTurnoMin: PENDENTE,
  tempoTurnoMin: PENDENTE,
  numRefeicoesPorTurno: PENDENTE,
  tempoDescansoMin: PENDENTE,
  turnosDiarios: PENDENTE,
  diasOuSemanasNoMes: PENDENTE,
  // TODO(P1): confirmar a periodicidade do cenário do robô na planilha.
  periodicidade: 'Diario',
  inspecao: {
    porcentagemInspecionada: PENDENTE,
    tempoPorPecaMin: PENDENTE,
    minimoAprovacao: PENDENTE,
  },
  // TODO(P1): a planilha tem uma parada não planejada no robô? Em qual
  // atividade e de quantos minutos? `null` aqui significa "nenhuma", e essa é
  // uma suposição, não um dado.
  paradaNaoPlanejada: null,
}

/**
 * Atividades do robô.
 *
 * TODO(P1): lista vazia porque **nem a quantidade de atividades do robô é
 * conhecida**. Cada linha do formulário ATIVIDADES da planilha vira um item
 * aqui, com um `id` estável à escolha (ex.: `'rob-01'`).
 */
export const atividadesRobo: Atividade[] = []

/**
 * Sequência do robô.
 *
 * TODO(P1): vazia, à espera das abas LOGICA PROCESSO e FLUXOGRAMA. A estrutura
 * esperada, lembrando que a identidade do nó é o próprio `atividadeId` (ver
 * `docs/decisoes/0002-representacao-da-sequencia.md`):
 *
 * ```ts
 * nos: [{ atividadeId: 'rob-01' }, { atividadeId: 'rob-02' }]
 * conexoes: [{ id: 'c1', origem: 'rob-01', destino: 'rob-02' }]
 * ```
 */
export const sequenciaRobo: Sequencia = {
  nos: [],
  conexoes: [],
}

/**
 * O cenário do robô completo, pronto para `simular()`.
 *
 * TODO(P1): incompleto. Ver o cabeçalho deste arquivo.
 */
export const robo: EntradaSimulacao = {
  cenario: cenarioRobo,
  atividades: atividadesRobo,
  sequencia: sequenciaRobo,
}

/**
 * `true` enquanto o cenário do robô não tiver os dados da planilha.
 *
 * Os testes da Parada P1 consultam esta função para se declararem pendentes em
 * vez de falharem por um motivo que não é culpa do motor. Ela se torna `false`
 * sozinha quando o cenário for preenchido — não há flag para lembrar de virar.
 */
export function roboEstaPendente(): boolean {
  return (
    atividadesRobo.length === 0 ||
    Object.values(cenarioRobo).some((valor) => typeof valor === 'number' && Number.isNaN(valor)) ||
    Object.values(cenarioRobo.inspecao).some((valor) => Number.isNaN(valor))
  )
}
