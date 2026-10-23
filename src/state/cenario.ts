/**
 * O cenário como a tela o apresenta, e sua tradução para o motor.
 *
 * Só dados e funções puras — nada de React. O provedor que guarda este estado
 * está em `ProvedorCenario.tsx`, e o acesso a ele em `contextoCenario.ts`.
 *
 * ## Por que o formulário não é um `Cenario`
 *
 * O tipo {@link Cenario} é o que o **motor** consome; {@link FormularioCenario}
 * é o que a **tela** mostra. Eles são parecidos, mas não iguais, e forçá-los a
 * ser o mesmo tipo esconderia três diferenças reais:
 *
 * 1. **A tela pede o tempo de inspeção em segundos** (`6,5 s`), e o modelo
 *    guarda em minutos (`tempoPorPecaMin`). A conversão acontece na fronteira,
 *    em {@link cenarioDoFormulario}.
 * 2. **A tela não pede o tempo de descanso.** A Parada P1 mostrou que a
 *    planilha não desconta o descanso do tempo disponível (divergência D-10),
 *    então o campo ficou fora do formulário aprovado. O modelo continua
 *    exigindo o campo, que vai como zero.
 * 3. **A tela não pede a parada não planejada.** Nenhuma fórmula a consome
 *    (divergência D-5), então ela vai como `null`.
 *
 * Quando essas divergências forem resolvidas, é este arquivo que muda — as
 * telas e o motor ficam como estão.
 */

import type { Cenario, Periodicidade } from '@/types'

/** Chave do formulário no `localStorage`. Versionada: mudou de forma, muda a chave. */
export const CHAVE_ARMAZENAMENTO = 'simulador-producao:cenario:v1'

/**
 * Os campos do cenário como a tela os apresenta.
 *
 * Todos numéricos (ou a união da periodicidade), já convertidos — a tela cuida
 * de lidar com o campo vazio enquanto a pessoa digita.
 */
export interface FormularioCenario {
  /** Demanda do período, em unidades (unid.). */
  demanda: number
  /** Tamanho do lote de produção, em unidades (unid.). */
  tamanhoLote: number
  /** Base de tempo da demanda. */
  periodicidade: Periodicidade
  /** Dias ou semanas no período, conforme a periodicidade. */
  diasOuSemanasNoMes: number
  /** Duração bruta de um turno, em minutos (min). */
  tempoTurnoMin: number
  /** Turnos trabalhados por dia. */
  turnosDiarios: number
  /** Refeições concedidas dentro de um turno. */
  numRefeicoesPorTurno: number
  /** Duração de uma refeição, em minutos (min). */
  tempoRefeicaoMin: number
  /** Tempo da passagem de serviço entre equipes, em minutos (min). */
  trocaTurnoMin: number
  /** Fração da produção que passa por inspeção, em porcentagem inteira (0–100). */
  porcentagemInspecionada: number
  /**
   * Tempo para inspecionar uma peça, em **segundos**.
   *
   * A tela aprovada pede segundos porque é a ordem de grandeza da medição
   * (6,5 s). O modelo guarda minutos — ver {@link cenarioDoFormulario}.
   */
  tempoInspecaoPorPecaSeg: number
  /** Taxa mínima de aprovação esperada, em porcentagem inteira (0–100). */
  minimoAprovacao: number
}

/**
 * Valores iniciais, os mesmos dos frames aprovados.
 *
 * Com eles, o tempo disponível por turno é `480 - 70 * 1 - 12 = 398` min — o
 * número que aparece no indicador do frame.
 */
export const FORMULARIO_INICIAL: FormularioCenario = {
  demanda: 1200,
  tamanhoLote: 50,
  periodicidade: 'Diario',
  diasOuSemanasNoMes: 22,
  tempoTurnoMin: 480,
  turnosDiarios: 1,
  numRefeicoesPorTurno: 1,
  tempoRefeicaoMin: 70,
  trocaTurnoMin: 12,
  porcentagemInspecionada: 100,
  tempoInspecaoPorPecaSeg: 6.5,
  minimoAprovacao: 98,
}

/**
 * Tempo produtivo de **um turno**, em minutos (min).
 *
 * É o indicador que a tela de Cenário mostra ao vivo, no canto superior
 * direito. Difere do `tempoDisponivelMin` do motor por não multiplicar pelos
 * turnos do dia nem pelos dias do período: mostra o efeito direto do que a
 * pessoa acabou de digitar, antes de qualquer multiplicação.
 *
 * Não desconta o descanso, pela mesma razão que o motor não desconta — a
 * planilha não desconta (divergência D-10).
 *
 * @param formulario O formulário preenchido.
 * @returns Minutos produtivos num turno. Nunca negativo.
 */
export function tempoDisponivelPorTurnoMin(formulario: FormularioCenario): number {
  const liquido =
    formulario.tempoTurnoMin -
    formulario.tempoRefeicaoMin * formulario.numRefeicoesPorTurno -
    formulario.trocaTurnoMin

  return Math.max(0, liquido)
}

/**
 * Converte o formulário da tela no `Cenario` que o motor consome.
 *
 * É a única fronteira entre as duas formas. As três diferenças (segundos para
 * minutos, descanso ausente, parada ausente) estão explicadas no cabeçalho
 * deste arquivo.
 *
 * As porcentagens passam **inteiras** (`100`, `98`), sem conversão de escala: é
 * a unidade que o modelo documenta e a que o motor espera.
 *
 * @param formulario O formulário preenchido.
 * @returns O cenário pronto para `simular()`.
 */
export function cenarioDoFormulario(formulario: FormularioCenario): Cenario {
  return {
    demanda: formulario.demanda,
    tamanhoLote: formulario.tamanhoLote,
    tempoRefeicaoMin: formulario.tempoRefeicaoMin,
    trocaTurnoMin: formulario.trocaTurnoMin,
    tempoTurnoMin: formulario.tempoTurnoMin,
    numRefeicoesPorTurno: formulario.numRefeicoesPorTurno,
    // A tela não pede o descanso: ele não entra em fórmula nenhuma (D-10).
    tempoDescansoMin: 0,
    turnosDiarios: formulario.turnosDiarios,
    diasOuSemanasNoMes: formulario.diasOuSemanasNoMes,
    periodicidade: formulario.periodicidade,
    inspecao: {
      porcentagemInspecionada: formulario.porcentagemInspecionada,
      // D-16: campo em segundos no form; motor espera minutos → ÷ 60
      tempoPorPecaMin: formulario.tempoInspecaoPorPecaSeg / 60,
      minimoAprovacao: formulario.minimoAprovacao,
    },
    // A tela não pede a parada: nenhuma fórmula a consome (D-5).
    paradaNaoPlanejada: null,
  }
}

/**
 * Lê o formulário salvo, ou devolve os valores iniciais.
 *
 * Tolerante por decisão: um `localStorage` indisponível (navegação privada),
 * um JSON corrompido ou um formulário de uma versão anterior não podem
 * impedir a tela de abrir. Qualquer problema cai nos valores iniciais em
 * silêncio, e os campos desconhecidos são descartados pelo espalhamento.
 */
export function lerFormularioArmazenado(): FormularioCenario {
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO)
    if (bruto === null) return FORMULARIO_INICIAL

    const salvo = JSON.parse(bruto) as Partial<FormularioCenario>
    return { ...FORMULARIO_INICIAL, ...salvo }
  } catch {
    return FORMULARIO_INICIAL
  }
}

/**
 * Grava o formulário. Falha em silêncio.
 *
 * Sem armazenamento disponível, o cenário vive só nesta sessão — a tela
 * funciona igual, e travar por causa disso seria pior do que esquecer.
 */
export function gravarFormulario(formulario: FormularioCenario): void {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(formulario))
  } catch {
    // Intencionalmente ignorado. Ver o comentário acima.
  }
}

/** Apaga o formulário salvo. Falha em silêncio, pela mesma razão. */
export function apagarFormularioArmazenado(): void {
  try {
    window.localStorage.removeItem(CHAVE_ARMAZENAMENTO)
  } catch {
    // Intencionalmente ignorado.
  }
}
