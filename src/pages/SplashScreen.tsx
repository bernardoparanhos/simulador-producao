/**
 * Tela 1 — Splash. MODO PRESENÇA.
 *
 * A abertura institucional: marca, nome do sistema e uma barra de progresso
 * que leva à página de entrada. Dura {@link DURACAO_MS} e não tem interação —
 * é a tela que o professor vê ao projetar, antes de começar.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FormasPresenca } from '@/components/Formas'
import { MarcaInstitucional } from '@/components/MarcaInstitucional'

/** Quanto dura a abertura, em milissegundos. */
const DURACAO_MS = 2500

/** De quanto em quanto tempo a barra avança. */
const PASSO_MS = 40

export function SplashScreen() {
  const navigate = useNavigate()
  const [progresso, setProgresso] = useState(0)

  useEffect(() => {
    const inicio = performance.now()

    const intervalo = window.setInterval(() => {
      const fracao = Math.min(1, (performance.now() - inicio) / DURACAO_MS)
      setProgresso(fracao)

      if (fracao === 1) {
        window.clearInterval(intervalo)
        // `replace` para que o botão voltar não traga a abertura de volta.
        navigate('/entrada', { replace: true })
      }
    }, PASSO_MS)

    return () => window.clearInterval(intervalo)
  }, [navigate])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark px-6">
      <FormasPresenca />

      <div className="relative flex flex-col items-center text-center">
        <MarcaInstitucional tamanho="grande" />

        <h1 className="mt-10 text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl">
          Simulador de <span className="text-yellow">Produção</span>
        </h1>

        <p className="mt-3 text-[13px] tracking-[0.18em] text-white/80">
          UTFPR MEDIANEIRA · ENGENHARIA DE PRODUÇÃO
        </p>

        <div
          className="mt-12 h-[3px] w-56 bg-white/15"
          role="progressbar"
          aria-label="Carregando simulação"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progresso * 100)}
        >
          <div
            className="h-full bg-yellow transition-[width] duration-100 ease-linear"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>

        <p className="mt-4 flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/70">
          <PontosDeCarga progresso={progresso} />
          CARREGANDO SIMULAÇÃO
        </p>
      </div>
    </main>
  )
}

/**
 * Os três quadradinhos à esquerda do texto de carregamento.
 *
 * Acendem um a um conforme o progresso avança — a mesma informação da barra,
 * dita na linguagem geométrica da identidade.
 */
function PontosDeCarga({ progresso }: { progresso: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((indice) => (
        <span
          key={indice}
          className={
            progresso >= (indice + 1) / 3
              ? 'h-1.5 w-1.5 bg-yellow transition-colors'
              : 'h-1.5 w-1.5 bg-white/30 transition-colors'
          }
        />
      ))}
    </span>
  )
}
