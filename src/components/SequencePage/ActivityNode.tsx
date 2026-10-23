/**
 * O nó de atividade no canvas de sequência. MODO CANVAS.
 *
 * Um cartão branco sobre o fundo escuro, com o essencial para decidir o fluxo:
 * o código, o nome, onde a atividade fica no processo e quanto ela está
 * ocupada. É a mesma informação da lista do passo 2, reduzida ao que cabe em
 * 176 px e ao que importa enquanto se liga uma coisa na outra.
 *
 * A barra de ocupação repete, em miniatura, o indicador da lista: é o que faz
 * o gargalo aparecer de longe, sem precisar ler número nenhum.
 */

import { Handle, Position } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'

import type { AtividadeFormulario } from '@/state'
import type { StatusOcupacao } from '@/types'
import { codigoDaAtividade, formatarEtapaLinha, formatarPorcentagem } from '@/utils/formato'
import { classesDoStatus } from '@/utils/ocupacaoStatus'

/**
 * O que cada nó carrega.
 *
 * Declarado como `type` e não `interface` de propósito: o React Flow exige que
 * os dados do nó sejam atribuíveis a `Record<string, unknown>`, e só os tipos
 * literais de objeto ganham o índice implícito que isso requer — uma
 * `interface` não é aceita.
 *
 * `ocupacao` e `status` são anuláveis porque um nó pode existir antes de haver
 * cenário suficiente para calcular: a atividade está no canvas, mas ainda não
 * há demanda nem turno que produzam um número.
 */
export type ActivityNodeData = {
  /** A atividade que este nó representa. */
  atividade: AtividadeFormulario
  /** Ocupação vinda do motor, fração em que 1 é 100%. `null` se não dá para calcular. */
  ocupacao: number | null
  /** A faixa de cor da ocupação. `null` junto com `ocupacao`. */
  status: StatusOcupacao | null
  /** `true` na atividade que o motor aponta como gargalo. */
  isGargalo: boolean
}

/** O tipo de nó registrado no React Flow sob a chave `'atividade'`. */
export type ActivityNodeType = Node<ActivityNodeData, 'atividade'>

/** Largura fixa do cartão, em pixels. A altura acompanha o conteúdo. */
const LARGURA = 176

/** Bolinha de conexão nas laterais do cartão. */
const ESTILO_HANDLE = {
  width: 8,
  height: 8,
  background: '#ffffff',
  border: '2px solid var(--color-yellow)',
  borderRadius: '9999px',
} as const

export function ActivityNode({ data, selected }: NodeProps<ActivityNodeType>) {
  const { atividade, ocupacao, status, isGargalo } = data
  const cores = status === null ? null : classesDoStatus(status)

  return (
    <div
      style={{
        width: LARGURA,
        // A faixa superior é a leitura mais rápida do cartão: diz o status
        // antes de o olho chegar ao número.
        borderTop: `4px solid ${corDoStatus(status)}`,
        background: isGargalo ? 'var(--color-node-gargalo-bg)' : '#ffffff',
        ...(isGargalo
          ? {
              border: '1px solid var(--color-status-acima)',
              borderTop: '4px solid var(--color-status-acima)',
              boxShadow:
                '0 0 0 1px var(--color-status-acima), 0 4px 12px rgba(209,59,46,0.18)',
            }
          : {}),
        ...(selected === true
          ? {
              outline: '2px solid var(--color-node-selected-outline)',
              outlineOffset: 2,
            }
          : {}),
      }}
      className="relative"
    >
      <Handle type="target" position={Position.Left} style={ESTILO_HANDLE} />

      {isGargalo && (
        <span className="absolute -top-px right-0 bg-status-acima px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          Gargalo
        </span>
      )}

      <div className="px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          #{codigoDaAtividade(atividade)}
        </p>

        <p className="mt-0.5 truncate text-[12.5px] font-bold uppercase leading-tight text-dark">
          {atividade.descricao || 'Sem nome'}
        </p>

        <p className="mt-0.5 text-[10px] text-muted">
          {formatarEtapaLinha(atividade.etapa, atividade.linha)}
        </p>

        {ocupacao === null || cores === null ? (
          <p className="mt-2.5 text-[10px] text-muted">Sem cálculo</p>
        ) : (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-[#EDE9E2]">
              <div
                className={`h-full ${cores.barra}`}
                style={{ width: `${Math.min(1, Math.max(0, ocupacao)) * 100}%` }}
              />
            </div>
            <span
              className={`text-[12px] font-bold ${
                status === 'acima' ? 'text-status-acima' : 'text-dark'
              }`}
            >
              {formatarPorcentagem(ocupacao)}
            </span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={ESTILO_HANDLE} />
    </div>
  )
}

/**
 * A cor da faixa superior.
 *
 * Sem status — cenário ainda insuficiente —, a faixa fica na cor de borda
 * neutra: o cartão não finge saber de uma ocupação que não foi calculada.
 */
function corDoStatus(status: StatusOcupacao | null): string {
  if (status === 'acima') return 'var(--color-status-acima)'
  if (status === 'atencao') return 'var(--color-status-atencao)'
  if (status === 'ok') return 'var(--color-status-ok)'
  return 'var(--color-line)'
}
