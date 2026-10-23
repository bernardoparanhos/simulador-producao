/**
 * Tela 4B — Drawer de cadastro e edição de atividade. MODO DADOS.
 *
 * Painel que desliza pela direita sobre a lista, com a lista escurecida atrás.
 * O drawer foi escolhido em vez de uma tela própria para manter o contexto: a
 * pessoa vê a linha que está editando e as outras ao redor, e o impacto da
 * mudança aparece na prévia sem precisar salvar.
 *
 * O formulário é **local** até o botão Salvar. Fechar no × , no Cancelar ou
 * clicando no véu descarta tudo — editar uma atividade não pode alterar a
 * lista enquanto a pessoa ainda está decidindo.
 */

import { useEffect, useState } from 'react'

import { usePreviewAtividade } from '@/hooks/usePreviewAtividade'
import { ATIVIDADE_NOVA, novoId } from '@/state'
import type { AtividadeFormulario } from '@/state'
import { codigoDaAtividade, formatarMinutos, formatarPorcentagem } from '@/utils/formato'
import { classesDoStatus } from '@/utils/ocupacaoStatus'

import { BarraOcupacao } from './BarraOcupacao'
import { CampoNumero, CampoTexto, TituloSecao } from './Campo'

export interface AtividadeDrawerProps {
  /**
   * A atividade a editar, ou `null` para criar uma nova.
   *
   * O drawer só aparece quando esta prop muda de `undefined` para algo: quem
   * controla a abertura é a página.
   */
  atividade: AtividadeFormulario | null
  /** Fecha sem salvar. */
  aoFechar: () => void
  /** Salva e fecha. Recebe a atividade completa, com `id`. */
  aoSalvar: (atividade: AtividadeFormulario) => void
}

/** O painel de edição. */
export function AtividadeDrawer({ atividade, aoFechar, aoSalvar }: AtividadeDrawerProps) {
  const ehEdicao = atividade !== null

  /*
   * O rascunho nasce da atividade recebida e nunca é ressincronizado por
   * efeito: quem abre o drawer passa uma `key` ligada à atividade, então
   * trocar de atividade remonta o componente e este inicializador roda de
   * novo. É o caminho que o React recomenda para reiniciar estado, e evita o
   * render em cascata de um `setState` dentro de `useEffect`.
   */
  const [rascunho, setRascunho] = useState<AtividadeFormulario>(
    () => atividade ?? { id: novoId(), ...ATIVIDADE_NOVA },
  )

  // Esc fecha, como em qualquer painel modal.
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') aoFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  const alterar = <C extends keyof AtividadeFormulario>(
    campo: C,
    valor: AtividadeFormulario[C],
  ) => {
    setRascunho((atual) => ({ ...atual, [campo]: valor }))
  }

  const titulo = ehEdicao
    ? `${codigoDaAtividade(rascunho)} · ${rascunho.descricao || 'Sem nome'}`
    : 'Nova atividade'

  return (
    <>
      {/* Véu: escurece a lista e fecha o drawer ao clique. */}
      <button
        type="button"
        onClick={aoFechar}
        aria-label="Fechar o painel"
        className="fixed inset-0 z-40 cursor-default bg-[var(--color-scrim)]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ehEdicao ? 'Editar atividade' : 'Nova atividade'}
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[540px] flex-col bg-white motion-safe:animate-[deslizar_200ms_ease-out]"
      >
        <CabecalhoDrawer titulo={titulo} ehEdicao={ehEdicao} aoFechar={aoFechar} />

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <section>
            <TituloSecao marcador="quadrado">Identificação</TituloSecao>

            <div className="space-y-4">
              <CampoTexto
                rotulo="Nome / descrição"
                valor={rascunho.descricao}
                aoAlterar={(valor) => alterar('descricao', valor)}
                placeholder="Ex.: Encaixar S8"
              />

              <div className="grid grid-cols-2 gap-4">
                <CampoNumero
                  rotulo="Etapa"
                  valor={rascunho.etapa}
                  aoAlterar={(valor) => alterar('etapa', valor)}
                  minimo={1}
                />
                <CampoNumero
                  rotulo="Linha"
                  valor={rascunho.linha}
                  aoAlterar={(valor) => alterar('linha', valor)}
                  minimo={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CampoNumero
                  rotulo="Processo"
                  valor={rascunho.processo}
                  aoAlterar={(valor) => alterar('processo', valor)}
                  minimo={1}
                  ajuda="Opcional — não entra no cálculo"
                />
              </div>
            </div>
          </section>

          <section className="mt-7">
            <TituloSecao marcador="circulo">Tempos e fatores</TituloSecao>

            <div className="space-y-4">
              <CampoNumero
                rotulo="Tempo cronometrado (min)"
                valor={rascunho.tempoCronometradoMin}
                aoAlterar={(valor) => alterar('tempoCronometradoMin', valor)}
                minimo={0}
                passo={0.01}
                destacado
              />

              <div className="grid grid-cols-2 gap-4">
                <CampoNumero
                  rotulo="Fator de ritmo (%)"
                  valor={rascunho.fatorRitmo}
                  aoAlterar={(valor) => alterar('fatorRitmo', valor)}
                  minimo={1}
                  sufixo="%"
                />
                <CampoNumero
                  rotulo="Tolerância (%)"
                  valor={rascunho.fatorTolerancia}
                  aoAlterar={(valor) => alterar('fatorTolerancia', valor)}
                  minimo={0}
                  sufixo="%"
                />
              </div>

              <CampoNumero
                rotulo="Setup por lote (min)"
                valor={rascunho.setupMin}
                aoAlterar={(valor) => alterar('setupMin', valor)}
                minimo={0}
                passo={0.1}
              />
            </div>
          </section>

          <section className="mt-7">
            <TituloSecao marcador="triangulo">Prévia do resultado · ao vivo</TituloSecao>
            <CardPrevia atividade={rascunho} />
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={aoFechar}
            className="border border-line px-5 py-3 text-sm text-dark transition-colors hover:border-dark"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => aoSalvar(rascunho)}
            className="bg-yellow px-6 py-3 text-sm font-bold text-dark transition-colors hover:bg-yellow-deep"
          >
            Salvar atividade
          </button>
        </footer>
      </aside>
    </>
  )
}

/** A barra escura do topo do drawer. */
function CabecalhoDrawer({
  titulo,
  ehEdicao,
  aoFechar,
}: {
  titulo: string
  ehEdicao: boolean
  aoFechar: () => void
}) {
  return (
    <header className="flex items-stretch bg-dark">
      {/* As duas faixas da identidade, agora empilhadas na aresta. */}
      <div className="w-1 shrink-0 bg-yellow" aria-hidden="true" />
      <div className="w-[3px] shrink-0 bg-orange" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-4 px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange">
            {ehEdicao ? 'Editar atividade' : 'Nova atividade'}
          </p>
          <h2 className="mt-0.5 truncate text-base font-bold text-white">{titulo}</h2>
        </div>

        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="shrink-0 p-1 text-white/80 transition-colors hover:text-white"
        >
          <svg viewBox="0 0 16 16" className="h-5 w-5 stroke-current" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}

/**
 * O card de prévia.
 *
 * Os números saem do motor, não de uma conta repetida aqui — ver
 * `usePreviewAtividade`.
 */
function CardPrevia({ atividade }: { atividade: AtividadeFormulario }) {
  const previa = usePreviewAtividade(atividade)

  if (previa === null) {
    return (
      <div className="border-l-4 border-l-yellow bg-preview-bg px-5 py-4">
        <p className="text-xs text-muted">
          Informe o tempo cronometrado — e preencha o Cenário primeiro — para ver a
          prévia.
        </p>
      </div>
    )
  }

  return (
    <div className="border-l-4 border-l-yellow bg-preview-bg px-5 py-4">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <ValorPrevia rotulo="Tempo padrão" valor={formatarMinutos(previa.tempoPadraoMin)} unidade="min" />
        <ValorPrevia rotulo="Tempo de ciclo" valor={formatarMinutos(previa.tempoCicloMin)} unidade="min" />

        <div className="text-right">
          <p className="text-[11px] text-muted">Ocupação</p>
          <p className={`text-xl font-bold leading-tight ${classesDoStatus(previa.status).texto}`}>
            {formatarPorcentagem(previa.ocupacao)}
          </p>
        </div>
      </div>

      <BarraOcupacao
        ocupacao={previa.ocupacao}
        status={previa.status}
        className="mt-3 h-2 w-full"
      />

      {previa.status === 'acima' && (
        <p className="mt-2.5 text-xs text-status-acima">
          Acima de 100% — esta atividade seria o gargalo da linha.
        </p>
      )}
    </div>
  )
}

/** Um par rótulo/valor do card de prévia. */
function ValorPrevia({
  rotulo,
  valor,
  unidade,
}: {
  rotulo: string
  valor: string
  unidade: string
}) {
  return (
    <div>
      <p className="text-[11px] text-muted">{rotulo}</p>
      <p className="text-xl font-bold leading-tight text-dark">
        {valor} <span className="text-xs font-medium text-muted">{unidade}</span>
      </p>
    </div>
  )
}
