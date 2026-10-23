/**
 * Raiz da aplicação: roteamento e estado compartilhado.
 *
 * O cenário fica por fora das rotas, de propósito: ele precisa sobreviver à
 * navegação entre os quatro passos. Trocar de tela não pode custar o que a
 * pessoa já preencheu.
 */

import { Navigate, Route, BrowserRouter as Roteador, Routes } from 'react-router-dom'

import { AtividadesPage, CenarioPage, EntradaPage, SplashScreen } from '@/pages'
import { ProvedorCenario } from '@/state'

export default function App() {
  return (
    <ProvedorCenario>
      <Roteador>
        <Routes>
          <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/entrada" element={<EntradaPage />} />
          <Route path="/cenario" element={<CenarioPage />} />
          <Route path="/atividades" element={<AtividadesPage />} />
          {/* Qualquer outro caminho volta para a abertura. */}
          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </Roteador>
    </ProvedorCenario>
  )
}
