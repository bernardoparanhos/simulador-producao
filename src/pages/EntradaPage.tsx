/**
 * Tela 2 — Entrada. MODO PRESENÇA.
 *
 * A porta do sistema: metade esquerda institucional, metade direita com o
 * campus. É o que o professor abre para apresentar a outras pessoas, e o único
 * lugar onde o sistema se explica em uma frase antes de pedir qualquer dado.
 */

import { Link } from 'react-router-dom'

import fotoPredio from '@/assets/capas/campus-predio.png'
import fotoVistaAerea from '@/assets/capas/campus-vista-aerea.png'
import { MarcaInstitucional } from '@/components/MarcaInstitucional'

export function EntradaPage() {
  return (
    /*
     * `lg:h-screen` em vez de só `min-h-screen`: as fotos do campus são
     * grandes, e sem altura fixa a coluna da direita cresce com a imagem e
     * empurra o rodapé da esquerda para fora da tela.
     */
    <main className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[45fr_55fr] lg:overflow-hidden">
      <LadoInstitucional />
      <LadoCampus />
    </main>
  )
}

/** Metade esquerda: marca, título, promessa e o botão que começa tudo. */
function LadoInstitucional() {
  return (
    <div className="flex flex-col justify-between overflow-y-auto bg-dark px-8 py-10 sm:px-12 lg:px-14">
      <div className="flex flex-wrap items-center gap-5">
        <MarcaInstitucional tamanho="medio" />
        <span className="text-[11px] tracking-[0.16em] text-muted">CAMPUS MEDIANEIRA</span>
      </div>

      <div className="py-12">
        <span className="inline-flex items-center gap-2 bg-orange px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-white">
          <IconeBarras />
          ENGENHARIA DE PRODUÇÃO
        </span>

        <h1 className="mt-7 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
          Simulador
          <br />
          de <span className="text-yellow">Produção</span>
        </h1>

        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/85">
          Calcule <strong className="font-bold text-white">takt</strong>,{' '}
          <strong className="font-bold text-white">gargalo</strong> e{' '}
          <strong className="font-bold text-white">capacidade</strong> da sua linha de
          produção. Monte o fluxo e veja os resultados em tempo real.
        </p>

        <Link
          to="/cenario"
          className="mt-9 inline-flex items-center gap-4 bg-yellow px-7 py-4 text-[15px] font-bold text-dark transition-colors hover:bg-yellow-deep"
        >
          Começar simulação
          <span className="text-xs font-normal text-dark/60">4 passos · ~5 min</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted">
        <span>Versão 1.0 · Desenvolvido por estudante de Eng. de Produção</span>
        <span>UTFPR Medianeira · PR</span>
      </div>
    </div>
  )
}

/**
 * Metade direita: duas fotos do campus com uma faixa amarela entre elas.
 *
 * A faixa não é só enfeite — é o que costura as duas fotos numa composição só
 * e repete a aresta amarela que aparece na marca e no header.
 */
function LadoCampus() {
  return (
    <div className="relative hidden h-full grid-rows-[1fr_auto_1.1fr] overflow-hidden lg:grid">
      <img
        src={fotoVistaAerea}
        alt="Vista aérea do campus da UTFPR em Medianeira"
        className="h-full w-full object-cover"
      />

      <div className="relative grid h-14 grid-cols-[3fr_2fr]">
        <div className="bg-yellow" />
        <div className="bg-dark" />
        {/* Círculo amarelo montado sobre a emenda, como no frame. */}
        <div className="absolute right-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-yellow" />
      </div>

      <img
        src={fotoPredio}
        alt="Prédio do campus da UTFPR em Medianeira"
        className="h-full w-full object-cover"
      />
    </div>
  )
}

/** Ícone de barras do badge do curso. */
function IconeBarras() {
  return (
    <svg viewBox="0 0 12 10" className="h-2.5 w-3 fill-white" aria-hidden="true">
      <rect x="0" y="6" width="3" height="4" />
      <rect x="4.5" y="3" width="3" height="7" />
      <rect x="9" y="0" width="3" height="10" />
    </svg>
  )
}
