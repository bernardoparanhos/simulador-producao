# Modelo de dados

Referência das entidades do Simulador de Produção: o que cada campo significa,
em que unidade está e de onde na planilha ele veio.

- **Código:** [`src/types/`](../src/types/)
- **Fase:** 1
- **Escopo:** só formas de dados. Nenhuma fórmula, nenhuma validação, nenhuma
  tela. O motor de cálculo é a Fase 2.

## Princípios

1. **Vocabulário do domínio, em português.** `demanda`, `tamanhoLote`,
   `tempoCicloMin`. São os termos que o professor e os alunos usam; traduzir
   para inglês só criaria um dicionário a mais entre a planilha e o código.
2. **A unidade está no nome do campo.** O sufixo `Min` quer dizer minutos.
   Onde o nome não cabe a unidade, ela está no JSDoc — e está em *todos* os
   campos, sem exceção.
3. **Entrada e resultado não se misturam.** O que a pessoa preenche está em
   `Cenario`, `Atividade` e `Sequencia`; o que o motor calcula está em
   `ResultadoPorAtividade` e `ResultadoGlobal`. Por isso o **tempo disponível**
   está nos resultados, e não no cenário: ele é calculado, não informado.
4. **Nada de lógica nos tipos.** Sem `enum` (o projeto usa
   `erasableSyntaxOnly`), sem classes, sem funções auxiliares. São descrições de
   forma, e nada mais.
5. **Identificadores estáveis e opacos.** `AtividadeId` e `ConexaoId` são
   `string`, geradas uma vez e nunca alteradas. Nada no sistema depende do
   formato delas. Isso é o que permite renomear uma atividade sem quebrar as
   conexões do fluxo nem os resultados que apontam para ela.

## Organização dos arquivos

Um arquivo por bloco do caminho dos dados, na ordem em que o dado caminha:

| Arquivo | Bloco | Tipos |
| --- | --- | --- |
| [`cenario.ts`](../src/types/cenario.ts) | Cenário (dados iniciais) | `Cenario`, `Inspecao`, `ParadaNaoPlanejada`, `Periodicidade` |
| [`atividade.ts`](../src/types/atividade.ts) | Atividades | `Atividade`, `AtividadeId` |
| [`sequencia.ts`](../src/types/sequencia.ts) | Sequência (o fluxo) | `Sequencia`, `NoSequencia`, `ConexaoSequencia`, `ConexaoId`, `Posicao` |
| [`simulacao.ts`](../src/types/simulacao.ts) | entrada do motor | `EntradaSimulacao` |
| [`resultados.ts`](../src/types/resultados.ts) | Resultados | `ResultadoSimulacao`, `ResultadoGlobal`, `ResultadoPorAtividade`, `StatusOcupacao` |
| [`index.ts`](../src/types/index.ts) | porta de entrada | reexporta tudo |

Por que não um arquivo único bem seccionado: os cinco blocos são as cinco
paradas do caminho dos dados, e cada um vai crescer em fases diferentes (o
cenário na Fase 3, a sequência na Fase 4, os resultados na Fase 5). Arquivos
separados fazem o diff de cada fase ficar legível e evitam um arquivo de 600
linhas que ninguém lê inteiro. O barril `index.ts` mantém o import curto:

```ts
import type { Atividade, EntradaSimulacao } from '@/types'
```

## A forma geral

O motor da Fase 2 terá uma assinatura só, estável:

```ts
function simular(entrada: EntradaSimulacao): ResultadoSimulacao
```

```text
EntradaSimulacao                     ResultadoSimulacao
├── cenario: Cenario                 ├── global: ResultadoGlobal
├── atividades: Atividade[]          └── porAtividade: ResultadoPorAtividade[]
└── sequencia: Sequencia
    ├── nos: NoSequencia[]
    └── conexoes: ConexaoSequencia[]
```

## Cenário

Dados iniciais. Tudo entrada.

| Campo | Unidade | O que é |
| --- | --- | --- |
| `demanda` | unid. | Quanto precisa ser produzido, na base de tempo da `periodicidade` |
| `tamanhoLote` | unid. | Peças produzidas entre dois setups |
| `tempoRefeicaoMin` | min | Duração de uma refeição |
| `trocaTurnoMin` | min | Passagem de serviço entre equipes |
| `tempoTurnoMin` | min | Duração bruta de um turno (480 = 8 h) |
| `numRefeicoesPorTurno` | — | Refeições concedidas dentro de um turno |
| `tempoDescansoMin` | min | Pausas curtas, somadas |
| `turnosDiarios` | — | Turnos trabalhados por dia |
| `diasOuSemanasNoMes` | — | Dias úteis ou semanas no mês, conforme a `periodicidade` |
| `periodicidade` | — | `Diario`, `Semanal` ou `Mensal` |
| `inspecao.porcentagemInspecionada` | % | Fração da produção que passa por inspeção |
| `inspecao.tempoPorPecaMin` | min/peça | Tempo de uma inspeção |
| `inspecao.minimoAprovacao` | % | Taxa mínima de aprovação esperada |
| `paradaNaoPlanejada.atividadeId` | — | Atividade atingida pela parada |
| `paradaNaoPlanejada.tempoMin` | min | Duração da parada |

Decisões neste bloco:

- **`tempoDisponivelMin` não está aqui.** É calculado a partir do turno, dos
  turnos diários, das refeições, do descanso e da troca de turno, e por isso
  mora em `ResultadoGlobal`. Na planilha ele aparece junto dos dados iniciais,
  o que esconde o fato de ser uma fórmula.
- **`paradaNaoPlanejada` é anulável** (`ParadaNaoPlanejada | null`). Um cenário
  sem parada é situação normal e explícita, não um campo que faltou preencher.
  Se um dia houver mais de uma parada, vira array.
- **A parada referencia `atividadeId`**, não a descrição nem o índice da
  atividade: renomear ou reordenar atividades não pode quebrar o cenário.
- **`diasOuSemanasNoMes` é um campo cujo significado muda** com a
  periodicidade. Mantido como está porque é assim na planilha; o JSDoc explica
  a leitura.

## Atividade

Uma operação do processo. Equivale a uma linha do formulário ATIVIDADES.

| Campo | Unidade | O que é |
| --- | --- | --- |
| `id` | — | Identificador estável e opaco |
| `descricao` | — | Nome da atividade |
| `etapa` | — | Posição ao longo do fluxo (eixo X do construtor) |
| `linha` | — | Linha de produção dentro da etapa (eixo Y do construtor) |
| `processo` | — | Agrupamento acima da etapa |
| `tempoCronometradoMin` | min/unid. | Medição crua de cronômetro |
| `setupMin` | min | Preparação, paga uma vez por lote |
| `fatorRitmo` | % | 100 = ritmo normal; ex.: `102` |
| `fatorTolerancia` | % | Acréscimo por fadiga e esperas; ex.: `7` |
| `numOperadores` | — | Postos de trabalho em paralelo na atividade |

Decisões neste bloco:

- **`etapa`, `linha` e `processo` moram na atividade**, e não no nó da
  sequência. Uma informação, um lugar — ver a decisão
  [0002](decisoes/0002-representacao-da-sequencia.md).
- **`fatorRitmo` e `fatorTolerancia` ficam em porcentagem** (`102`, `7`), do
  jeito que estão na planilha e que o professor dita em aula. Converter para
  fração no modelo pouparia uma divisão no motor, mas faria o valor digitado na
  tela não ser o valor guardado — e é a tela que a pessoa confere contra a
  planilha.

## Sequência

O fluxo. Modelada como **grafo dirigido**: nós (atividades colocadas no fluxo) e
conexões (`origem` alimenta `destino`).

```ts
interface Sequencia {
  nos: NoSequencia[]            // { atividadeId, posicao? }
  conexoes: ConexaoSequencia[]  // { id, origem, destino }
}
```

Três pontos para revisar com atenção, com o raciocínio completo e as
alternativas descartadas em
[0002 — Representação da sequência](decisoes/0002-representacao-da-sequencia.md):

1. **A identidade do nó é o `atividadeId`** — não há id de nó separado, logo
   cada atividade aparece no máximo uma vez no fluxo. Casa com a planilha (uma
   linha por atividade) e com os resultados (um resultado por atividade); se a
   mesma atividade aparecesse duas vezes, sua ocupação seria ambígua.
2. **A lista `nos` existe** porque estar cadastrada e estar no fluxo são coisas
   diferentes: ela é o que diz quais atividades já entraram, e é onde a posição
   arrastada na tela persiste. Um nó solto, ainda sem ligação, é o estado normal
   de quem está montando o fluxo.
3. **`posicao` é opcional e puramente visual.** Ausente, a interface deriva a
   posição da grade (etapa no X, linha no Y), e o fluxo já nasce organizado. O
   motor ignora o campo.

### Como o React Flow consome isso (Fase 4)

Um adaptador na camada de interface, não no modelo:

```text
NoSequencia       → Node { id: atividadeId, position, data: { atividade } }
ConexaoSequencia  → Edge { id, source: origem, target: destino }
```

`position` vem de `posicao` quando existe, ou da grade quando não existe. O
`ConexaoId` existe justamente porque o React Flow exige um `id` em cada aresta e
porque a interface precisa poder selecionar e apagar uma ligação específica.

Guardar direto no formato do `@xyflow/react` eliminaria o adaptador, mas
amarraria o motor e os cenários salvos à API de uma biblioteca de tela — contra
o princípio do plano de manter o motor independente da interface. O adaptador é
curto; a dependência seria permanente.

### O que o tipo não garante

O modelo aceita grafos que não fazem sentido no domínio: conexão apontando para
uma etapa anterior, ciclo, nó referenciando atividade inexistente, atividade sem
nenhuma ligação. Isso é deliberado — tipos descrevem forma, não regra. A
validação é trabalho da Fase 2 e está registrada como tal.

## Resultados

Nada aqui é preenchido pela pessoa.

### `ResultadoPorAtividade`

| Campo | Unidade | O que é |
| --- | --- | --- |
| `atividadeId` | — | A quem o resultado se refere |
| `tempoPadraoMin` | min/unid. | Cronometrado, com ritmo e tolerância aplicados |
| `tempoCicloMin` | min/unid. | Tempo padrão distribuído entre os postos |
| `capacidadeDiaria` | unid./dia | Quanto a atividade poderia produzir |
| `taktTimeMin` | min/unid. | Ritmo exigido pela demanda |
| `tempoProducaoLoteMin` | min | Tempo para um lote inteiro, com setup |
| `ocupacao` | **fração 0..1** | `0,85` = 85% |
| `statusOcupacao` | — | `ok`, `atencao` ou `acima` |
| `quantidadeCiclos` | — | Ciclos executados no período |
| `producaoRealizadaDiaria` | unid./dia | O que de fato sai, limitado pelo gargalo |
| `estoqueFinal` | unid. | Sobra na saída da atividade |
| `ehGargalo` | — | `true` na atividade que limita o fluxo |

### `ResultadoGlobal`

| Campo | Unidade | O que é |
| --- | --- | --- |
| `tempoDisponivelMin` | min | **Calculado** a partir da jornada do cenário |
| `eficienciaTotal` | **%** | Ex.: `87.5` |
| `leadTime` | min | Tempo de uma unidade atravessar o fluxo todo |
| `wip` | unid. | Material em processamento |
| `ocupacaoMedia` | **%** | Ex.: `72.4` |
| `gargaloAtividadeId` | — | A atividade gargalo, ou nulo se não houver fluxo |
| `maiorTempoProducaoMin` | min | Maior tempo de lote; é o da atividade gargalo |

Decisões e pontos abertos neste bloco:

- **`ocupacao` é fração (0..1) e `ocupacaoMedia` é porcentagem.** As duas
  unidades vêm do inventário extraído da planilha e foram mantidas como estão,
  mas a divergência é incômoda e está marcada para revisão. A formatação para
  exibição é responsabilidade da tela, nunca do motor.
- **`leadTime` e `wip` seguem sem sufixo de unidade**, ao contrário do resto do
  modelo. Os nomes foram mantidos exatamente como no inventário da planilha; a
  unidade está no JSDoc. Renomear para `leadTimeMin` fica como pergunta aberta.
- **`ehGargalo` é redundante com `gargaloAtividadeId`**, de propósito: evita que
  cada linha da tabela de resultados precise consultar o resultado global para
  saber se deve se destacar.
- **`statusOcupacao` existe, mas as faixas de corte não.** Elas saem da planilha
  do robô, na Fase 2; até lá, `TODO` no código e nenhum código deve assumir
  valores.
- **`gargaloAtividadeId` é anulável:** sem atividades no fluxo não há gargalo a
  apontar.

## Mapeamento contra a planilha

| Na planilha | No modelo | Observação |
| --- | --- | --- |
| DADOS INICIAIS | `Cenario` | Menos o tempo disponível, que virou resultado |
| DADOS (formulário ATIVIDADES) | `Atividade[]` | Uma linha da planilha = uma `Atividade` |
| LOGICA PROCESSO | `Sequencia.conexoes` | Era manual e não alimentava o cálculo |
| FLUXOGRAMA | `Sequencia.nos` (+ `posicao`) | Era só desenho; agora é o mesmo dado |
| RELATÓRIO | `ResultadoPorAtividade` | Tempo padrão, ciclo, takt, ocupação, ciclos |
| ESTOQUES (2) | `ResultadoPorAtividade.estoqueFinal` | — |
| ESTOQUE FINAL | `ResultadoPorAtividade.estoqueFinal` | Consolidado na mesma linha |
| GRÁFICOS, ANÁLISE VISUAL | — | Visualização; consome os resultados, não é dado |
| RESULTADO | `ResultadoGlobal` | Eficiência, gargalo, lead time, WIP |
| ESTOQUES, RESULT, TABELAS DINÂMICAS, SOBRE | — | Legado ou apoio; não migram |

As duas abas que o plano trata como a melhoria do professor — LOGICA PROCESSO e
FLUXOGRAMA — colapsam em **uma** estrutura, `Sequencia`. Era o ponto da
mudança: o desenho e a lógica deixam de ser coisas separadas, e passam a ser o
dado que dirige o cálculo.

## Perguntas abertas

Nada aqui bloqueia a Fase 2, mas vale decidir antes de o motor congelar as
unidades:

1. **`ocupacao` em fração e `ocupacaoMedia` em porcentagem** — unificar as duas
   em fração (e formatar só na tela) ou manter como no inventário?
2. **`leadTime` e `wip` sem sufixo de unidade** — renomear para `leadTimeMin`,
   seguindo a convenção do resto do modelo?
3. **Afunilamento:** quando várias atividades alimentam a mesma, a produção
   soma, ou há uma proporção por conexão? Se houver, ela entra como campo de
   `ConexaoSequencia`.
4. **`processo`:** confirmar que os cenários do v1 (robô e trem) têm um único
   processo, ou se o campo precisa realmente dirigir algo no cálculo.
5. **Inspeção:** a planilha sorteia a aprovação. O modelo guarda apenas os
   parâmetros (`minimoAprovacao`), sem campo de resultado da inspeção, porque a
   decisão entre determinístico e aleatório está aberta no plano. Se a inspeção
   virar um resultado, ela ganha campos em `ResultadoGlobal`.
