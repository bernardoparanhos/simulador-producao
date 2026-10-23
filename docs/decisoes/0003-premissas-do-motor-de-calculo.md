# 0003 — Premissas do motor de cálculo

- **Data:** 2026-10-23
- **Status:** aceita, com pontos a confirmar na Parada P1
- **Fase:** 2

## Contexto

As fórmulas da Fase 2 vieram da planilha, extraídas e passadas ao
desenvolvimento como fonte de verdade ("implemente exatamente assim"). Ao
implementá-las apareceram três situações que nenhuma fórmula resolvia:

1. Campos do modelo de dados que **nenhuma fórmula consome** (`numOperadores`,
   `paradaNaoPlanejada`, `minimoAprovacao`).
2. Uma decisão de produto **sem fórmula correspondente**: "o tempo de inspeção
   entra no cálculo" — mas em qual conta?
3. Uma regra de propagação **ambígua** quanto a qual grandeza se propaga.

Em todos os casos havia duas saídas: inventar a fórmula que faz sentido no
domínio, ou ficar fiel ao que foi recebido. Inventar produziria números
plausíveis que não batem com a planilha, e a Parada P1 existe justamente para
comparar com a planilha — um número inventado faria a P1 reprovar o motor por um
erro que não é do motor, ou, pior, passar por coincidência.

## Decisão

Três regras, em ordem de precedência:

### 1. Fidelidade às fórmulas recebidas

Onde existe fórmula, o motor implementa aquela fórmula, mesmo quando o domínio
sugere outra. O lugar de discutir a fórmula é a P1, com a planilha aberta, não o
código.

Caso concreto: `tempoCicloMin = tempoPadraoMin + setupMin / tamanhoLote` **não
divide por `numOperadores`**, embora o modelo de dados defina o campo como
postos de trabalho em paralelo. O motor não divide. Há um teste em
`motor.test.ts` que trava essa escolha (`ignora numOperadores`), para que ela
nunca mude por acidente — só por decisão.

### 2. Onde não há fórmula, o motor não inventa uma

Campos sem fórmula ficam sem efeito no cálculo, com `TODO(P1)` no código
apontando a ausência. É melhor um campo visivelmente inerte do que um número
silenciosamente inventado.

Caso concreto: `cenario.paradaNaoPlanejada` não entra em conta nenhuma. A
leitura natural seria descontar seus minutos do tempo disponível da atividade
atingida, mas nenhuma fórmula recebida tem lugar para um tempo disponível por
atividade — a fórmula da capacidade usa o tempo disponível global. Fazer isso
exigiria mudar uma fórmula que foi dada como exata.

### 3. Exceção: uma decisão explícita de produto vale como instrução

Quando o briefing decide algo em texto, o motor cumpre a decisão e escolhe o
ponto de aplicação **mais conservador e mais isolado possível**, documentando-o
como premissa.

Caso concreto, a inspeção. A decisão 5 do briefing diz que, com
`porcentagemInspecionada > 0`, o tempo de inspeção entra no cálculo. Nenhuma
fórmula diz onde. O motor calcula

```text
tempoInspecaoPorPecaMin = tempoPorPecaMin * (porcentagemInspecionada / 100)
```

e soma esse valor ao `tempoCicloMin` de cada atividade. O raciocínio: o tempo de
ciclo é o único lugar dimensionalmente compatível (min/unid.) entre as fórmulas
recebidas, e é o ponto a partir do qual a inspeção afeta capacidade, ocupação e
gargalo — ou seja, "entra no cálculo" de verdade. O termo vale zero quando a
porcentagem é zero, então cenários sem inspeção ficam idênticos às fórmulas
puras da planilha.

**O risco, explícito:** se na planilha a inspeção acontece num ponto único do
fluxo, cobrá-la de todas as atividades superestima todos os tempos de ciclo. É a
primeira hipótese a testar se os números do robô não baterem.

A `minimoAprovacao` fica como função separada (`calcularTaxaAprovacao`),
determinística conforme a decisão 5, e **não é consumida por nenhuma fórmula** —
cai na regra 2.

## O motor não valida a entrada

Decisão de fronteira, não de fórmula: `simular()` aceita qualquer
`EntradaSimulacao` com a forma correta e calcula o que der. Demanda zero, lote
zero, grafo com ciclo, conexão apontando para atividade inexistente — nada disso
lança erro nem é corrigido.

Por quê: validar exige decidir o que fazer com o dado inválido, e essa decisão é
de interface (avisar a pessoa no campo, impedir a conexão no canvas). Um motor
que valida devolve ou exceção, ou resultado parcial, ou valor corrigido — e
qualquer das três escolhas atrapalha a camada que realmente sabe o que dizer ao
usuário. A validação entra nas Fases 3 e 4, onde tem tela para mostrar o aviso.

A única concessão são os limites defensivos que impedem o motor de **travar ou
devolver `NaN` gratuito**:

| Situação | O que o motor faz |
| --- | --- |
| Ciclo no grafo | Resolve as atividades presas no ciclo na ordem da lista, com os limites que já conseguiu determinar. Sem significado de domínio, mas sem laço infinito. |
| Conexão para atividade inexistente | Ignora a conexão. |
| Conexão repetida | Conta uma vez. |
| Lista de atividades vazia | Indicadores globais em zero, gargalo `null` — em vez de `NaN` de média de lista vazia. |
| `tempoCicloMin` igual a zero | Capacidade `Infinity`. Não é tratado: é entrada inválida, e `Infinity` é um sintoma visível. |

## A propagação usa a produção realizada, não a capacidade

O briefing diz: "a `producaoRealizadaDiaria` de cada atividade é limitada pela
menor capacidade entre ela e todas as suas predecessoras diretas". Lido ao pé da
letra, "capacidade das predecessoras" seria a `capacidadeDiaria` delas. O motor
usa a **produção realizada** das predecessoras:

```text
producaoRealizadaDiaria[a] = min(
  capacidadeDiaria[a],
  producaoRealizadaDiaria[p] para toda predecessora direta p de a
)
```

Duas razões:

1. **O próprio briefing pede ordem topológica.** Se o limite fosse a capacidade
   das predecessoras, a ordem de cálculo seria irrelevante — cada atividade
   olharia valores já conhecidos de antemão. Ordem topológica só é necessária
   porque o valor de uma atividade depende de um valor que precisa ter sido
   calculado antes.
2. **É o que "o gargalo propaga" significa** (decisão 3 do briefing). Numa
   cadeia de três etapas com capacidades 80, 500 e 400, a leitura literal daria
   produção 400 na terceira etapa, embora só 80 peças cheguem até ela. Com a
   produção realizada, a terceira etapa produz 80 — o gargalo atravessa a linha
   inteira, que é o comportamento que a planilha não tinha e que o projeto
   existe para corrigir.

Diferença material em cadeias de três ou mais etapas. Registrado para
confirmação na P1.

## Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| **Inventar as fórmulas que faltam** (dividir por `numOperadores`, descontar a parada do tempo disponível da atividade) | Produziria números plausíveis e não auditáveis. A P1 compara com a planilha; um número inventado estraga a comparação nas duas direções. |
| **Deixar a inspeção totalmente de fora** | Contraria uma decisão explícita do briefing. A decisão existe; o que falta é só o ponto de aplicação. |
| **Validar a entrada dentro do motor** | Mistura responsabilidades e tira da interface a decisão de como avisar o usuário. Ver a seção acima. |
| **Lançar erro em grafo com ciclo** | O motor viraria fonte de exceção para a tela, que vai ter grafos temporariamente inválidos enquanto a pessoa monta o fluxo. Melhor calcular algo e deixar a validação avisar. |

## Consequências

- Todo campo e toda fórmula com pendência está marcado com `TODO(P1)` no
  código. `grep -rn "TODO(P1)" src/` lista a agenda da Parada P1.
- O motor é determinístico e puro: mesma entrada, mesma saída, sem sorteio. Isso
  deixa de ser verdade quando a inspeção aleatória da planilha for implementada
  (`TODO(Fase 7)`), e aí os testes precisam de semente fixa.
- `motor.test.ts` trava as escolhas desta decisão com testes nomeados, de modo
  que mudá-las exige mudar um teste de propósito — não dá para mudar por
  descuido.
- As divergências entre fórmulas e modelo de dados estão listadas, uma a uma,
  com impacto estimado, em [`docs/fases/fase-2.md`](../fases/fase-2.md).
