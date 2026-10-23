/**
 * Faixas de ocupação **para a tela**.
 *
 * Diz em que cor uma ocupação é desenhada: verde folgada, laranja apertada,
 * vermelha estourada.
 *
 * # Atenção: há duas classificações no projeto, com cortes diferentes
 *
 * | Onde | Corte `ok` → `atencao` | Corte `atencao` → `acima` |
 * | --- | --- | --- |
 * | Esta função (tela, DP-2) | **0,75** | 1,00 |
 * | `classificarOcupacao` (motor, Fase 2) | **0,85** | 1,00 |
 *
 * O campo `statusOcupacao` que o motor devolve em cada
 * `ResultadoPorAtividade` usa 0,85; a tela usa 0,75. Para as cinco atividades
 * de referência do DP-2 as duas concordam, mas uma atividade a 80% de ocupação
 * sai `'ok'` pelo motor e `'atencao'` na tela.
 *
 * A tela usa **esta** função, nunca o campo do motor, para que o que se vê seja
 * sempre o que o DP-2 especificou. Mas são duas verdades sobre a mesma coisa.
 *
 * TODO(D-18): unificar os cortes. O do motor (0,85) veio do briefing da Fase 2
 * e nunca foi conferido contra a planilha; o da tela (0,75) veio do DP-2.
 * Decidido qual vale, esta função some e a tela volta a ler o campo do motor —
 * ou o motor passa a usar o corte da tela.
 */

import type { StatusOcupacao } from '@/types'

/** Abaixo disto a ocupação é folga confortável. */
const LIMITE_OK = 0.75

/** A partir disto a atividade não dá conta da demanda. */
const LIMITE_ACIMA = 1

/**
 * Classifica uma ocupação na faixa de cor da tela.
 *
 * ```text
 * ocupacao <= 0,75  -> 'ok'
 * ocupacao <  1,00  -> 'atencao'
 * ocupacao >= 1,00  -> 'acima'
 * ```
 *
 * A ocupação chega do motor como fração (`0,448`, `1,15324`), e **pode passar
 * de 1**: a atividade gargalo do robô está em 1,15.
 *
 * @param ocupacao Ocupação da atividade, fração em que 1 é 100%.
 * @returns A faixa em que ela cai.
 */
export function getStatusOcupacao(ocupacao: number): StatusOcupacao {
  if (ocupacao <= LIMITE_OK) return 'ok'
  if (ocupacao < LIMITE_ACIMA) return 'atencao'
  return 'acima'
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
