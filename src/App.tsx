/**
 * Raiz da aplicação: roteamento e estado compartilhado.
 *
 * Os dois provedores ficam por fora das rotas, de propósito: cenário e
 * atividades precisam sobreviver à navegação entre os quatro passos. Trocar de
 * tela não pode custar o que a pessoa já preencheu.
 */

import { Navigate, Route, BrowserRouter as Roteador, Routes } from 'react-router-dom'

import {
  AtividadesPage,
  CenarioPage,
  EntradaPage,
  SequenciaPage,
  SplashScreen,
} from '@/pages'
import { ProvedorAtividades, ProvedorCenario, ProvedorSequencia } from '@/state'

export default function App() {
  return (
    <ProvedorCenario>
      <ProvedorAtividades>
        <ProvedorSequencia>
          <Roteador>
            <Routes>
              <Route path="/" element={<Navigate to="/splash" replace />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/entrada" element={<EntradaPage />} />
              <Route path="/cenario" element={<CenarioPage />} />
              <Route path="/atividades" element={<AtividadesPage />} />
              <Route path="/sequencia" element={<SequenciaPage />} />
              {/* Qualquer outro caminho volta para a abertura. */}
              <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </Roteador>
        </ProvedorSequencia>
      </ProvedorAtividades>
    </ProvedorCenario>
  )
}
