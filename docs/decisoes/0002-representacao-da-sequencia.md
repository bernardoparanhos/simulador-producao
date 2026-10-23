# 0002 — Representação da sequência de atividades

- **Data:** 2026-10-23
- **Status:** aceita
- **Fase:** 1

## Contexto

A sequência de atividades é a melhoria central do projeto. Na planilha ela está
partida em duas abas (LOGICA PROCESSO e FLUXOGRAMA), é preenchida à mão e —
o problema de verdade — **não alimenta o cálculo**: o fluxograma é um desenho, e
os números são calculados em outro lugar, por fórmulas que não sabem quem
alimenta quem.

No sistema a sequência precisa ser um dado de primeira classe, porque é ela que
vai determinar por onde a produção caminha e onde o gargalo limita o fluxo
(Fase 2) e porque é ela que a pessoa vai montar na tela, arrastando e
conectando nós no React Flow (Fase 4).

Três exigências, então:

1. Representar afunilamento: várias atividades de uma etapa alimentando uma
   atividade da etapa seguinte.
2. Ser percorrível pelo motor, para propagar o gargalo a montante e a jusante.
3. Ser convertível para o formato do React Flow sem contorcionismo — e sem que
   o modelo de domínio passe a depender da biblioteca.

## Decisão

A sequência é um **grafo dirigido**: uma lista de nós e uma lista de conexões,
em `src/types/sequencia.ts`.

```ts
interface Sequencia {
  nos: NoSequencia[]
  conexoes: ConexaoSequencia[]
}

interface NoSequencia {
  atividadeId: AtividadeId
  posicao?: Posicao          // só visual; o motor ignora
}

interface ConexaoSequencia {
  id: ConexaoId
  origem: AtividadeId        // alimenta
  destino: AtividadeId       // é alimentada
}
```

Três escolhas dentro dessa forma:

### 1. A identidade do nó é o `atividadeId`

Não existe um id de nó separado. Um nó *é* uma atividade colocada no fluxo, e
por consequência cada atividade aparece no máximo uma vez na sequência.

Por quê: casa com a planilha (uma linha por atividade, com sua etapa e sua
linha) e casa com os resultados — há um `ResultadoPorAtividade` por atividade.
Se a mesma atividade pudesse aparecer duas vezes no fluxo, sua ocupação e seu
estoque ficariam ambíguos: qual das duas aparições o número descreve?

Consequência: se mais adiante for preciso reaproveitar a mesma atividade em dois
pontos do fluxo (uma inspeção que acontece duas vezes, por exemplo), o caminho
é cadastrar duas atividades, ou introduzir um `NoSequenciaId` próprio e passar
os resultados a serem por nó. É uma mudança localizada, mas não é de graça — por
isso a restrição está documentada, e não implícita.

### 2. Etapa e linha moram na atividade, não no nó

`etapa`, `linha` e `processo` são campos de `Atividade`. O nó da sequência não
os repete.

Por quê: uma informação, um lugar. Se o nó também carregasse etapa e linha,
haveria dois valores para a mesma verdade e, inevitavelmente, o dia em que eles
discordam. A posição *lógica* da atividade no processo é atributo da atividade;
o nó só diz que ela entrou no fluxo.

### 3. A posição no canvas é opcional e puramente visual

`NoSequencia.posicao` só existe depois que a pessoa arrasta o nó. Enquanto não
existir, a interface deriva a posição da grade: etapa no eixo X, linha no eixo
Y. Assim um fluxo recém-criado já aparece organizado, e o motor de cálculo nunca
olha para pixels.

## Por que existe uma lista de nós, se os nós são atividades

Porque **estar cadastrada e estar no fluxo são coisas diferentes**. A pessoa
cadastra atividades na tela de Atividades e depois monta o fluxo; entre os dois
momentos existe uma atividade cadastrada que ainda não entrou na sequência. A
lista `nos` é o que diz explicitamente o que já entrou, e é onde a posição
arrastada persiste.

A alternativa — considerar "está no fluxo" como "aparece em alguma conexão" —
tornaria impossível ter um nó solto no canvas, que é exatamente o estado normal
de quem está montando o fluxo e ainda não ligou aquele nó a nada.

## Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| **Lista de predecessores dentro de `Atividade`** (`atividade.alimentadaPor: AtividadeId[]`) | Mistura o catálogo com o fluxo: trocar a sequência passaria a editar as atividades. Também não dá lugar para a posição no canvas nem para a identidade da aresta que o React Flow pede. |
| **Matriz de adjacência** (`boolean[][]` etapa × linha) | Compacta e boa para percorrer, mas ilegível para quem lê o JSON do cenário, frágil a inserções no meio e sem lugar para atributos da conexão (uma proporção de fluxo, por exemplo). |
| **Sequência implícita por etapa e linha** (toda atividade da etapa *n* alimenta toda atividade da etapa *n+1*) | É mais ou menos o que a planilha faz, e é justamente o que o professor pediu para resolver: não expressa afunilamento, que é o caso real. |
| **Guardar direto no formato do React Flow** (`Node[]` e `Edge[]` do `@xyflow/react`) | Tentador, porque elimina o adaptador. Mas amarraria o motor de cálculo e os cenários salvos à API de uma biblioteca de interface, contra o princípio do plano de manter o motor independente da tela. A conversão é de dez linhas; a dependência seria para sempre. |

## Reafirmada na preparação da Fase 5

A especificação de preparação do construtor de fluxo propôs um modelo com
outros nomes:

```ts
interface SequenciaNodePosition { id: string; x: number; y: number }
interface SequenciaEdge { id: string; source: string; target: string }
interface Sequencia { nodePositions: SequenciaNodePosition[]; edges: SequenciaEdge[] }
```

É **o mesmo grafo** desta decisão, com os nomes do React Flow: `nodePositions`
são os `nos`, `edges` são as `conexoes`, `source`/`target` são
`origem`/`destino`. A forma proposta achata a posição no nó, que aqui é um
objeto opcional.

O modelo original foi mantido, por três razões:

1. **O motor consome `Sequencia` direto.** `propagarGargalo` percorre
   `conexoes` lendo `origem` e `destino`; `simular` recebe a sequência inteira.
   Renomear significaria reescrever o motor, os dois fixtures e os testes que
   as Paradas P1 e P2 travam — um diff grande, com risco real, para uma troca
   de nomes.
2. **Adotar os nomes da biblioteca é exatamente a alternativa que esta decisão
   descartou.** O argumento continua valendo: amarraria o motor e os cenários
   salvos à API de uma biblioteca de interface. A conversão é de dez linhas; a
   dependência seria para sempre.
3. **O vocabulário do projeto é o do domínio, em português** — é o primeiro
   princípio de `docs/modelo-de-dados.md`, e `source`/`target` o quebrariam no
   meio do caminho dos dados.

O que a proposta trouxe de novo e **foi adotado**:

- a **convenção de id das ligações**, `e-<origem>-<destino>`, agora em
  `idDaConexao`. Derivar o id das pontas faz a mesma ligação ter sempre o mesmo
  id, o que torna a detecção de repetida uma comparação de `id`;
- a forma achatada `{ id, x, y }` como **entrada e saída das ações de posição**
  (`PosicaoDeNo`, em `src/state/sequencia.ts`), para o canvas não montar objeto
  aninhado a cada arrasto. É forma de interface, não de armazenamento.

A tradução para o React Flow está travada por um teste na Parada P3, que também
é o único ponto do projeto que encosta nos tipos de `@xyflow/react`.

## Consequências

- O motor da Fase 2 recebe um grafo e pode percorrê-lo: encontrar as atividades
  iniciais (sem conexão de entrada), propagar a produção a jusante e identificar
  o gargalo pelo caminho.
- A conversão para o React Flow é um adaptador na camada de interface:
  `NoSequencia → Node`, `ConexaoSequencia → Edge`. O modelo de domínio
  continua sem saber que o React Flow existe.
- O modelo permite grafos que não fazem sentido no domínio: conexão apontando
  para uma etapa anterior, ciclo, nó referenciando atividade inexistente. O tipo
  não impede nada disso — a validação é trabalho da Fase 2, e precisa existir.
- Falta decidir o que acontece quando várias origens alimentam um mesmo destino:
  a produção soma, ou há proporção por conexão? Se houver proporção, ela entra
  como campo de `ConexaoSequencia`. Registrado como `TODO(Fase 2)` no código.
