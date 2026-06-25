# Simulador Aspirador 3D

Trabalho de Computação Gráfica - Passeio Virtual 3D implementado com **WebGL puro** (sem Three.js ou bibliotecas gráficas de alto nível).

##  Descrição

Simulador de aspirador de pó em ambiente 3D com **três tipos de agentes inteligentes** (Reativo, Modelo, Onisciente), oferecendo:

- **Menu interativo** para escolher entre simulação gráfica 3D ou em lote
- **Simulação gráfica**: Visualização 3D em tempo real do aspirador limpando sujeira
- **Simulação em lote**: Execute múltiplas simulações para análise estatística
- **Estatísticas acumuladas** de pontuação, taxa de sucesso e passos (salvas no navegador)

## Requisitos Atendidos

### Funcionalidades Técnicas Obrigatórias

-  **Projeção perspectiva** com câmera em primeira pessoa
-  **Iluminação Phong** com modelo de reflexão completo (ambiente + difusa + especular)
-  **Fonte de luz animada** que circula pela cena
-  **Objeto animado** com transformações geométricas (aspirador se move e rotaciona)
-  **Objetos com textura** (chão com padrão xadrez, tapete com textura PNG)
-  **Objetos com cor sólida** (paredes, móveis, aspirador, sujeira)
-  **WebGL puro** (versão 1.0) sem bibliotecas gráficas de alto nível
-  **Math.js** utilizado apenas para álgebra linear (matrizes de transformação)
-  **Canvas HTML5** como contexto gráfico
-  **Controles via teclado** (WASD/setas) e mouse

### Requisitos Específicos do Passeio Virtual

-  **Câmera em primeira pessoa** que segue o aspirador
-  **Controle de câmera** via teclado (WASD/setas) e mouse (pointer lock)
-  **Sem detecção de colisão** (conforme especificação)
-  **Cenário construído manualmente** no código (sem importação de modelos externos)

##  Modos de Simulação

### 1. Simulação Gráfica (3D)

Visualize o aspirador limpando a sala em tempo real com:

- **Câmera em primeira pessoa**: Acompanhe o aspirador de seus "olhos"
- **Visão de topo**: Alternar com tecla `C` para visão estratégica da sala
- **Controles responsivos**: WASD para mover, mouse para olhar ao redor
- **HUD informativo**: Estatísticas em tempo real (passos, sujeira, pontuação)

**Tipos de Agentes:**

| Agente | Descrição |
|--------|-----------|
| **Reativo** | Reage apenas ao que percebe no momento (sem memória) |
| **Modelo** | Lembra de onde já passou para evitar repetição |
| **Onisciente** | Conhece todo o mapa e planeja a rota ótima |

### 2. Simulação em Lote

Execute múltiplas simulações de cada tipo de agente para análise estatística:

- Configure quantas execuções de cada agente
- Acompanhe progresso em tempo real
- Visualize estatísticas completas ao final
- Dados acumulados entre sessões (salvos no localStorage)

##  Cenário 3D

A sala é composta por:

- **Chão** com textura de padrão xadrez
- **Paredes** com cor sólida bege
- **Móveis detalhados**:
  - Cama com colchão e travesseiro
  - Cadeira com 4 pernas e encosto
  - Mesa com abajur (haste + cúpula + luz)
  - Cômoda com 3 gavetas
  - Lixeira com tampa e alça
- **Decorações**:
  - Tapete com textura PNG
  - Quadro na parede
- **Aspirador de pó** modelo detalhado com:
  - Corpo principal (disco achatado)
  - Tampo superior e anel de destaque
  - Botão liga/desliga e luz indicadora
  - 2 rodas laterais e 1 rodinha frontal giratória
  - Escova frontal (2 partes cruzadas)
  - Depósito de pó transparente
- **Sujeira** representada por partículas aleatórias marrons

## Controles

### Menu Principal
- Clique nos botões para navegar entre modos

### Simulação 3D

| Tecla | Ação |
|-------|------|
| **W** ou **↑** | Mover câmera para frente |
| **S** ou **↓** | Mover câmera para trás |
| **A** ou **←** | Mover câmera para esquerda |
| **D** ou **→** | Mover câmera para direita |
| **Mouse** | Olhar ao redor (clique na tela primeiro para ativar) |
| **C** | Alternar entre visão primeira pessoa e visão de topo |
| **ESC** | Voltar ao menu principal |

> **Dica**: Clique na tela do WebGL para ativar o controle do mouse (pointer lock).

## Tecnologias Utilizadas

- **WebGL 1.0** - API gráfica para renderização 3D
- **JavaScript ES6** - Linguagem de programação
- **Math.js** - Biblioteca para álgebra linear (apenas para matrizes)
- **HTML5 Canvas** - Contexto gráfico
- **GLSL** - Shaders (vertex e fragment shaders)

### Arquitetura do Motor WebGL

O projeto implementa um **motor WebGL próprio** com as seguintes classes:

```
js/core/
├── WebGLContext.js   # Inicialização do contexto WebGL
├── Shader.js         # Compilação e linking de shaders
├── Buffer.js         # Gerenciamento de buffers de vértices
├── Mesh.js           # Representação de malhas 3D
├── Texture.js        # Carregamento e gerenciamento de texturas
├── Renderer.js       # Motor de renderização
├── Camera.js         # Sistema de câmera com projeção perspectiva
├── Transform.js      # Transformações geométricas (T, R, S)
├── Light.js          # Sistema de iluminação
├── Scene.js          # Gerenciamento de cena
└── Cube.js           # Primitiva geométrica (cubo)
```

## Estrutura do Projeto

```
trabalho-cg/
├── index.html                    # Página principal com shaders GLSL
├── README.md                     # Este arquivo
├── INICIAR.bat                   # Script de inicialização (Windows)
├── debug.html                    # Página de debug
├── estrutura.txt                 # Documentação da estrutura
│
├── js/
│   ├── main.js                   # Ponto de entrada da aplicação
│   │
│   ├── core/                     # Motor WebGL (renderização 3D)
│   │   ├── WebGLContext.js
│   │   ├── Shader.js
│   │   ├── Buffer.js
│   │   ├── Mesh.js
│   │   ├── Texture.js
│   │   ├── Renderer.js
│   │   ├── Camera.js
│   │   ├── Transform.js
│   │   ├── Light.js
│   │   ├── Scene.js
│   │   └── Cube.js
│   │
│   ├── simulacao/                # Lógica da simulação (agentes inteligentes)
│   │   ├── mundo.js              # Mundo do aspirador (ambiente)
│   │   ├── simulador.js          # Controlador da simulação
│   │   ├── AgenteBase.js         # Classe base dos agentes
│   │   ├── AgenteReativo.js      # Agente reativo (sem memória)
│   │   ├── AgenteModelo.js       # Agente com modelo interno
│   │   ├── AgenteOnisciente.js   # Agente com conhecimento completo
│   │   └── Obstaculo.js          # Sistema de obstáculos
│   │
│   ├── app/                      # Aplicação principal
│   │   ├── AspiradorScene3D.js   # Cena 3D e renderização
│   │   ├── AppController.js      # Controlador da aplicação
│   │   └── StatsStore.js         # Gerenciamento de estatísticas
│   │
│   ├── visualizacao/             # Módulos de visualização
│   │
│   └── imagens/                  # Recursos de textura
│       └── tapete.png            # Textura do tapete
│
└── (outros arquivos)
```

## Como Executar

### Opção 1: Servidor Local (Recomendado)

Abra o terminal na pasta do projeto e execute:

```bash
# Python 3
python -m http.server 8080

# Ou Python 2
python -m SimpleHTTPServer 8080
```

Acesse no navegador: `http://localhost:8080`

### Opção 2: Extensão Live Server (VS Code)

Se usar VS Code com a extensão **Live Server**:

1. Clique com botão direito em `index.html`
2. Selecione **"Open with Live Server"**

### Opção 3: Script Windows

Execute o arquivo `INICIAR.bat` (disponível apenas para Windows).

> **Nota**: Abrir o `index.html` diretamente pelo Explorer (`file://`) pode falhar ao carregar recursos em alguns navegadores devido a políticas de CORS.

##  Conceitos de Computação Gráfica Aplicados

### 1. Pipeline de Renderização WebGL

```
Vértices → Vertex Shader → Rasterização → Fragment Shader → Framebuffer
```

### 2. Transformações Geométricas

- **Translação**: Posicionamento de objetos no mundo 3D
- **Rotação**: Orientação do aspirador e câmera
- **Escala**: Dimensionamento de objetos

Matrizes de transformação implementadas usando Math.js:
```
Model Matrix = T × R × S
```

### 3. Iluminação Phong

Modelo de iluminação local com três componentes:

```
Cor final = (Ia × Ka) + (Id × Kd × max(N·L, 0)) + (Is × Ks × max(R·V, 0)^n)
```

Onde:
- **Ia, Id, Is**: Intensidades ambiente, difusa e especular
- **Ka, Kd, Ks**: Coeficientes de reflexão
- **N**: Vetor normal da superfície
- **L**: Vetor direção da luz
- **R**: Vetor refletido
- **V**: Vetor visão
- **n**: Expoente de especularidade (shininess)

### 4. Sistema de Câmera

- **Matriz View**: Transformação do mundo para espaço da câmera
- **Matriz Projection**: Projeção perspectiva com frustum
- **Controles**: Rotação via Euler angles, translação livre

### 5. Mapeamento de Texturas

- Coordenadas UV por vértice
- Interpolação linear no rasterizador
- Amostragem com filtragem bilinear

##  Agentes Inteligentes

### Agente Reativo
- **Tipo**: Baseado em reações simples
- **Memória**: Nenhuma
- **Estratégia**: Reage apenas à percepção atual (sujeira à frente, obstáculos)

### Agente com Modelo
- **Tipo**: Baseado em modelo interno
- **Memória**: Lembra posições visitadas
- **Estratégia**: Evita revisitar células já limpas

### Agente Onisciente
- **Tipo**: Baseado em conhecimento completo
- **Memória**: Mapa completo do ambiente
- **Estratégia**: Planeja rota ótima para limpar toda a sujeira

## Estatísticas

O sistema registra e acumula estatísticas entre sessões:

- **Total de simulações** executadas
- **Taxa de sucesso** (porcentagem de limpeza completa)
- **Média, mínimo e máximo de passos**
- **Cobertura média** (porcentagem de sujeira removida)
- **Pontuação média, mínima e máxima**

Dados são persistidos no `localStorage` do navegador.

##  Objetivos de Aprendizado

Este projeto demonstra:

1. **Programação WebGL direta** sem abstrações de alto nível
2. **Implementação de shaders GLSL** para iluminação realista
3. **Sistemas de câmera** com projeção perspectiva
4. **Transformações geométricas 3D** com matrizes
5. **Texturização e mapeamento UV**
6. **Agentes inteligentes** com diferentes níveis de racionalidade
7. **Arquitetura de motor gráfico** modular e extensível

## Vídeo de Demonstração
[Clique aqui para assistir](https://www.youtube.com/watch?v=rrZ1ND3pwwY)

##  Autor

Maurílio Salvaterra Cordeiro Neto


**Nota**: Este projeto foi desenvolvido exclusivamente para fins educacionais, atendendo aos requisitos da disciplina de Computação Gráfica.