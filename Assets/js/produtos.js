document.addEventListener("DOMContentLoaded", () => {
  // Dados do produto (substitua pelos dados reais, por exemplo, de uma API)
  const produto = {
      nome: "Produto Exemplo",
      imagem: "link_para_imagem_produto.jpg",  // Coloque o caminho correto para a imagem
      valor: "R$ 99,90",
      descricao: "Descrição do produto.",
      categoria: "Categoria do Produto"
  };

  // Elementos da página
  const nomeProd = document.getElementById('nome_prod');
  const valorProd = document.getElementById('val_prod');
  const descProd = document.getElementById('desc_prod');
  const imgProd = document.getElementById('img_prod');
  const categoriaProd = document.getElementById('categ_prod');

  // Preenche os dados do produto na página
  nomeProd.textContent = produto.nome;
  valorProd.textContent = produto.valor;
  descProd.textContent = produto.descricao;
  imgProd.src = produto.imagem;
  categoriaProd.textContent = produto.categoria;

  // Adicionar ao carrinho
  const addCarrinhoBtn = document.getElementById('add_carrinho');
  addCarrinhoBtn.addEventListener('click', () => {
      // Simulação de adicionar produto ao carrinho
      alert(`${produto.nome} foi adicionado ao carrinho!`);
      
      // Aqui você poderia armazenar os dados no carrinho (ex: localStorage)
      // localStorage.setItem("carrinho", JSON.stringify([...carrinho, produto]));
  });

  // Adicionar aos favoritos
  const addFavoritosBtn = document.getElementById('add_favoritos');
  addFavoritosBtn.addEventListener('click', () => {
      // Simulação de adicionar produto aos favoritos
      alert(`${produto.nome} foi adicionado aos favoritos!`);
  });
});
