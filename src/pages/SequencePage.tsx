/**
 * Tela 5 — Construtor de Sequência. MODO CANVAS.
 *
 * O terceiro dos quatro passos, e a razão de ser do projeto. Na planilha, o
 * fluxograma é um desenho que não alimenta o cálculo: cada atividade aparece
 * produzindo a própria capacidade, como se fosse independente das outras.
 * Aqui, ligar duas atividades muda o número — a produção de quem está a
 * jusante passa a ser limitada por quem alimenta.
 *
 * A tela tem três partes: o canvas escuro onde o fluxo é montado, o painel que
 * detalha o nó selecionado e a barra que leva aos resultados.
 */

import { useCallback, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
} from '@xyflow/react'
import type { Connection, Edge, NodeChange } from '@xyflow/react'
import { useNavigate } from 'react-router-dom'

import '@xyflow/react/dist/style.css'

import { ActivityNode } from '@/components/SequencePage/ActivityNode'
import type { ActivityNodeType } from '@/components/SequencePage/ActivityNode'
import { HeaderSimulador } from '@/components/HeaderSimulador'
import { simular } from '@/engine'
import { posicoesDaSequencia, useAtividades, useCenario, useSequencia } from '@/state'
import type { AtividadeFormulario } from '@/state'
import type { AtividadeId, ResultadoPorAtividade } from '@/types'
import { idDaConexao } from '@/types'
import {
  codigoDaAtividade,
  formatarEtapaLinha,
  formatarMinutos,
  formatarPorcentagem,
} from '@/utils/formato'
import { classesDoStatus } from '@/utils/ocupacaoStatus'

/** Colunas da grade automática ao carregar as atividades. */
const COLUNAS = 4
const PASSO_X = 220
const PASSO_Y = 160

/**
 * O mapa de tipos do React Flow.
 *
 * Fora do componente de propósito: recriar este objeto a cada render faria o
 * React Flow remontar todos os nós, e o canvas piscaria a cada arrasto.
 */
const TIPOS_DE_NO = { atividade: ActivityNode }

export function SequencePage() {
  const navigate = useNavigate()
  const { cenario } = useCenario()
  const { atividades } = useAtividades()
  const { sequencia, setNodePositions, updateNodePosition, addEdge, removeEdgesForNode } =
    useSequencia()

  const [noSelecionadoId, setNoSelecionadoId] = useState<AtividadeId | null>(null)

  /*
   * O motor roda a cada mudança, dentro de um `useMemo`, e o resultado **não**
   * vai para o estado. Guardá-lo num `useState` alimentado por efeito — como
   * seria o caminho óbvio — significa um render a mais por mudança e a chance
   * de a tela mostrar número velho por um quadro. É o mesmo padrão da tela de
   * Atividades, e o que o `oxlint` cobra ao apontar `set-state-in-effect`.
   *
   * A sequência vai inteira: é ela que faz o gargalo propagar.
   */
  const { global, porAtividade } = useMemo(
    () => simular({ cenario, atividades, sequencia }),
    [cenario, atividades, sequencia],
  )

  const atividadePorId = useMemo(
    () => new Map(atividades.map((atividade) => [atividade.id, atividade])),
    [atividades],
  )

  const resultadoPorId = useMemo(
    () => new Map(porAtividade.map((resultado) => [resultado.atividadeId, resultado])),
    [porAtividade],
  )

  /*
   * Os nós do canvas, montados a partir dos três contextos.
   *
   * Um nó cuja atividade foi apagada no passo 2 é descartado: é o caso órfão
   * que a Parada P3 vigia, e desenhar um cartão sem dados seria pior do que
   * não desenhar.
   */
  const nos = useMemo<ActivityNodeType[]>(() => {
    return posicoesDaSequencia(sequencia).flatMap((posicao) => {
      const atividade = atividadePorId.get(posicao.id)
      if (atividade === undefined) return []

      const resultado = resultadoPorId.get(posicao.id)

      return [
        {
          id: posicao.id,
          type: 'atividade' as const,
          position: { x: posicao.x, y: posicao.y },
          selected: posicao.id === noSelecionadoId,
          data: {
            atividade,
            ocupacao: resultado?.ocupacao ?? null,
            status: resultado?.statusOcupacao ?? null,
            isGargalo: posicao.id === global.gargaloAtividadeId,
          },
        },
      ]
    })
  }, [sequencia, atividadePorId, resultadoPorId, global.gargaloAtividadeId, noSelecionadoId])

  const ligacoes = useMemo<Edge[]>(
    () =>
      sequencia.conexoes.map((conexao) => ({
        id: conexao.id,
        source: conexao.origem,
        target: conexao.destino,
        style: { stroke: 'var(--color-edge)', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F5C400' },
      })),
    [sequencia.conexoes],
  )

  const aoMudarNos = useCallback(
    (mudancas: NodeChange<ActivityNodeType>[]) => {
      for (const mudanca of mudancas) {
        if (mudanca.type === 'position' && mudanca.position !== undefined) {
          updateNodePosition(mudanca.id, mudanca.position.x, mudanca.position.y)
        }
      }
    },
    [updateNodePosition],
  )

  const aoConectar = useCallback(
    (ligacao: Connection) => {
      addEdge({
        id: idDaConexao(ligacao.source, ligacao.target),
        origem: ligacao.source,
        destino: ligacao.target,
      })
    },
    [addEdge],
  )

  const carregarAtividades = useCallback(() => {
    setNodePositions(
      atividades.map((atividade, indice) => ({
        id: atividade.id,
        x: (indice % COLUNAS) * PASSO_X,
        y: Math.floor(indice / COLUNAS) * PASSO_Y,
      })),
    )
  }, [atividades, setNodePositions])

  const atividadeSelecionada =
    noSelecionadoId === null ? null : (atividadePorId.get(noSelecionadoId) ?? null)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HeaderSimulador passoAtivo={3} />

      <main className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 bg-canvas-bg">
          <ReactFlow
            nodes={nos}
            edges={ligacoes}
            nodeTypes={TIPOS_DE_NO}
            onNodesChange={aoMudarNos}
            onConnect={aoConectar}
            onNodeClick={(_, no) => setNoSelecionadoId(no.id)}
            onPaneClick={() => setNoSelecionadoId(null)}
            fitView
            proOptions={{ hideAttribution: false }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="rgba(255,255,255,0.07)"
              gap={24}
              size={1.5}
            />
            <Controls />
          </ReactFlow>

          {sequencia.nos.length === 0 && (
            <CanvasVazio
              temAtividades={atividades.length > 0}
              aoCarregar={carregarAtividades}
              aoIrParaAtividades={() => navigate('/atividades')}
            />
          )}
        </div>

        <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-panel-border bg-white">
          {atividadeSelecionada === null ? (
            <PainelVazio />
          ) : (
            <PainelDoNo
              atividade={atividadeSelecionada}
              resultado={resultadoPorId.get(atividadeSelecionada.id)}
              ehGargalo={atividadeSelecionada.id === global.gargaloAtividadeId}
              conexoes={sequencia.conexoes}
              atividadePorId={atividadePorId}
              aoRemoverConexoes={() => {
                removeEdgesForNode(atividadeSelecionada.id)
                setNoSelecionadoId(null)
              }}
            />
          )}
        </aside>
      </main>

      <RodapeSequencia
        quantidadeDeConexoes={sequencia.conexoes.length}
        aoVoltar={() => navigate('/atividades')}
        aoVerResultados={() => navigate('/resultados')}
      />
    </div>
  )
}

/**
 * A sobreposição do canvas sem nós.
 *
 * Não é só um aviso: carrega o botão que resolve o problema. Sem atividades
 * cadastradas, aponta para o passo anterior em vez de oferecer um botão que
 * não faria nada.
 */
function CanvasVazio({
  temAtividades,
  aoCarregar,
  aoIrParaAtividades,
}: {
  temAtividades: boolean
  aoCarregar: () => void
  aoIrParaAtividades: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
      <IlustracaoFluxo />

      <h2 className="mt-7 text-xl font-bold text-white">Monte o fluxo de produção</h2>

      <p className="mt-2 max-w-[400px] text-[13px] leading-relaxed text-muted">
        {temAtividades
          ? 'As atividades cadastradas aparecem aqui. Arraste-as para o canvas e conecte-as na ordem de produção.'
          : 'Nenhuma atividade cadastrada ainda. Volte ao passo 2 e cadastre as operações da linha.'}
      </p>

      {temAtividades ? (
        <button
          type="button"
          onClick={aoCarregar}
          className="pointer-events-auto mt-7 bg-yellow px-6 py-3 text-sm font-bold text-dark transition-colors hover:bg-yellow-deep"
        >
          Carregar atividades
        </button>
      ) : (
        <button
          type="button"
          onClick={aoIrParaAtividades}
          className="pointer-events-auto mt-7 border border-white/30 px-6 py-3 text-sm text-white transition-colors hover:border-white"
        >
          Ir para Atividades
        </button>
      )}
    </div>
  )
}

/** Três caixas ligadas por setas tracejadas — o fluxo que ainda não existe. */
function IlustracaoFluxo() {
  return (
    <svg viewBox="0 0 240 60" className="h-[60px] w-[240px]" aria-hidden="true">
      <g stroke="rgba(255,255,255,0.22)" fill="none" strokeWidth="1.5">
        <rect x="1" y="14" width="62" height="32" />
        <rect x="89" y="14" width="62" height="32" />
        <rect x="177" y="14" width="62" height="32" />
        <path d="M63 30h26" strokeDasharray="4 3" />
        <path d="M151 30h26" strokeDasharray="4 3" />
        <path d="M84 26l5 4-5 4" />
        <path d="M172 26l5 4-5 4" />
      </g>
    </svg>
  )
}

/** O painel antes de qualquer seleção. */
function PainelVazio() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-7 text-center">
      <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
        <g stroke="var(--color-dark)" strokeOpacity="0.3" fill="none" strokeWidth="1.5">
          <rect x="1" y="1" width="26" height="26" />
          <rect x="13" y="13" width="26" height="26" />
        </g>
      </svg>

      <p className="mt-5 text-sm font-bold text-dark">
        Clique em uma atividade para ver detalhes
      </p>
      <p className="mt-2 text-xs leading-relaxed text-orange">
        Arraste entre os pontos de conexão para ligar atividades.
      </p>
    </div>
  )
}

/** O painel do nó selecionado: identidade, números e ligações. */
function PainelDoNo({
  atividade,
  resultado,
  ehGargalo,
  conexoes,
  atividadePorId,
  aoRemoverConexoes,
}: {
  atividade: AtividadeFormulario
  resultado: ResultadoPorAtividade | undefined
  ehGargalo: boolean
  conexoes: readonly { id: string; origem: AtividadeId; destino: AtividadeId }[]
  atividadePorId: ReadonlyMap<AtividadeId, AtividadeFormulario>
  aoRemoverConexoes: () => void
}) {
  const entradas = conexoes.filter((conexao) => conexao.destino === atividade.id)
  const saidas = conexoes.filter((conexao) => conexao.origem === atividade.id)
  const cores = resultado === undefined ? null : classesDoStatus(resultado.statusOcupacao)

  return (
    <div className="flex h-full flex-col">
      <header className="bg-dark px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange">
          Nó selecionado
        </p>
        <h2 className="mt-1 text-[17px] font-bold leading-tight text-white">
          {atividade.descricao || 'Sem nome'}
        </h2>
        {ehGargalo && (
          <span className="mt-2 inline-block bg-status-acima px-2 py-[3px] text-[10px] font-bold uppercase tracking-wider text-white">
            Gargalo da linha
          </span>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-4 border-b border-panel-border px-5 py-4">
        <Dado rotulo="Código" valor={`#${codigoDaAtividade(atividade)}`} />
        <Dado rotulo="Etapa · Linha" valor={formatarEtapaLinha(atividade.etapa, atividade.linha)} />
        <Dado
          rotulo="Tempo de ciclo"
          valor={
            resultado === undefined ? '—' : `${formatarMinutos(resultado.tempoCicloMin)} min`
          }
        />
        <Dado
          rotulo="Ocupação"
          valor={resultado === undefined ? '—' : formatarPorcentagem(resultado.ocupacao)}
          classeDoValor={cores?.texto}
        />
      </dl>

      <section className="flex-1 px-5 py-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-dark">
          Conexões
        </h3>

        {entradas.length === 0 && saidas.length === 0 ? (
          <p className="text-xs text-muted">Sem conexões</p>
        ) : (
          <ul className="space-y-3">
            {entradas.map((conexao) => (
              <Ligacao
                key={conexao.id}
                sentido="entrada"
                atividade={atividadePorId.get(conexao.origem)}
              />
            ))}
            {saidas.map((conexao) => (
              <Ligacao
                key={conexao.id}
                sentido="saida"
                atividade={atividadePorId.get(conexao.destino)}
              />
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-panel-border px-5 py-3">
        <button
          type="button"
          onClick={aoRemoverConexoes}
          disabled={entradas.length === 0 && saidas.length === 0}
          className="w-full border border-status-acima bg-white px-4 py-2.5 text-xs font-medium text-status-acima transition-colors hover:bg-status-acima/5 disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-white"
        >
          Remover conexões
        </button>
      </footer>
    </div>
  )
}

/** Um par rótulo/valor da grade do painel. */
function Dado({
  rotulo,
  valor,
  classeDoValor = 'text-dark',
}: {
  rotulo: string
  valor: string
  classeDoValor?: string
}) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.1em] text-muted">{rotulo}</dt>
      <dd className={`mt-0.5 text-[13px] font-bold ${classeDoValor}`}>{valor}</dd>
    </div>
  )
}

/** Uma ligação listada no painel, com o sentido em que ela corre. */
function Ligacao({
  sentido,
  atividade,
}: {
  sentido: 'entrada' | 'saida'
  atividade: AtividadeFormulario | undefined
}) {
  return (
    <li>
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-orange">
        {sentido === 'entrada' ? '← Entrada' : '→ Saída'}
      </p>
      <p className="text-xs text-dark">
        {atividade === undefined
          ? 'Atividade removida'
          : `${codigoDaAtividade(atividade)} · ${atividade.descricao || 'Sem nome'}`}
      </p>
    </li>
  )
}

/** A barra escura no pé da tela. */
function RodapeSequencia({
  quantidadeDeConexoes,
  aoVoltar,
  aoVerResultados,
}: {
  quantidadeDeConexoes: number
  aoVoltar: () => void
  aoVerResultados: () => void
}) {
  const semFluxo = quantidadeDeConexoes === 0

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 bg-dark px-6 py-3">
      <p className="text-xs text-muted">
        {semFluxo
          ? '0 conexões · canvas vazio'
          : `${quantidadeDeConexoes} ${
              quantidadeDeConexoes === 1 ? 'conexão' : 'conexões'
            } · fluxo montado`}
      </p>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={aoVoltar}
          className="text-sm text-white transition-colors hover:text-muted"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={aoVerResultados}
          disabled={semFluxo}
          title={semFluxo ? 'Ligue ao menos duas atividades para ver os resultados' : undefined}
          className="bg-yellow px-6 py-2.5 text-sm font-bold text-dark transition-colors hover:bg-yellow-deep disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40"
        >
          Ver resultados
        </button>
      </div>
    </footer>
  )
}
