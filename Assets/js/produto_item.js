const nome_prod = document.getElementById("nome_prod");
const img_prod = document.getElementById("img_prod");
const val_prod = document.getElementById("val_prod");
const desc_prod = document.getElementById("desc_prod");
const avaliacao_prod = document.getElementById("avaliacao_prod");
const categ_prod = document.getElementById("categ_prod");
const add_favoritos = document.getElementById('add_favoritos');
const add_carrinho = document.getElementById('add_carrinho');

let parametros = new URLSearchParams(document.location.search);
let id_prod = (new URLSearchParams(document.location.search)).get("id_prod");


fetch(`https://fakestoreapi.com/products/${id_prod}`)
.then(
    dados_json = function(resposta){
        return resposta.json();
    }
)
.then(
    function(dados_json){
        // console.log(dados_json);

        img_prod.src = dados_json.image;
        nome_prod.innerText = dados_json.title;
        avaliacao_prod.innerText = `${dados_json.rating.rate} ⭐ | ${dados_json.rating.count} + Avaliações`;
        val_prod.innerText = "R$ "+ dados_json.price;
        desc_prod.innerHTML = dados_json.description;
        categ_prod.innerText += " "+ dados_json.category;
        add_favoritos.value = id_prod;
        add_carrinho.value = id_prod;
        // (dados_json.category).forEach(categoria => {
        // });
    }
)

// ADICONAR AO CARRITO
function adicionarAoCarrinho(produto) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Verifica se já existe no carrinho
    const existente = carrinho.find(p => p.id === produto.id);
    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({ id: produto.id, nome: produto.title, preco: produto.price, quantidade: 1 });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert('Produto adicionado ao carrinho!');
}

// ADD AOS FAVORITOS

// Suponha que você já tem o ID do produto (pode vir da URL, por exemplo)
const idProduto = id_prod; // Exemplo fixo

function atualizarTextoBotaoFavorito() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const jaFavoritado = favoritos.includes(idProduto);

    add_favoritos.innerText = jaFavoritado
        ? "❤️ Remover dos Favoritos"
        : "🤍 Adicionar aos Favoritos";
}

function toggleFavorito() {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.includes(idProduto)) {
        // Remove
        favoritos = favoritos.filter(id => id !== idProduto);
    } else {
        // Adiciona
        favoritos.push(idProduto);
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    atualizarTextoBotaoFavorito();
}

// Atualiza botão ao carregar a página
atualizarTextoBotaoFavorito();

add_favoritos.addEventListener("click", ()=>{
    toggleFavorito();
})

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idProduto = urlParams.get('id_prod');

    const carregarProduto = async () => {
      try {
        const resposta = await fetch(`https://fakestoreapi.com/products/${idProduto}`);
        const produto = await resposta.json();
        document.getElementById('nome_prod').textContent = produto.title;
        document.getElementById('val_prod').textContent = `R$ ${produto.price}`;
        document.getElementById('desc_prod').textContent = produto.description;
        document.getElementById('categ_prod').textContent = `Categoria: ${produto.category}`;
        document.getElementById('img_prod').src = produto.image;
        document.getElementById('avaliacao_prod').textContent = `${produto.rating.rate} ⭐ (${produto.rating.count} Avaliações)`;

        document.getElementById('add_carrinho').addEventListener('click', () => {
          let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
          carrinho.push({
            id: produto.id,
            nome: produto.title,
            preco: produto.price,
            imagem: produto.image,
            quantidade: 1
          });
          localStorage.setItem('carrinho', JSON.stringify(carrinho));

          // Mostra modal
          document.getElementById('modal').style.display = 'block';
        });

        document.getElementById('add_favoritos').addEventListener('click', () => {
          alert(`${produto.title} foi adicionado aos favoritos!`);
        });

        document.getElementById('fechar_modal').addEventListener('click', () => {
          window.location.href = 'produtos.html';
        });

      } catch (error) {
        console.error('Erro ao carregar o produto:', error);
        alert('Erro ao carregar o produto.');
      }
    }

    carregarProduto();
  });