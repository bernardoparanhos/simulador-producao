# Fase 3 — Entradas (parte 1: Cenário)

- **Data:** 2026-10-23
- **Status:** telas de abertura, entrada e Cenário concluídas. A tela de
  Atividades e a **Parada P2** ficam para a Fase 4.

## Objetivo

Abrir a camada de tela do sistema, aplicando a identidade aprovada na entrega de
design DP-1 (estética 1E geométrico UTFPR), e entregar o primeiro dos quatro
passos do caminho dos dados: o Cenário.

O plano prevê para a Fase 3 as telas de Cenário **e** de Atividades, com a
Parada P2 no fim. Os frames aprovados cobrem três telas, e Atividades não é uma
delas — então esta entrega vai até onde o design chegou, e a Fase 4 traz
Atividades junto com o construtor de sequência.

## O que foi feito

### Antes de tudo: a renomeação D-7

`capacidadeDiaria` virou **`capacidadePeriodo`** em todo o projeto — motor,
tipos, fixtures e testes. Só o nome muda: o campo nunca foi diário, porque
`tempoDisponivelMin` já embute o multiplicador do período. Os 49 testes seguem
passando. Commit próprio, antes da fase.

Fica pendente `producaoRealizadaDiaria`, que é a mesma grandeza e ficou com o
sufixo antigo.

### Tokens de identidade — `src/styles/tokens.css`

Todas as cores do projeto, num arquivo só:

| Token | Valor | Onde |
| --- | --- | --- |
| `dark` | `#1C1C1C` | fundo do MODO PRESENÇA, header, texto |
| `yellow` | `#F5C400` | botões, destaques, a palavra "Produção", passo ativo |
| `yellow-deep` | `#D4A800` | formas de fundo, estado de passagem do mouse |
| `orange` | `#E87800` | badge, barra do header, marcadores, texto de apoio |
| `light-bg` | `#F5F4EF` | fundo do MODO DADOS e do documento |
| `muted` | `#8A8A8A` | rótulos, rodapé, passos inativos |
| `line` | `#E0E0E0` | bordas de campo e separadores |

Os nomes exatos da especificação DP-1 (`--color-text-dark`, `--color-text-muted`,
`--color-border`) existem como aliases, para conferência token a token.

Duas regras de forma ficam no `index.css`, não repetidas em cada componente:
**raio zero** em tudo que é interativo e **nenhuma sombra** — o relevo vem de
borda e contraste, nunca de blur.

### Telas

| Rota | Tela | Modo |
| --- | --- | --- |
| `/splash` | abertura, avança sozinha em 2,5 s | presença |
| `/entrada` | apresentação institucional | presença |
| `/cenario` | passo 1 de 4 | dados |
| `/atividades` | placeholder da Fase 4 | dados |

- **Splash** — marca sobre fundo grafite, formas geométricas nos quatro cantos,
  barra de progresso com os três quadradinhos de carga. Sem interação: é a tela
  que o professor vê ao projetar.
- **Entrada** — divisão 45/55. À esquerda marca, badge do curso, título, a frase
  que explica o sistema e o botão que começa tudo; à direita duas fotos do
  campus costuradas por uma faixa amarela.
- **Cenário** — header escuro com os quatro passos, três grupos de campos
  (dados gerais, turnos e refeições, inspeção) e o indicador de **tempo
  disponível por turno**, que recalcula a cada tecla. Com os valores iniciais
  dos frames: `480 − 70 × 1 − 12 = 398 min`.

O indicador ao vivo é a tradução do "passos claros" do plano: em nenhum momento
se preenche um campo sem ver para onde ele vai.

### Componentes reaproveitáveis — `src/components/`

| Componente | O que é |
| --- | --- |
| `MarcaInstitucional` | O cartão branco com barra amarela, marca da UTFPR, divisor e símbolo do curso. Três tamanhos. |
| `HeaderSimulador` | A barra escura do MODO DADOS, com os quatro passos. |
| `CampoNumero`, `CampoSelecao` | Campos com rótulo, borda reta e foco amarelo. |
| `TituloSecao` | Cabeçalho de grupo com marcador geométrico (quadrado, círculo, triângulo). |
| `FormasPresenca`, `FormasDados` | As formas decorativas dos dois modos. |

O cartão da marca é branco mesmo nas telas escuras, de propósito: a marca da
UTFPR é grafite sobre transparente e sumiria sobre o fundo `dark`.

### Estado compartilhado — `src/state/`

Três arquivos, cada um com uma responsabilidade:

- `cenario.ts` — o tipo `FormularioCenario`, os valores iniciais, a conversão
  para `Cenario` e a persistência. Funções puras, nada de React.
- `contextoCenario.ts` — o contexto e o gancho `useCenario`.
- `ProvedorCenario.tsx` — só o componente provedor.

A separação não é preciosismo: um arquivo que exporta um componente **e** outras
coisas quebra o recarregamento rápido do Vite, e o `oxlint` avisa.

O provedor fica **acima** do roteador — trocar de tela não pode custar o que a
pessoa já preencheu — e persiste em `localStorage`, que falha em silêncio.

## Decisões tomadas

Registradas em [0004 — Camada de tela](../decisoes/0004-camada-de-tela.md):

1. **Os tokens são a única fonte de cor.** Nenhum componente declara cor
   própria; a identidade tem dois modos, presença e dados.
2. **O formulário da tela não é o `Cenario` do motor.** A fronteira é a função
   `cenarioDoFormulario`, e existe porque há três diferenças reais entre as duas
   formas.
3. **Uma rota por passo, com o estado acima do roteador.** Os passos do header
   ainda não navegam, porque três dos quatro não existem.
4. **A validação ainda não é desta fase.** Só contenção de campo (mínimo,
   máximo, recusa de não-número). O aviso de cenário incoerente entra com a tela
   de Atividades, para não haver duas gramáticas de erro.

## Divergências

Duas novas, ambas vindas dos frames aprovados, e ambas **resolvidas** num
ajuste posterior à entrega da fase.

### D-16. A tela pede o tempo de inspeção em segundos; o modelo guarda minutos — **RESOLVIDA**

O frame mostra "Tempo por peça (s)" com `6,5`. O campo do modelo é
`inspecao.tempoPorPecaMin`, em minutos.

A fronteira fica em `cenarioDoFormulario`, que divide por 60 — com comentário
no ponto exato da conversão. O formulário guarda segundos, que é o que a pessoa
digitou; o motor recebe minutos, que é o que o modelo documenta.

Não afeta número nenhum hoje, porque a inspeção não entra em cálculo algum
(divergência D-13) — mas a conversão já está no lugar certo para quando entrar.

### D-17. O rótulo "Demanda diária" não acompanha a periodicidade — **RESOLVIDA**

O frame rotula o campo como "Demanda diária (un.)", mas o campo ao lado deixa
escolher a periodicidade. Com `'Semanal'` ou `'Mensal'` selecionado, o rótulo
passava a mentir.

O rótulo agora acompanha a escolha: *Demanda diária*, *Demanda semanal* ou
*Demanda mensal*. Os três textos moram na mesma lista que alimenta o select, de
modo que não há como mudar um e esquecer o outro.

### Divergências anteriores que a tela torna visíveis

- **D-10** — o tempo de descanso ficou **fora da tela**, porque a P1 mostrou que
  a planilha não o desconta. O modelo ainda exige o campo, que vai como zero.
- **D-5** — a parada não planejada também ficou fora, pela mesma razão: nenhuma
  fórmula a consome.
- **D-14** — as porcentagens passam inteiras (`100`, `98`), sem conversão de
  escala, conforme decidido.

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run build` (inclui `tsc -b`) | ✅ sem erros de tipo |
| `npm test` | ✅ 49 passando — nenhum teste foi tocado |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Três telas conferidas contra os frames DP-1 | ✅ capturadas em `localhost` |
| Fotos do campus em WebP | ✅ 5,5 MB → 530 kB, sem perda visível |
| Indicador de tempo disponível | ✅ 398 min com os valores iniciais, igual ao frame |
| Cenário sobrevive à navegação e ao recarregar | ✅ `localStorage` |

## Pendências

| Pendência | De quem | Observação |
| --- | --- | --- |
| Renomear `producaoRealizadaDiaria` | responsável do projeto | Fecha a D-7, que ficou pela metade |
| Símbolo do curso em PNG de 1 MB | responsável do projeto | `logos/eng-producao.png` é exibido a 48 px de altura e pesa 1,03 MB — é hoje o arquivo mais pesado do build. Um SVG do manual de identidade resolveria de vez |
| Tela de Atividades e **Parada P2** | Fase 4 | A P2 precisa de atividades para o motor devolver número |

## Não entra nesta fase (confirmando o escopo)

Tela de Atividades (só o placeholder de rota), construtor visual de sequência,
gráficos, resultados, tour guiado e validação de cenário incoerente. As fórmulas
do motor não foram tocadas — a única mudança em `src/engine/` foi a renomeação
de `capacidadeDiaria`, feita antes da fase e em commit próprio.
