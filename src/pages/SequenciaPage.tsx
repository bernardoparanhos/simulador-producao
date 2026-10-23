/**
 * Tela 5 — Sequência. MODO DADOS.
 *
 * Placeholder da Fase 5. A rota existe para que o botão "Avançar para
 * Sequência" leve a algum lugar, e para dar a dimensão do que falta: é aqui
 * que mora a melhoria central do projeto — o fluxo que dirige o cálculo.
 */

import { Link } from 'react-router-dom'

import { FormasDados } from '@/components/Formas'
import { HeaderSimulador } from '@/components/HeaderSimulador'
import { useAtividades } from '@/state'

export function SequenciaPage() {
  const { atividades } = useAtividades()

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSimulador passoAtivo={3} />

      <main className="relative flex-1 overflow-hidden bg-light-bg">
        <FormasDados />

        <div className="relative mx-auto w-full max-w-[1100px] px-6 py-9 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-dark">Sequência</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-orange">
            Esta tela entra na Fase 5. Aqui as {atividades.length} atividades cadastradas
            vão virar um fluxo, e o fluxo vai dirigir o cálculo do gargalo.
          </p>

          <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted">
            Enquanto a sequência não existe, nenhuma atividade tem predecessora, então
            cada uma produz a própria capacidade. É exatamente o comportamento da
            planilha original — e é o que o construtor de fluxo vem corrigir.
          </p>

          <Link
            to="/atividades"
            className="mt-7 inline-block border border-line px-5 py-3 text-sm text-dark transition-colors hover:border-dark"
          >
            Voltar para Atividades
          </Link>
        </div>
      </main>
    </div>
  )
}
