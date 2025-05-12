const area_favoritos = document.getElementById("area_favoritos");
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

listar_produtos = function (produtos) {
  console.log(favoritos);
  //   console.log(produtos);

  area_favoritos.innerHTML = "";

  if (produtos.length === 0) {
    area_favoritos.innerHTML =
      '<p style="padding: 20px; font-size: 1.2rem;">Nenhum favorito encontrado.</p>';
    return;
  }

  produtos.forEach((item) => {
    area_favoritos.innerHTML += `
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

// FETCH NA API FAKESTORE
fetch("https://fakestoreapi.com/products")
.then(function (resposta) {
return resposta.json();
})
.then(function (produtos) {
    const favoritos_ids = favoritos.map(id => Number(id)); // Garante que sejam números

    const favoritos_filtrados = produtos.filter(produto =>
        favoritos_ids.includes(produto.id)
    );
listar_produtos(favoritos_filtrados);
});