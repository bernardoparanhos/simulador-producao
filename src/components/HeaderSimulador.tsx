/**
 * Header do MODO DADOS — a barra escura fixa no topo das telas de trabalho.
 *
 * Carrega a marca, o nome do sistema e os quatro passos do caminho dos dados.
 * Os passos não são só decoração: são o mapa que o plano de construção chama
 * de "passos claros" — em qualquer tela a pessoa vê onde está e o que vem
 * depois.
 *
 * Nesta fase os passos ainda não navegam. Passar para Atividades é o botão do
 * rodapé da tela, para que ninguém pule o cenário antes de preenchê-lo.
 */

import { MarcaInstitucional } from './MarcaInstitucional'

/** Os quatro passos, na ordem do caminho dos dados. */
const PASSOS = [
  { numero: 1, nome: 'Cenário' },
  { numero: 2, nome: 'Atividades' },
  { numero: 3, nome: 'Sequência' },
  { numero: 4, nome: 'Resultados' },
] as const

export interface HeaderSimuladorProps {
  /** Número do passo em que a pessoa está (1 a 4). */
  passoAtivo: (typeof PASSOS)[number]['numero']
}

/** A barra superior das telas MODO DADOS. */
export function HeaderSimulador({ passoAtivo }: HeaderSimuladorProps) {
  return (
    <header className="flex items-stretch bg-dark">
      {/* Barra laranja da aresta esquerda — par da barra amarela da marca. */}
      <div className="w-1 shrink-0 bg-orange" aria-hidden="true" />

      <div className="flex flex-1 flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <MarcaInstitucional tamanho="pequeno" />
          <span className="text-sm font-medium text-white">Simulador de Produção</span>
        </div>

        <nav aria-label="Passos da simulação">
          <ol className="flex items-center gap-1">
            {PASSOS.map((passo) => {
              const ativo = passo.numero === passoAtivo

              return (
                <li key={passo.numero}>
                  <span
                    aria-current={ativo ? 'step' : undefined}
                    className={
                      ativo
                        ? 'block bg-yellow px-4 py-2 text-xs font-bold text-dark'
                        : 'block px-4 py-2 text-xs text-muted'
                    }
                  >
                    {passo.numero} · {passo.nome}
                  </span>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </header>
  )
}
