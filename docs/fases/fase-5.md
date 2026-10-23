# Fase 5 — Construtor de Sequência

- **Data:** 2026-10-23
- **Status:** concluída. 75 testes passando, Paradas P1, P2 e P3 aprovadas.

## Objetivo

O terceiro dos quatro passos, e a razão de ser do projeto.

Na planilha, o fluxograma é um desenho que **não alimenta o cálculo**: cada
atividade aparece produzindo a própria capacidade, como se fosse independente
das outras. Aqui, ligar duas atividades muda o número — quem está a jusante
passa a ser limitado por quem o alimenta.

Esta é a única melhoria que o professor pediu, e é o que o plano de construção
chama de coração do sistema.

## O que foi feito

### Tokens novos — o terceiro modo

O MODO CANVAS entra ao lado de presença e dados. Não é nem um nem outro: é uma
mesa de trabalho.

| Token | Valor | Onde |
| --- | --- | --- |
| `canvas-bg` | `#242424` | fundo do canvas — mais escuro que o `dark` do header, para os nós brancos saltarem |
| `canvas-grid` | `rgba(255,255,255,.07)` | os pontos da grade |
| `edge` | `= yellow` | as ligações e a seta |
| `node-gargalo-bg` | `#FFF5F5` | fundo do cartão da atividade gargalo |
| `node-selected-outline` | `= yellow` | contorno do nó selecionado |
| `panel-border` | `#D9D4CA` | borda e divisórias do painel lateral |

`edge` e `node-selected-outline` apontam para `yellow` em vez de repetirem o
hex: são **apelidos semânticos**. Trocar o amarelo da identidade troca os dois
junto, e quem lê o componente vê o que a cor significa ali.

### `ActivityNode` — o cartão no canvas

`src/components/SequencePage/ActivityNode.tsx`. Cartão de 176 px com código,
nome, etapa·linha e a barra de ocupação — a mesma informação da lista do passo
2, reduzida ao que importa enquanto se liga uma coisa na outra.

A faixa superior de 4 px é a leitura mais rápida: diz o status antes de o olho
chegar ao número. O gargalo ganha fundo rosado, borda vermelha, sombra e a tag
`GARGALO`; o nó selecionado ganha contorno amarelo.

Duas decisões de tipo:

- **`ActivityNodeData` é `type`, não `interface`.** O React Flow exige que os
  dados do nó sejam atribuíveis a `Record<string, unknown>`, e só os tipos
  literais de objeto ganham o índice implícito que isso requer.
- **`ocupacao` e `status` são anuláveis.** Um nó pode existir antes de haver
  cenário suficiente para calcular; nesse caso o cartão mostra "sem cálculo" em
  vez de fingir um número.

### `SequencePage` — canvas, painel e rodapé

`src/pages/SequencePage.tsx`.

**Canvas.** Os nós saem de três contextos cruzados: posição da sequência,
dados da atividade, ocupação do motor. Arrastar chama `updateNodePosition`,
ligar chama `addEdge`, clicar seleciona, clicar no fundo limpa a seleção.

**Painel.** Sem seleção, explica como ligar. Com um nó selecionado, mostra
código, etapa·linha, tempo de ciclo e ocupação (na cor do status), a lista de
entradas e saídas, e o botão de remover conexões — desabilitado quando não há
nenhuma.

**Rodapé.** Conta as conexões e leva aos resultados. "Ver resultados" fica
desabilitado com o canvas vazio, com o motivo no `title`.

**Estado vazio.** Ilustração de três caixas ligadas por setas tracejadas e o
botão "Carregar atividades", que gera a grade de quatro colunas. Sem atividades
cadastradas, o botão vira "Ir para Atividades" — oferecer um botão que não faz
nada seria pior do que apontar o caminho.

### Rota `/resultados`

Placeholder da Fase 6, para o botão do rodapé levar a algum lugar. Mostra os
indicadores globais que o motor já devolve. Com isso os quatro passos do header
passam a navegar.

## Decisões tomadas

### O motor roda em `useMemo`, não em `useState` alimentado por efeito

A especificação pedia o `ResultadoSimulacao` guardado em `useState` local,
atualizado por efeito quando cenário ou atividades mudassem.

Feito com `useMemo`, como na tela de Atividades. Guardar dado derivado em
estado custa um render a mais por mudança e abre a janela em que a tela mostra
número velho — e é exatamente o que o `oxlint` cobra ao apontar
`set-state-in-effect`, aviso que já apareceu neste projeto na Fase 4.

O resultado é o mesmo; o caminho é mais curto e não tem o quadro intermediário.

### A sequência inteira vai para o motor

A chamada é `simular({ cenario, atividades, sequencia })`, com as conexões
incluídas — não só cenário e atividades.

Hoje não muda número nenhum na tela: ocupação e gargalo não dependem do grafo.
Mas `producaoRealizadaDiaria` depende, é o que a Fase 6 vai mostrar, e passar a
sequência desde já evita que a tela de sequência seja a única a calcular sem
ela.

### Nós órfãos são descartados

Um nó cuja atividade foi apagada no passo 2 não é desenhado. É o caso que a
Parada P3 vigia: desenhar um cartão sem dados seria pior do que não desenhar.

### O crédito do React Flow fica

A biblioteca é MIT e o crédito pode ser removido. Ele fica, com a cor ajustada
para o fundo escuro: custa um canto de 11 px, e a biblioteca sustenta o coração
deste projeto.

## Divergências

### Nomes da especificação × nomes do projeto

A especificação usa a API que a preparação da Fase 5 havia proposto e que não
foi adotada — ver
[0002](../decisoes/0002-representacao-da-sequencia.md). O mapeamento:

| Na especificação | No projeto |
| --- | --- |
| `SequenciaContext.nodePositions` | `posicoesDaSequencia(sequencia)` |
| `SequenciaContext.edges` | `sequencia.conexoes` |
| `e.source` / `e.target` | `conexao.origem` / `conexao.destino` |
| `resultado.atividadesCalculadas` | `resultado.porAtividade` |
| `a.id` no resultado | `resultado.atividadeId` |

As **ações** do contexto têm os nomes da especificação (`setNodePositions`,
`updateNodePosition`, `addEdge`, `removeEdgesForNode`), porque quem as chama é
o componente de canvas.

### Valores do guia DP-3 não aplicados

Por instrução explícita do briefing: fonte **Outfit** (não Red Hat Display) e
amarelo **`#F5C400`** (não `#F6C212`). Soma-se à lista de divergências entre os
guias e os tokens aprovados, registrada na [Fase 4](fase-4.md).

### Os frames do DP-3 não chegaram ao desenvolvimento

A tela foi construída a partir da especificação textual, que é detalhada —
medidas, cores, textos e posições. **As capturas precisam ser conferidas contra
os frames aprovados**, porque nenhum deles foi visto aqui.

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run build` (inclui `tsc -b`) | ✅ sem erros de tipo |
| `npm test` | ✅ 75 passando, nenhum alterado |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Parada P3 | ✅ segue aprovada |
| Tela 5A — fluxo montado, nó selecionado | ✅ capturada em `localhost` |
| Tela 5B — canvas vazio | ✅ capturada em `localhost` |
| Números dos nós contra o gabarito | ✅ `112` em 115,3% e gargalo; `221` em 98,3%; `111` em 44,8% |

O bundle passou de 296 kB para 485 kB (152 kB comprimido) com o React Flow. É
o custo da biblioteca, pago só nesta tela — mas o Vite ainda gera um pacote
único, então ele é baixado em todas. **Dividir o pacote por rota** resolveria;
fica como sugestão para a Fase 7.

## Pendências

| Pendência | De quem | Observação |
| --- | --- | --- |
| Conferir as capturas contra os frames DP-3 | responsável do projeto | Os frames não chegaram ao desenvolvimento |
| Decidir os valores dos guias DP-2/DP-3 contra os do DP-1 | responsável do projeto | Lista na [Fase 4](fase-4.md) |
| Validação do grafo: ciclo, nó solto, atividade sem conexão | Fase 6 | O motor tolera, mas a pessoa não é avisada |
| Dividir o pacote por rota | Fase 7 | O React Flow pesa em todas as telas |
| `logos/eng-producao.png` com 1,03 MB | responsável do projeto | Segue sendo o maior arquivo do build |

## Não entra nesta fase (confirmando o escopo)

Tela de Resultados de verdade (só o placeholder de rota), gráficos, validação
do grafo e tour guiado. As fórmulas do motor não foram tocadas.
