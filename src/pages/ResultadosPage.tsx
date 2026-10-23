/**
 * Tela 6 — Resultados. MODO DADOS.
 *
 * Placeholder da Fase 6. A rota existe para que o botão "Ver resultados" do
 * construtor de sequência leve a algum lugar, e para mostrar o que já está
 * calculado enquanto o painel de verdade não existe.
 */

import { Link } from 'react-router-dom'

import { FormasDados } from '@/components/Formas'
import { HeaderSimulador } from '@/components/HeaderSimulador'
import { simular } from '@/engine'
import { useAtividades, useCenario, useSequencia } from '@/state'
import { formatarInteiro, formatarMinutos, formatarPorcentagem } from '@/utils/formato'

export function ResultadosPage() {
  const { cenario } = useCenario()
  const { atividades } = useAtividades()
  const { sequencia } = useSequencia()

  const { global } = simular({ cenario, atividades, sequencia })

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSimulador passoAtivo={4} />

      <main className="relative flex-1 overflow-hidden bg-light-bg">
        <FormasDados />

        <div className="relative mx-auto w-full max-w-[1100px] px-6 py-9 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-dark">Resultados</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-orange">
            O painel com gráficos entra na Fase 6. Por ora, os indicadores globais que o
            motor já devolve para o fluxo montado.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
            <Indicador rotulo="Tempo disponível" valor={`${formatarInteiro(global.tempoDisponivelMin)} min`} />
            <Indicador rotulo="Eficiência total" valor={formatarPorcentagem(global.eficienciaTotal)} />
            <Indicador rotulo="Ocupação média" valor={formatarPorcentagem(global.ocupacaoMedia)} />
            <Indicador rotulo="Lead time" valor={`${formatarMinutos(global.leadTimeMin)} min`} />
            <Indicador rotulo="WIP" valor={`${formatarInteiro(global.wipPecas)} un.`} />
            <Indicador
              rotulo="Gargalo"
              valor={global.gargaloAtividadeId ?? '—'}
            />
          </dl>

          <Link
            to="/sequencia"
            className="mt-8 inline-block border border-line px-5 py-3 text-sm text-dark transition-colors hover:border-dark"
          >
            Voltar para a Sequência
          </Link>
        </div>
      </main>
    </div>
  )
}

/** Um indicador da grade. */
function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <dt className="text-[10px] uppercase tracking-[0.1em] text-muted">{rotulo}</dt>
      <dd className="mt-1 text-xl font-bold text-dark">{valor}</dd>
    </div>
  )
}
