const container = document.getElementById('produtos-container');
const campoBusca = document.getElementById('campoBusca');
let listaProdutos = [];

fetch('https://fakestoreapi.com/products')
  .then(res => res.json())
  .then(produtos => {
    listaProdutos = produtos;
    renderizarProdutos(produtos);
  });

function renderizarProdutos(produtos) {
  container.innerHTML = '';
  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${produto.image}" alt="${produto.title}">
      <h3>${produto.title}</h3>
      <p>R$ ${produto.price.toFixed(2)}</p>
      <button onclick='adicionarAoCarrinho(${JSON.stringify(produto).replace(/'/g, "\\'")})'>Adicionar ao carrinho</button>
    `;
    container.appendChild(card);
  });
}

function adicionarAoCarrinho(produto) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  const existente = carrinho.find(p => p.id === produto.id);
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({ id: produto.id, nome: produto.title, preco: produto.price, quantidade: 1 });
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  alert('Produto adicionado ao carrinho!');
}

// Busca em tempo real
campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase();
  const filtrados = listaProdutos.filter(prod => prod.title.toLowerCase().includes(termo));
  renderizarProdutos(filtrados);
});
