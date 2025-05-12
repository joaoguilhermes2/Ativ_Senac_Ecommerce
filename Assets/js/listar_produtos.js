const area_cards = document.getElementById("area_cards");
const btn_pesquisar = document.getElementById("btn_pesquisar");
const barra_pesquisar = document.getElementById("barra_pesquisar");
let todos_os_produtos = [];

// FUNCAO DE LISTAR PRODUTOS PARA FACILITAR O FILTRO
listar_produtos = function (produtos) {
  area_cards.innerHTML = "";

  if (produtos.length === 0) {
    area_cards.innerHTML =
      '<p style="padding: 20px; font-size: 1.2rem;">Nenhum produto encontrado.</p>';
    return;
  }

  produtos.forEach((item) => {
    area_cards.innerHTML += `
        <a href="./produto_item.html?id_prod=${item.id}" class="card_prod">
        <img src="${item.image}" alt="" id="img_prod">
        <div class="info_prod">
            <h3 id="nome_prod">${item.title}</h3>
            <p id="val_prod">R$ ${item.price}</p>
            <span id="avaliacao_prod">${item.rating.rate} ⭐<br> ${item.rating.count} Avaliações</span>
        </div>
        </a>
    `;
  });
};

// FUNCAO DE FILTRAR PRODUTOS PARA PESQUISA E LISTAR GERAL
function filtrarProdutos() {
  const pesquisa = barra_pesquisar.value.trim().toLowerCase();

  if (pesquisa) {
    const filtrados = todos_os_produtos.filter(function (item) {
      return item.title.toLowerCase().includes(pesquisa);
    });
    listar_produtos(filtrados);
  } else {
    listar_produtos(todos_os_produtos); // Mostra todos caso o campo de pesquisa estiver vazio
  }
}

// FETCH NA API FAKESTORE
fetch("https://fakestoreapi.com/products")
  .then(function (resposta) {
    return resposta.json();
  })
  .then(function (produtos) {
    todos_os_produtos = produtos;
    listar_produtos(produtos);
  });

// PESQUISAR PRODUTOS
// PESQUISA AO CLICA EM BUSCAR OU APERTAR ENTER
btn_pesquisar.addEventListener("click", filtrarProdutos);
barra_pesquisar.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    filtrarProdutos();
  }
});

// PESQUISA PRODUTO ENQUANTO DIGITA
barra_pesquisar.addEventListener("input", (timeout) => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    filtrarProdutos();
  }, 500 /*ms*/);
});
