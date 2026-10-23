/**
 * Marca institucional — o bloco de logos que abre as três telas.
 *
 * Nos frames aprovados ele aparece sempre igual: um cartão branco com uma
 * barra amarela na aresta esquerda, a marca da UTFPR, um divisor vertical e o
 * símbolo do curso de Engenharia de Produção.
 *
 * O cartão é branco em todas as telas, inclusive nas de fundo escuro, e isso é
 * de propósito: a marca da UTFPR é grafite sobre transparente, então sobre o
 * fundo `dark` ela sumiria. O cartão é o que a torna legível nos dois modos.
 */

import logoEngProducao from '@/assets/logos/eng-producao.png'
import logoUtfpr from '@/assets/logos/utfpr.svg'

/** Tamanhos do cartão, em altura da marca da UTFPR. */
const ALTURAS = {
  /** Header do MODO DADOS. */
  pequeno: { utfpr: 'h-5', curso: 'h-6', espaco: 'gap-3 px-3 py-2' },
  /** Topo da página de entrada. */
  medio: { utfpr: 'h-6', curso: 'h-8', espaco: 'gap-4 px-4 py-3' },
  /** Centro do splash. */
  grande: { utfpr: 'h-10', curso: 'h-12', espaco: 'gap-6 px-7 py-5' },
} as const

export interface MarcaInstitucionalProps {
  /** Escala do cartão. Padrão: `'medio'`. */
  tamanho?: keyof typeof ALTURAS
  /** Classes extras no elemento externo. */
  className?: string
}

/** O cartão branco com as duas marcas, separadas por um divisor. */
export function MarcaInstitucional({
  tamanho = 'medio',
  className = '',
}: MarcaInstitucionalProps) {
  const escala = ALTURAS[tamanho]

  return (
    <div className={`inline-flex items-stretch bg-white ${className}`}>
      {/* Barra amarela da aresta esquerda — assinatura da identidade. */}
      <div className="w-[6px] shrink-0 bg-yellow" aria-hidden="true" />

      <div className={`flex items-center ${escala.espaco}`}>
        <img
          src={logoUtfpr}
          alt="UTFPR — Universidade Tecnológica Federal do Paraná"
          className={`${escala.utfpr} w-auto`}
        />

        <div className="h-full w-px shrink-0 bg-line" aria-hidden="true" />

        <img
          src={logoEngProducao}
          alt="Engenharia de Produção — UTFPR Medianeira"
          className={`${escala.curso} w-auto`}
        />
      </div>
    </div>
  )
}
