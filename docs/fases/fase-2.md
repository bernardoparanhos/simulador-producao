# Fase 2 — Motor de cálculo

- **Data:** 2026-10-23
- **Status:** motor concluído e testado contra as fórmulas. **Parada P1 não
  executada** — faltam os dados do robô.

## Objetivo

Portar as fórmulas extraídas da planilha para um módulo TypeScript puro, sem
interface. O motor recebe `EntradaSimulacao` e devolve `ResultadoSimulacao`.

Fechar a fase incluía a **Parada P1**: rodar o caso do robô e bater com os
números da planilha. Isso não foi possível — ver [O que ficou em
aberto](#o-que-ficou-em-aberto).

## O que foi feito

### Tipos atualizados

Conforme as decisões 1 e 2 do briefing, em `src/types/resultados.ts`:

| Antes | Depois |
| --- | --- |
| `leadTime` | `leadTimeMin` |
| `wip` | `wipPecas` |
| `eficienciaTotal` em % | fração 0..1 |
| `ocupacaoMedia` em % | fração 0..1 |

Agora **todo** o modelo usa fração para grandezas relativas. Converter para
porcentagem é trabalho exclusivo da camada de tela. A documentação de
`StatusOcupacao` passou a apontar as faixas aplicadas pelo motor.

### O motor — `src/engine/`

Quatro passos, cada um num arquivo, na ordem em que dependem um do outro:

| Arquivo | Função | O que calcula |
| --- | --- | --- |
| `tempo.ts` | `calcularTempoDisponivel` | Tempo produtivo do período, a partir da jornada |
| | `calcularDiasNoPeriodo` | Converte `diasOuSemanasNoMes` em dias, conforme a periodicidade |
| | `calcularTempoInspecaoPorPecaMin` | Parcela de inspeção por peça (premissa — ver divergências) |
| | `calcularTaxaAprovacao` | Aprovação determinística (hoje não consumida) |
| `atividade.ts` | `calcularAtividade` | Tempo padrão, ciclo, takt, ciclos, capacidade, ocupação, tempo de lote |
| | `classificarOcupacao` | Faixas `ok` / `atencao` / `acima` |
| `sequencia.ts` | `propagarGargalo` | Produção realizada, percorrendo o grafo em ordem topológica |
| `globais.ts` | `calcularGlobais` | Eficiência, lead time, WIP, ocupação média, gargalo |
| | `encontrarGargalo` | Atividade de menor capacidade |
| `index.ts` | `simular` | A única função que a interface precisa conhecer |

Um tipo intermediário, `ResultadoAtividadeIsolada`, separa o que dá para
calcular olhando uma atividade sozinha do que só fecha com o fluxo inteiro
(`producaoRealizadaDiaria`, `estoqueFinal`, `ehGargalo`). É um `Omit` do
resultado público, então os dois nunca saem de sincronia.

`simular()` é pura e determinística: mesma entrada, mesma saída, sem estado, sem
efeito colateral e sem sorteio. Zero dependências — nem React, nem DOM, nem
biblioteca alguma.

### Fixtures — `src/fixtures/`

- **`exemplo.ts`** — cenário sintético e fictício, criado para os testes. Quatro
  atividades em três etapas, com um **afunilamento** real (duas atividades da
  etapa 1 alimentam uma da etapa 2) e o **gargalo no meio do caminho**, para
  provar que a limitação se propaga a jusante. Inspeção desligada, para que o
  cenário base exercite as fórmulas da planilha sem a premissa da inspeção.
- **`robo.ts`** — o lugar do cenário do robô. **Sem os dados.** Ver abaixo.

### Testes

`npm test` (novo script, rodando Vitest):

```
Test Files  2 passed (2)
      Tests  41 passed | 6 todo (47)
```

- **`motor.test.ts` — 41 testes, todos passando.** Verificam o motor contra as
  fórmulas recebidas: tempo disponível com as três periodicidades, fatores de
  ritmo e tolerância, diluição do setup, takt, capacidade, ocupação, as faixas de
  status nos limites exatos (0,85 e 1,00), a parcela de inspeção, o
  afunilamento pelo mínimo, a propagação por toda a cadeia, tolerância a ciclo e
  a conexões inválidas, casos de borda (lista vazia, atividade sozinha) e a
  pureza da função. Inclui um teste que prova que **mudar o fluxo muda os
  números** — o ponto do projeto.
- **`robo.test.ts` — 6 `todo` + 2 de estado.** As seis verificações da P1
  (tempo padrão, tempo de ciclo, takt, ocupação, gargalo, estoque) estão
  registradas como `it.todo`, aparecendo como pendentes na saída do Vitest. Mais
  dois testes que passam: um garante que o motor não lança erro com o cenário
  incompleto, outro falha de propósito no dia em que o fixture for preenchido,
  para lembrar de converter os `todo` em testes reais.

**O que os 41 testes provam:** o código implementa exatamente as fórmulas
recebidas. **O que não provam:** que as fórmulas são as da planilha. Só a P1
prova isso.

## Decisões tomadas

Registradas em
[0003 — Premissas do motor de cálculo](../decisoes/0003-premissas-do-motor-de-calculo.md).
Em resumo, três regras em ordem de precedência:

1. **Onde há fórmula, implementa a fórmula**, mesmo quando o domínio sugere
   outra.
2. **Onde não há fórmula, não inventa uma** — o campo fica inerte, com
   `TODO(P1)`.
3. **Uma decisão de produto em texto vale como instrução**: cumpre, escolhendo o
   ponto de aplicação mais isolado possível, e documenta como premissa.

Mais duas decisões de fronteira, na mesma 0003:

- **O motor não valida a entrada.** Validar exige decidir o que dizer ao
  usuário, e isso é da interface (Fases 3 e 4). O motor só tem limites
  defensivos para não travar nem devolver `NaN` gratuito.
- **A propagação usa a produção realizada das predecessoras**, não a capacidade
  delas — é o que faz o gargalo atravessar a linha inteira, e é o que justifica a
  ordem topológica que o briefing pediu.

## Divergências entre as fórmulas e o modelo de dados

Isto é o entregável mais importante da fase depois do código. Nove pontos, em
ordem de impacto sobre os números. Os que mexem em número estão marcados.

### D-1. `numOperadores` não entra em nenhuma fórmula — **mexe nos números**

O modelo define o campo como postos de trabalho em paralelo, e dois operadores
na mesma operação deveriam cortar o tempo de ciclo pela metade. A fórmula
recebida (`tempoCicloMin = tempoPadraoMin + setupMin / tamanhoLote`) não o usa.

Implementado fiel ao briefing. **Impacto:** toda atividade com mais de um
operador aparece com tempo de ciclo e ocupação maiores do que a realidade, e
capacidade menor — o que também pode apontar o gargalo errado. É a segunda
hipótese a testar se a P1 não bater.

Forma provável na planilha: `(tempoPadraoMin + setupMin / tamanhoLote) /
numOperadores`, ou apenas `tempoPadraoMin / numOperadores + setupMin /
tamanhoLote`. Há um teste travando a escolha atual, para ela só mudar por
decisão.

### D-2. Inspeção: decisão sem fórmula — **mexe nos números**

A decisão 5 manda o tempo de inspeção entrar no cálculo, mas nenhuma fórmula diz
onde. O motor soma `tempoPorPecaMin * (porcentagemInspecionada / 100)` ao tempo
de ciclo **de cada atividade**, por ser o único ponto dimensionalmente
compatível (min/unid.).

**Impacto:** se na planilha a inspeção acontece num ponto único do fluxo, isso
superestima todos os tempos de ciclo. Primeira hipótese a testar se a P1 não
bater. Com `porcentagemInspecionada: 0` o termo é zero e o motor fica idêntico às
fórmulas puras.

### D-3. Propagação: produção realizada ou capacidade das predecessoras — **mexe nos números**

O texto do briefing diz "menor capacidade entre ela e todas as suas
predecessoras diretas"; o motor usa a **produção realizada** das predecessoras,
porque é a única leitura que exige ordem topológica (que o briefing pediu) e a
única em que o gargalo propaga por toda a cadeia (decisão 3).

**Impacto:** difere em cadeias de três ou mais etapas. Capacidades 80, 500 e 400
em série dão 80 na terceira etapa com a leitura do motor, e 400 com a leitura
literal.

### D-4. `minimoAprovacao` é calculada e não usada

A decisão 5 fixa a aprovação em `minimoAprovacao`, sem sorteio. Mas nenhuma
fórmula recebida consome essa taxa. Ela existe como `calcularTaxaAprovacao` e não
afeta resultado nenhum.

A decidir: a produção realizada deve ser multiplicada pela taxa de aprovação? E,
nesse caso, o estoque final conta peças produzidas ou peças aprovadas?

### D-5. `paradaNaoPlanejada` não é usada

Nenhuma fórmula foi recebida para ela, e não há campo de resultado para
guardá-la. A leitura natural seria descontar seus minutos do tempo disponível da
atividade atingida — mas a fórmula da capacidade usa o tempo disponível
**global**, igual para todas as atividades, então aplicar a parada exigiria
mudar uma fórmula dada como exata.

Deixada inerte, com `TODO(P1)`. Hoje é um campo de entrada que não faz nada.

### D-6. `taktTimeMin` depende do tamanho do lote e tem um `* 60`

A fórmula recebida é `(tempoDisponivelMin / (tamanhoLote * demanda)) * 60`. O
takt clássico é tempo disponível dividido pela demanda. Aqui há duas
estranhezas: o `tamanhoLote` no denominador faz o takt **mudar quando o lote
muda**, o que é incomum para um ritmo ditado pela demanda; e o `* 60` sugere uma
conversão de unidade (min↔h ou min↔s) que não aparece no resto das fórmulas.

Implementado exatamente como recebido — os dois fatores podem muito bem se
cancelar na convenção de unidades da planilha. Mas vale conferir na P1, porque a
ocupação de **todas** as atividades sai do takt, e com ela o `statusOcupacao` e a
eficiência total.

### D-7. `capacidadeDiaria` e `producaoRealizadaDiaria` não são diárias

`tempoDisponivelMin` já embute o multiplicador do período (os dias). Logo as duas
grandezas são **do período**, não do dia. É consistente com
`estoqueFinal = producaoRealizadaDiaria - demanda`, já que a demanda também é do
período — mas o nome engana quem lê.

Só nome, nenhum número muda. Sugestão para uma fase futura:
`capacidadePeriodo` e `producaoRealizadaPeriodo`.

### D-8. `wipPecas` é constante por construção

`soma(quantidadeCiclos * tamanhoLote) / numAtividades`, com
`quantidadeCiclos = demanda / tamanhoLote`, se reduz a `demanda` — para qualquer
cenário, qualquer atividade, qualquer fluxo. O briefing já a marca como
estimativa; o registro aqui é que ela não é uma estimativa imprecisa, é uma
constante disfarçada. Um WIP de verdade sai do grafo (material parado entre
etapas, que o estoque por atividade já insinua).

### D-9. `ocupacaoMedia` e `leadTimeMin` são apelidos

Conforme o briefing: `ocupacaoMedia = eficienciaTotal` e
`leadTimeMin = maiorTempoProducaoMin`. Na planilha os conceitos são distintos —
eficiência pondera pelo tempo trabalhado, e o lead time é a soma dos tempos ao
longo do caminho mais longo da sequência. O grafo já permite calcular o lead time
de verdade; ficou para a Fase 5.

### Não é divergência: `processo`

Ignorado no motor, conforme a decisão 4 do briefing. Registrado para não parecer
esquecimento.

## O que ficou em aberto

### A Parada P1 não rodou

**Os números do robô não estão no repositório.** O plano de construção aponta as
fórmulas e os dados para "a especificação viva" e "o pacote de extração"
(`docs/plano-de-construcao.md`), documentos que vivem fora daqui. Uma busca em
`docs/` e no código não achou nenhum dado do robô — nem a quantidade de
atividades que ele tem.

Nada foi inventado. `src/fixtures/robo.ts` tem a estrutura completa com todo
campo numérico valendo `NaN` (um marcador exportado como `PENDENTE`), de modo que
qualquer conta feita a partir dele sai visivelmente inválida. Com zeros, o motor
devolveria números de aparência plausível e completamente falsos.

Para fechar a P1 são necessárias duas coisas:

| O que falta | De onde vem |
| --- | --- |
| **A entrada:** cenário, atividades (quantas e quais) e fluxo do robô | Abas DADOS INICIAIS, DADOS (ATIVIDADES), LOGICA PROCESSO e FLUXOGRAMA |
| **O gabarito:** tempo padrão, tempo de ciclo, takt, ocupação, gargalo e estoque esperados | Abas RELATÓRIO, ESTOQUE FINAL e RESULTADO |

O cabeçalho de `src/fixtures/robo.ts` lista isso campo por campo, e o de
`src/engine/__tests__/robo.test.ts` descreve os três passos para fechar a parada.

### Agenda da P1

`grep -rn "TODO(P1)" src/` lista tudo. Em resumo: D-1 (`numOperadores`), D-2
(ponto de aplicação da inspeção), D-3 (grandeza que propaga), D-4
(`minimoAprovacao`), D-5 (`paradaNaoPlanejada`), D-6 (o `* 60` e o lote no
takt).

### TODOs de fases posteriores

| TODO | Fase | O que é |
| --- | --- | --- |
| Faixas de `statusOcupacao` | 5 | 0,85 e 1,00 são provisórias, do briefing |
| `leadTimeMin` de verdade | 5 | Caminho mais longo no grafo, em vez de apelido |
| `ocupacaoMedia` separada da eficiência | 5 | Hoje o mesmo valor |
| `wipPecas` de verdade | 5 | A fórmula atual é constante (D-8) |
| Inspeção aleatória | 7 | A planilha sorteia; o motor é determinístico. Quando mudar, os testes precisam de semente fixa |
| Natureza da conexão no afunilamento | 4 | Hoje toda conexão é caminho alternativo do mesmo material; montagem de peças distintas pediria outra regra |
| Validação da entrada | 3 e 4 | Ciclo no grafo, demanda zero, conexão órfã |

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run build` (inclui `tsc -b`) | ✅ sem erros de tipo |
| `npm test` | ✅ 41 passando, 6 `todo` (os da P1) |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Motor sem React, sem DOM, sem dependências | ✅ só importa `@/types` |
| `simular()` puro e determinístico | ✅ coberto por teste |
| Fórmulas implementadas como recebidas | ✅ uma a uma, com JSDoc citando a aba de origem |
| Parada P1 | ❌ **não executada** — faltam os dados do robô |

## Não entra nesta fase (confirmando o escopo)

Telas, formulários, construtor visual de sequência, gráficos, identidade
institucional e validação de entrada. `src/components/` e `src/pages/` seguem
como estavam na Fase 0.
