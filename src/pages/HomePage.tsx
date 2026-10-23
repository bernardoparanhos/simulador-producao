/**
 * Página inicial — placeholder institucional da Fase 0.
 * Existe para validar fonte, Tailwind e deploy. Será substituída
 * pela tela do simulador nas fases seguintes.
 */
export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-grafite-400">
          UTFPR Medianeira · Engenharia de Produção
        </p>

        <h1 className="mt-5 text-4xl font-semibold leading-tight text-grafite-900 sm:text-5xl">
          Simulador de Produção
        </h1>

        <p className="mt-5 text-lg font-light leading-relaxed text-grafite-600">
          Ferramenta de apoio ao ensino de Planejamento e Controle da Produção.
          Em construção.
        </p>

        <div className="mt-10 flex items-center gap-3 border-t border-grafite-200 pt-6">
          <span className="inline-block size-2 rounded-full bg-acento-500" />
          <span className="text-sm text-grafite-400">
            Fase 0 — fundação do projeto
          </span>
        </div>
      </div>
    </main>
  )
}
