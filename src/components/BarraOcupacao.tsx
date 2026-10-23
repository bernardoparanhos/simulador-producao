/**
 * Barra de ocupação — o indicador visual de carga de uma atividade.
 *
 * Aparece em dois lugares com o mesmo desenho: na lista de atividades e no
 * card de prévia do drawer. A cor vem do status, e o preenchimento é a
 * ocupação limitada a 100% de largura — uma atividade a 115% enche a barra e o
 * número ao lado é quem conta o resto da história.
 */

import type { StatusOcupacao } from '@/types'
import { classesDoStatus } from '@/utils/ocupacaoStatus'

export interface BarraOcupacaoProps {
  /** Ocupação da atividade, fração em que 1 é 100%. Pode passar de 1. */
  ocupacao: number
  /** A faixa de cor. */
  status: StatusOcupacao
  /** Classes de largura e altura do trilho. */
  className?: string
}

/** O trilho com o preenchimento colorido. */
export function BarraOcupacao({ ocupacao, status, className = '' }: BarraOcupacaoProps) {
  // A barra satura em 100%: passar disso só esticaria o trilho e esconderia
  // que o limite foi ultrapassado, que é justamente o que precisa aparecer.
  const largura = Math.min(1, Math.max(0, ocupacao))

  return (
    <div
      className={`bg-[#EDE9E2] ${className}`}
      role="img"
      aria-label={`Ocupação de ${Math.round(ocupacao * 100)}%`}
    >
      <div
        className={`h-full ${classesDoStatus(status).barra} transition-[width] duration-200`}
        style={{ width: `${largura * 100}%` }}
      />
    </div>
  )
}
