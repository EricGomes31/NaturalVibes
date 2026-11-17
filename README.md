# Natural Vibes — Sabonetes Artesanais

Landing page da **Natural Vibes**, uma marca de sabonetes artesanais de glicerina feitos com ervas, flores e óleos essenciais: 100% naturais, veganos e cruelty-free.

## Seções do site

- **Início:** apresentação da marca
- **Essência:** a história e a proposta de produção artesanal
- **Produtos:** linha de sabonetes
  - Lavanda & Camomila
  - Capim-Limão & Erva-Doce
  - Alecrim & Hortelã
  - Calêndula & Aveia
  - Rosas & Argila Rosa
  - Carvão Vegetal & Tea Tree
- **Ingredientes:** glicerina vegetal, óleos essenciais, ervas e flores, argilas naturais, manteiga de karité e aveia orgânica
- **Depoimentos:** relatos de clientes
- **Contato:** WhatsApp, telefone, e-mail, redes sociais e cadastro na newsletter

## Estrutura

```
├── index.html          # Versão atual do site (HTML, CSS e JS num único arquivo)
├── index-antigo.html   # Versão anterior do site
├── style.css           # Estilos da versão anterior
└── script.js           # Animações da versão anterior (GSAP + partículas em canvas)
```

A versão atual (`index.html`) é autossuficiente e não depende de `style.css` nem de `script.js`, que são usados apenas por `index-antigo.html`.

## Tecnologias

- HTML5, CSS3 e JavaScript puro, sem build nem dependências para instalar
- [Google Fonts](https://fonts.google.com/): Playfair Display e Inter
- [GSAP](https://gsap.com/) + ScrollTrigger (apenas na versão anterior)

## Como rodar

Basta abrir o `index.html` no navegador.

Se preferir usar um servidor local:

```bash
# com Python
python -m http.server 8000

# ou com Node
npx serve .
```

Depois é só acessar `http://localhost:8000`.

## Pendências

- **Imagens:** o site usa `fotos/marca.jpg` e `fotos/sabonete-lavanda.jpg`, mas a pasta `fotos/` ainda não está no repositório.
- **Contatos:** o número de WhatsApp/telefone (`+55 00 00000-0000`) e os links do Instagram e do Facebook ainda são provisórios.
