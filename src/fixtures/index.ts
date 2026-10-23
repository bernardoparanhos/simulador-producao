/**
 * Cenários de exemplo prontos (dados de entrada completos) usados para
 * demonstração, testes manuais e testes automatizados do motor de cálculo.
 *
 * | Cenário | O que é |
 * | --- | --- |
 * | `robo` | O caso real da planilha `SIMULADOR DE PRODUÇÃO ROBÔ.xlsm`, referência da Parada P1. 15 atividades, sem fluxo (o fluxograma estava vazio). |
 * | `exemplo` | Sintético e fictício. Quatro atividades com afunilamento, para exercitar a propagação do gargalo, que o robô não exercita. |
 */

export { atividadesExemplo, cenarioExemplo, exemplo, sequenciaExemplo } from './exemplo'
export { atividadesRobo, cenarioRobo, robo, sequenciaRobo } from './robo'
