# Passeio Virtual 3D - Sala

Trabalho de Computação Gráfica: passeio virtual em primeira pessoa por uma sala 3D, implementado com **WebGL puro** (sem Three.js).

## Descricao

Simulador de aspirador de po com **tres tipos de agentes** (Reativo, Modelo, Onisciente), com:

- **Menu inicial** para escolher modo grafico (3D) ou em lote
- **Simulacao grafica**: sala 3D em WebGL, aspirador limpando sujeira em tempo real
- **Simulacao em lote**: configure quantas execucoes de cada agente rodar
- **Estatisticas acumuladas** de pontuacao, taxa de sucesso e passos (salvas no navegador)

## Controles (modo 3D)

| Tecla | Acao |
|-------|------|
| WASD / setas | Mover camera |
| Mouse | Olhar (clique na tela primeiro) |
| ESC | Voltar ao menu |

## Requisitos atendidos

- Projeção perspectiva e câmera em primeira pessoa
- Iluminação Phong com fonte de luz em movimento
- Objeto animado (vaso e planta girando)
- Objetos com textura (chão xadrez e quadro na parede)
- Objetos com cor sólida (paredes, móveis, cadeira)
- WebGL puro + Math.js para álgebra linear
- Controles via teclado (WASD/setas) e mouse

## Como executar

### Opção 1: Servidor local (recomendado)

Abra o terminal na pasta do projeto e execute:

```bash
python -m http.server 8080
```

Acesse no navegador: `http://localhost:8080`

### Opção 2: Extensão Live Server

Se usar VS Code/Cursor com a extensão **Live Server**, clique com botão direito em `index.html` → **Open with Live Server**.

> Abrir o `index.html` diretamente pelo Explorer (`file://`) pode falhar ao carregar recursos em alguns navegadores.

## Controles

| Tecla | Ação |
|-------|------|
| W / ↑ | Andar para frente |
| S / ↓ | Andar para trás |
| A / ← | Andar para esquerda |
| D / → | Andar para direita |
| Mouse | Olhar ao redor (após clicar na tela) |

## Estrutura do projeto

```
trabalho-cg/
├── index.html          # Página principal e shaders GLSL
├── js/
│   ├── main.js         # Inicialização
│   ├── app/
│   │   └── integradorApp.js   # Cena, loop e controles
│   └── core/           # Motor WebGL (câmera, luz, mesh, textura...)
└── README.md
```

## Tecnologias

- WebGL 1.0
- JavaScript (ES6)
- Math.js (matrizes e álgebra linear)

## Apresentação

- Slides: _(inserir link do Google Slides)_
- Vídeo demo: _(inserir link do YouTube)_

## Autores

_(inserir nomes da equipe)_
