/**
 * Faixas de ocupação na tela: a classificação e as cores.
 *
 * ```text
 * ocupacao <= 0,75  -> 'ok'       verde
 * ocupacao <  1,00  -> 'atencao'  laranja
 * ocupacao >= 1,00  -> 'acima'    vermelho
 * ```
 *
 * ## A classificação mora no motor
 *
 * {@link getStatusOcupacao} delega para `classificarOcupacao`, em
 * `src/engine/atividade.ts`. Não há conta repetida aqui.
 *
 * Até a Fase 4 havia **duas** implementações com cortes diferentes — 0,85 no
 * motor, vindo do briefing da Fase 2, e 0,75 na tela, vindo do DP-2
 * (divergência D-18). As duas concordavam nas atividades de referência, então
 * nada parecia errado; uma atividade a 80% de ocupação é que sairia verde num
 * lugar e laranja no outro.
 *
 * A divergência foi resolvida a favor de 0,75, e o corte do motor foi
 * alinhado. O que sobrou neste arquivo é o que é de fato da tela: o mapa de
 * cores.
 */

import { classificarOcupacao } from '@/engine'
import type { StatusOcupacao } from '@/types'

/**
 * Classifica uma ocupação na faixa de cor.
 *
 * A ocupação chega do motor como fração (`0,448`, `1,15324`), e **pode passar
 * de 1**: a atividade gargalo do robô está em 1,15.
 *
 * Onde o resultado do motor já estiver em mãos, prefira o campo
 * `statusOcupacao` que ele devolve — é o mesmo valor, sem a chamada extra.
 * Esta função serve para quando só existe o número.
 *
 * @param ocupacao Ocupação da atividade, fração em que 1 é 100%.
 * @returns A faixa em que ela cai.
 */
export function getStatusOcupacao(ocupacao: number): StatusOcupacao {
  return classificarOcupacao(ocupacao)
}

/** Classes de cor por status, para barra, texto e borda. */
const CLASSES = {
  ok: { barra: 'bg-status-ok', texto: 'text-status-ok', borda: 'border-status-ok' },
  atencao: {
    barra: 'bg-status-atencao',
    // O laranja vivo não tem contraste suficiente em texto; o número usa o escuro.
    texto: 'text-status-text-atencao',
    borda: 'border-status-atencao',
  },
  acima: {
    barra: 'bg-status-acima',
    texto: 'text-status-acima',
    borda: 'border-status-acima',
  },
} as const

/**
 * As classes Tailwind de um status.
 *
 * Centraliza o mapa para que nenhuma tela escreva `bg-status-acima` à mão e
 * acabe pintando uma barra de uma cor e o número de outra.
 *
 * @param status A faixa da ocupação.
 * @returns Classes para a barra, o texto e a borda.
 */
export function classesDoStatus(status: StatusOcupacao): (typeof CLASSES)[StatusOcupacao] {
  return CLASSES[status]
}
