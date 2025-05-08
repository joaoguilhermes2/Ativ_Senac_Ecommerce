document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('produtos-grid');
  const campoBusca = document.getElementById('campoBusca');
  let listaProdutos = [];

  // Valida se os elementos existem
  if (!container || !campoBusca) {
    console.error('Elementos do DOM não encontrados!');
    return;
  }

  // Carrega os produtos da API com tratamento de erro
  function carregarProdutos() {
    container.innerHTML = '<p>Carregando produtos...</p>';
    
    fetch('https://fakestoreapi.com/products')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar produtos');
        return res.json();
      })
      .then(produtos => {
        listaProdutos = produtos;
        renderizarProdutos(produtos);
      })
      .catch(err => {
        console.error('Erro:', err);
        container.innerHTML = '<p>Erro ao carregar produtos. Tente recarregar a página.</p>';
      });
  }

  // Função para renderizar os produtos
  function renderizarProdutos(produtos) {
    if (!produtos || produtos.length === 0) {
      container.innerHTML = '<p>Nenhum produto encontrado.</p>';
      return;
    }

    container.innerHTML = '';
    produtos.forEach(produto => {
      const card = document.createElement('div');
      card.className = 'card';
      
      // Formata o preço para o padrão brasileiro
      const precoFormatado = produto.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      card.innerHTML = `
        <img src="${produto.image}" alt="${produto.title}" loading="lazy">
        <h3>${produto.title}</h3>
        <p>${precoFormatado}</p>
        <button class="btn-adicionar" data-id="${produto.id}">Adicionar ao carrinho</button>
      `;
      container.appendChild(card);
    });

    // Adiciona event listeners para os botões
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
      btn.addEventListener('click', function() {
        const produtoId = parseInt(this.getAttribute('data-id'));
        const produto = listaProdutos.find(p => p.id === produtoId);
        if (produto) adicionarAoCarrinho(produto);
      });
    });
  }

  // Adiciona ao carrinho no localStorage
  function adicionarAoCarrinho(produto) {
    try {
      let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
      const existente = carrinho.find(p => p.id === produto.id);

      if (existente) {
        existente.quantidade += 1;
      } else {
        carrinho.push({
          id: produto.id,
          nome: produto.title,
          preco: produto.price,
          quantidade: 1,
          imagem: produto.image
        });
      }

      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      mostrarFeedbackCarrinho(produto.title);
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      alert('Erro ao adicionar produto ao carrinho');
    }
  }

  // Feedback visual ao adicionar ao carrinho
  function mostrarFeedbackCarrinho(nomeProduto) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-carrinho';
    feedback.textContent = `${nomeProduto} adicionado ao carrinho!`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      feedback.classList.remove('show');
      setTimeout(() => feedback.remove(), 500);
    }, 3000);
  }

  // Filtro de busca em tempo real com debounce
  let timeoutBusca;
  campoBusca.addEventListener('input', () => {
    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(() => {
      const termo = campoBusca.value.trim().toLowerCase();
      const filtrados = termo 
        ? listaProdutos.filter(prod => 
            prod.title.toLowerCase().includes(termo) ||
            prod.description.toLowerCase().includes(termo)
          )
        : listaProdutos;
      renderizarProdutos(filtrados);
    }, 300);
  });

  // Inicializa a aplicação
  carregarProdutos();
});