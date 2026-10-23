# 0004 — Camada de tela: identidade, rotas e a fronteira com o motor

- **Data:** 2026-10-23
- **Status:** aceita
- **Fase:** 3

## Contexto

Até a Fase 2 o projeto era um motor de cálculo com testes e nenhuma interface.
A Fase 3 abre a camada de tela com três páginas aprovadas em entrega de design
(DP-1, estética 1E geométrico UTFPR): abertura, apresentação e o primeiro dos
quatro passos do caminho dos dados.

Três perguntas precisavam de resposta antes de escrever a primeira tela, e
nenhuma delas é sobre pixel:

1. **Onde mora a cor?** Um projeto com identidade institucional aprovada não
   pode ter cor escrita dentro de componente.
2. **O que a tela guarda?** O formulário do cenário é o mesmo `Cenario` que o
   motor consome, ou são duas coisas?
3. **Quem valida?** A decisão
   [0003](0003-premissas-do-motor-de-calculo.md) tirou a validação do motor e a
   empurrou "para a camada de entrada". Esta é a camada de entrada.

## Decisão

### 1. Os tokens são a única fonte de cor

Todas as cores da identidade estão em `src/styles/tokens.css`, num bloco
`@theme` que o Tailwind 4 lê para gerar as utilidades (`bg-yellow`, `text-dark`,
`border-line`) e que publica as mesmas variáveis em CSS.

**Nenhum componente declara cor própria.** Se uma cor não está no arquivo de
tokens, ela não existe na identidade — e acrescentar uma é uma mudança de
identidade, não de componente.

A identidade tem **dois modos**, e cada tela pertence a um:

| Modo | Fundo | Onde | O que caracteriza |
| --- | --- | --- | --- |
| **Presença** | `dark` | splash, entrada | Formas geométricas amarelas cheias, tipografia grande. Vista de longe, numa projeção. |
| **Dados** | `light-bg` | cenário, atividades, sequência, resultados | As mesmas formas rebaixadas a textura (7% a 10%), tipografia funcional. Vista de perto, para trabalhar. |

A separação não é estética: ela diz à pessoa em que tipo de tela está. Fundo
escuro é apresentação, fundo claro é trabalho.

Duas regras de forma valem no projeto inteiro, e estão no `index.css` em vez de
repetidas em cada componente:

- **Raio zero** em botão, campo e seleção. Arestas retas são a assinatura da 1E.
- **Nenhuma sombra.** O relevo vem de borda e de contraste de cor, nunca de
  blur. Um `shadow-*` do Tailwind no código é erro de identidade.

### 2. O formulário da tela não é o `Cenario` do motor

`FormularioCenario` (em `src/state/cenario.ts`) é o que a tela mostra; `Cenario`
(em `src/types`) é o que o motor consome. A conversão acontece num lugar só,
`cenarioDoFormulario`.

Parecia duplicação até os frames aprovados mostrarem três diferenças reais:

| Diferença | Por quê |
| --- | --- |
| A tela pede o tempo de inspeção em **segundos** (`6,5 s`); o modelo guarda **minutos** | É a ordem de grandeza da medição. Ninguém digita `0,108` min. |
| A tela **não pede o tempo de descanso** | A Parada P1 mostrou que a planilha não o desconta (divergência D-10). Um campo que não afeta resultado nenhum não entra na tela. O modelo ainda o exige, e ele vai como zero. |
| A tela **não pede a parada não planejada** | Nenhuma fórmula a consome (divergência D-5). Vai como `null`. |

Se os dois tipos fossem um só, a conversão de segundos ficaria espalhada pelas
telas e os dois campos ausentes virariam `0` sem ninguém saber por quê. Com a
fronteira explícita, resolver D-10 ou D-5 é mexer num arquivo.

**As porcentagens não são convertidas.** `% inspecionada` e `mínimo de
aprovação` passam inteiras (`100`, `98`), que é a unidade que o modelo documenta
e a que o motor espera — ver a divergência D-14.

### 3. Uma rota por passo, com o estado acima do roteador

```text
/            -> /splash
/splash      abertura, avança sozinha em 2,5 s
/entrada     apresentação
/cenario     passo 1 de 4
/atividades  passo 2 — placeholder da Fase 4
```

O `ProvedorCenario` fica **acima** do roteador, não dentro de uma rota: trocar
de tela não pode custar o que a pessoa já preencheu. O formulário também
persiste em `localStorage`, para sobreviver ao recarregar a página.

A persistência **falha em silêncio**: navegação privada, armazenamento cheio ou
um formulário salvo por uma versão anterior caem nos valores iniciais sem travar
a tela. Perder o rascunho é ruim; não abrir é pior.

Os passos do header ainda **não navegam**. Enquanto só o passo 1 existe de
verdade, um passo clicável só levaria a lugar nenhum. Eles entram como navegação
quando as telas existirem.

### 4. A validação ainda não é desta fase

A decisão 0003 tirou a validação do motor dizendo que ela é da camada de
entrada. Esta fase entrega a camada de entrada, mas **só a contenção de campo**:
mínimo, máximo e recusa de valor não numérico, direto no componente de campo.

Não há ainda aviso de cenário incoerente — demanda zero, lote maior que a
demanda, turno líquido negativo. Isso exige decidir o que dizer à pessoa e onde
dizer, e a tela de Atividades (Fase 4) vai trazer as suas próprias regras. Fazer
metade agora e metade depois produziria duas gramáticas de erro diferentes.

O que existe hoje contra número absurdo: o campo não aceita valor fora da faixa,
e o indicador de tempo disponível nunca mostra negativo.

## Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| **Usar `Cenario` direto como estado do formulário** | Esconderia as três diferenças da seção 2 e espalharia a conversão de segundos pelas telas. |
| **Guardar os campos como texto enquanto se digita** | Resolve o campo vazio de forma elegante, mas obriga toda leitura a converter. O componente de campo já lida com isso: enquanto não dá para ler um número, ele simplesmente não propaga a alteração. |
| **Cores direto nos componentes, com as utilidades do Tailwind** (`bg-yellow-400`) | A paleta do Tailwind não é a da UTFPR. Um `yellow-400` parecido é pior do que uma cor errada óbvia, porque ninguém percebe. |
| **Navegação pelos passos do header já nesta fase** | Três dos quatro passos não existem. |
| **Validação completa do cenário agora** | Ver a seção 4. |

## Consequências

- Trocar a identidade é editar `src/styles/tokens.css`. Nenhum componente
  precisa ser tocado.
- As telas seguintes herdam `HeaderSimulador`, `CampoNumero`, `CampoSelecao`,
  `TituloSecao` e as duas famílias de formas. A Fase 4 não redesenha nada disso.
- A Parada P2 (o cenário do robô entrando pela interface e alimentando o motor
  certo) só pode rodar quando a tela de Atividades existir, porque o motor
  precisa das atividades para devolver qualquer número. Fica para o fim da
  Fase 4, como o plano prevê.
- Os arquivos de identidade foram renomeados para a convenção que
  `src/assets/README.md` já documentava (minúsculas, hífen, sem acento): os
  nomes originais tinham espaços, parênteses e um erro de digitação, e caminhos
  assim são frágeis em import.
