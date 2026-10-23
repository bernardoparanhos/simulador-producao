/**
 * Tela 4A — Lista de Atividades. MODO DADOS.
 *
 * O segundo dos quatro passos: cada operação da linha, com o que o motor
 * deduz dela. A tela não pede tempo de ciclo nem ocupação — ela os **mostra**,
 * recalculados a cada mudança, e aponta qual atividade trava a cadência.
 *
 * É aqui que o sistema começa a fazer o que a planilha não fazia: ver o
 * gargalo mudar de lugar enquanto se mexe num tempo, sem apertar nada.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AtividadeDrawer } from '@/components/AtividadeDrawer'
import { BarraOcupacao } from '@/components/BarraOcupacao'
import { FormasDados } from '@/components/Formas'
import { HeaderSimulador } from '@/components/HeaderSimulador'
import { simular } from '@/engine'
import { useAtividades, useCenario } from '@/state'
import type { AtividadeFormulario } from '@/state'
import type { ResultadoPorAtividade } from '@/types'
import {
  codigoDaAtividade,
  formatarEtapaLinha,
  formatarMinutos,
  formatarOrdem,
  formatarPorcentagem,
} from '@/utils/formato'
import { classesDoStatus, getStatusOcupacao } from '@/utils/ocupacaoStatus'

/**
 * Como o drawer está aberto.
 *
 * `null` é fechado; `{ atividade: null }` é "nova"; `{ atividade: X }` é
 * edição. Um estado só, em vez de um booleano mais uma atividade selecionada —
 * que permitiria o par incoerente "aberto, sem atividade e sem ser nova".
 */
type EstadoDrawer = { atividade: AtividadeFormulario | null } | null

export function AtividadesPage() {
  const navigate = useNavigate()
  const { cenario } = useCenario()
  const { atividades, adicionar, atualizar } = useAtividades()
  const [drawer, setDrawer] = useState<EstadoDrawer>(null)

  /*
   * O motor roda a cada mudança de cenário ou de atividade. É barato: são
   * dezenas de atividades, não milhares, e `simular` é uma função pura sem
   * efeito colateral. Rodar aqui, e não guardar o resultado no estado, garante
   * que a tela nunca mostre número velho.
   *
   * A sequência vai vazia porque ela é o passo 3: sem conexões, nenhuma
   * atividade tem predecessora e a produção de cada uma é a própria capacidade.
   */
  const { global, porAtividade } = useMemo(
    () => simular({ cenario, atividades, sequencia: { nos: [], conexoes: [] } }),
    [cenario, atividades],
  )

  const resultadoPorId = useMemo(
    () => new Map(porAtividade.map((resultado) => [resultado.atividadeId, resultado])),
    [porAtividade],
  )

  const gargalo = atividades.find((item) => item.id === global.gargaloAtividadeId) ?? null
  const ocupacaoGargalo =
    global.gargaloAtividadeId === null
      ? null
      : (resultadoPorId.get(global.gargaloAtividadeId)?.ocupacao ?? null)

  const salvar = (atividade: AtividadeFormulario) => {
    const jaExiste = atividades.some((item) => item.id === atividade.id)
    if (jaExiste) atualizar(atividade)
    else adicionar(atividade)
    setDrawer(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSimulador passoAtivo={2} />

      <main className="relative flex flex-1 flex-col overflow-hidden bg-light-bg">
        <FormasDados />

        <div className="relative mx-auto w-full max-w-[1100px] flex-1 px-6 py-9 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-dark">Atividades</h1>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-orange">
                Cadastre cada operação da linha. O motor calcula tempo de ciclo, ocupação
                e gargalo automaticamente.
              </p>
            </div>

            <CardGargalo atividade={gargalo} ocupacao={ocupacaoGargalo} />
          </div>

          <div className="mt-8">
            {atividades.length === 0 ? (
              <ListaVazia />
            ) : (
              <TabelaAtividades
                atividades={atividades}
                resultadoPorId={resultadoPorId}
                idGargalo={global.gargaloAtividadeId}
                aoEditar={(atividade) => setDrawer({ atividade })}
              />
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setDrawer({ atividade: null })}
              className="bg-yellow px-6 py-3 text-sm font-bold text-dark transition-colors hover:bg-yellow-deep"
            >
              + Adicionar atividade
            </button>
          </div>
        </div>

        <RodapeAcoes
          quantidade={atividades.length}
          ocupacaoGargalo={ocupacaoGargalo}
          aoVoltar={() => navigate('/cenario')}
          aoAvancar={() => navigate('/sequencia')}
        />
      </main>

      {drawer !== null && (
        <AtividadeDrawer
          // Remonta o drawer a cada atividade: é assim que o rascunho interno
          // se reinicia, sem efeito de sincronização.
          key={drawer.atividade?.id ?? 'nova'}
          atividade={drawer.atividade}
          aoFechar={() => setDrawer(null)}
          aoSalvar={salvar}
        />
      )}
    </div>
  )
}

/**
 * O card que aponta a atividade gargalo.
 *
 * Fica no alto, antes da lista, porque é a resposta que a tela existe para
 * dar: de todas as operações, qual é a que limita a linha.
 */
function CardGargalo({
  atividade,
  ocupacao,
}: {
  atividade: AtividadeFormulario | null
  ocupacao: number | null
}) {
  if (atividade === null || ocupacao === null) {
    return (
      <div className="border border-line border-l-4 border-l-line bg-white px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange">
          Gargalo atual
        </p>
        <p className="mt-1.5 text-sm text-muted">Nenhuma atividade ainda</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-8 border border-line border-l-4 border-l-status-acima bg-white px-5 py-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange">
          Gargalo atual
        </p>
        <p className="mt-1.5 truncate text-[15px] font-bold text-dark">
          {codigoDaAtividade(atividade)} · {atividade.descricao || 'Sem nome'}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatarEtapaLinha(atividade.etapa, atividade.linha)} · trava a cadência da linha
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[28px] font-bold leading-none text-status-acima">
          {formatarPorcentagem(ocupacao)}
        </p>
        <p className="mt-1 text-[11px] text-muted">ocupação</p>
      </div>
    </div>
  )
}

/** A lista, uma linha por atividade. */
function TabelaAtividades({
  atividades,
  resultadoPorId,
  idGargalo,
  aoEditar,
}: {
  atividades: readonly AtividadeFormulario[]
  resultadoPorId: ReadonlyMap<string, ResultadoPorAtividade>
  idGargalo: string | null
  aoEditar: (atividade: AtividadeFormulario) => void
}) {
  return (
    <div>
      <div className="grid grid-cols-[56px_1fr_110px_110px_1fr_44px] items-center gap-4 border-b border-line px-4 pb-2.5 text-[11px] uppercase tracking-[0.1em] text-muted">
        <span>Ordem</span>
        <span>Atividade</span>
        <span>Etapa·Linha</span>
        <span>Ciclo</span>
        <span>Ocupação</span>
        <span className="sr-only">Editar</span>
      </div>

      <ul>
        {atividades.map((atividade, indice) => (
          <LinhaAtividade
            key={atividade.id}
            atividade={atividade}
            indice={indice}
            resultado={resultadoPorId.get(atividade.id)}
            ehGargalo={atividade.id === idGargalo}
            aoEditar={() => aoEditar(atividade)}
          />
        ))}
      </ul>
    </div>
  )
}

/** Uma atividade da lista, com o que o motor deduziu dela. */
function LinhaAtividade({
  atividade,
  indice,
  resultado,
  ehGargalo,
  aoEditar,
}: {
  atividade: AtividadeFormulario
  indice: number
  resultado: ResultadoPorAtividade | undefined
  ehGargalo: boolean
  aoEditar: () => void
}) {
  const ocupacao = resultado?.ocupacao ?? 0
  const status = getStatusOcupacao(ocupacao)

  return (
    <li
      className={`mt-2 grid grid-cols-[56px_1fr_110px_110px_1fr_44px] items-center gap-4 border border-line bg-white px-4 py-3.5 ${
        ehGargalo ? 'border-l-[3px] border-l-status-acima' : ''
      }`}
    >
      <span className="text-xl font-medium text-[#D0CBC2]">{formatarOrdem(indice)}</span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[13px] font-bold uppercase tracking-wide text-dark">
            {atividade.descricao || 'Sem nome'}
          </span>
          {ehGargalo && (
            <span className="bg-status-acima px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Gargalo
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted">#{codigoDaAtividade(atividade)}</span>
      </div>

      <span className="text-xs text-muted">
        {formatarEtapaLinha(atividade.etapa, atividade.linha)}
      </span>

      <span className="text-[13px] text-dark">
        {formatarMinutos(resultado?.tempoCicloMin ?? 0)}{' '}
        <span className="text-[11px] text-muted">min</span>
      </span>

      <div className="flex items-center gap-3">
        <BarraOcupacao ocupacao={ocupacao} status={status} className="h-2 flex-1" />
        <span className={`w-14 text-right text-xs font-bold ${classesDoStatus(status).texto}`}>
          {formatarPorcentagem(ocupacao)}
        </span>
      </div>

      <button
        type="button"
        onClick={aoEditar}
        aria-label={`Editar ${atividade.descricao || 'atividade'}`}
        className="justify-self-end p-1.5 text-muted transition-colors hover:text-dark"
      >
        <IconeLapis />
      </button>
    </li>
  )
}

/** O que a tela mostra antes da primeira atividade. */
function ListaVazia() {
  return (
    <div className="border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <p className="text-sm font-medium text-dark">Nenhuma atividade cadastrada</p>
      <p className="mt-1.5 text-xs text-muted">Adicione a primeira atividade para começar.</p>
    </div>
  )
}

/** A faixa de ações no pé da tela. */
function RodapeAcoes({
  quantidade,
  ocupacaoGargalo,
  aoVoltar,
  aoAvancar,
}: {
  quantidade: number
  ocupacaoGargalo: number | null
  aoVoltar: () => void
  aoAvancar: () => void
}) {
  const resumo =
    quantidade === 0
      ? 'Nenhuma atividade cadastrada'
      : `${quantidade} ${quantidade === 1 ? 'atividade' : 'atividades'}${
          ocupacaoGargalo === null
            ? ''
            : ` · gargalo em ${formatarPorcentagem(ocupacaoGargalo)} de ocupação`
        }`

  return (
    <div className="relative border-t border-line bg-light-bg">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <p className="text-xs text-muted">{resumo}</p>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={aoVoltar}
            className="text-sm text-dark transition-colors hover:text-muted"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={aoAvancar}
            className="bg-yellow px-6 py-3 text-sm font-bold text-dark transition-colors hover:bg-yellow-deep"
          >
            Avançar para Sequência
          </button>
        </div>
      </div>
    </div>
  )
}

/** Lápis de editar. Desenhado aqui para não trazer uma biblioteca por um ícone. */
function IconeLapis() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.5 1.8a1.7 1.7 0 0 1 2.4 2.4L5 13.1l-3.2.9.9-3.2 8.8-9z" />
      <path d="M10.3 3l2.7 2.7" />
    </svg>
  )
}
