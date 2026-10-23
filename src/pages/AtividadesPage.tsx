/**
 * Tela 4 — Atividades. MODO DADOS.
 *
 * Placeholder da Fase 4. A rota existe para que o botão "Avançar para
 * Atividades" da tela de Cenário leve a algum lugar, e para que o cenário
 * recém-preenchido possa ser conferido de olho antes de a tela de verdade
 * existir.
 */

import { Link } from 'react-router-dom'

import { FormasDados } from '@/components/Formas'
import { HeaderSimulador } from '@/components/HeaderSimulador'
import { useCenario } from '@/state'

export function AtividadesPage() {
  const { cenario } = useCenario()

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSimulador passoAtivo={2} />

      <main className="relative flex-1 overflow-hidden bg-light-bg">
        <FormasDados />

        <div className="relative mx-auto w-full max-w-[1100px] px-6 py-9 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-dark">Atividades</h1>
          <p className="mt-2 text-[13px] text-orange">
            Esta tela entra na Fase 4. Por ora, o cenário salvo no passo anterior:
          </p>

          <pre className="mt-7 overflow-x-auto border border-line bg-white p-5 text-xs leading-relaxed text-dark">
            {JSON.stringify(cenario, null, 2)}
          </pre>

          <Link
            to="/cenario"
            className="mt-7 inline-block border border-line px-5 py-3 text-sm text-dark transition-colors hover:border-dark"
          >
            Voltar para o Cenário
          </Link>
        </div>
      </main>
    </div>
  )
}
