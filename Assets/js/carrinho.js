class Carrinho {
  constructor() {
    this.carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    this.freteSelecionado = null;
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.renderCarrinho();
  }

  cacheElements() {
    this.elements = {
      carrinhoItens: document.getElementById('carrinho-itens'),
      resumoDetalhes: document.getElementById('resumo-detalhes'),
      btnFinalizar: document.getElementById('btn-finalizar'),
      formularioEntrega: document.getElementById('formulario-entrega'),
      carrinhoContainer: document.querySelector('.carrinho-container'),
    };
  }

  setupEventListeners() {
    this.elements.btnFinalizar?.addEventListener('click', () => this.mostrarFormularioEntrega());

    this.elements.carrinhoContainer?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const id = parseInt(target.dataset.id);
      const action = target.dataset.action;

      switch (action) {
        case 'alterar-quantidade':
          this.alterarQuantidade(id, parseInt(target.dataset.alteracao));
          break;
        case 'remover-item':
          this.removerItem(id);
          break;
        case 'selecionar-frete':
          this.selecionarFrete(target.dataset.codigo);
          break;
      }
    });
  }

  renderCarrinho() {
    if (this.carrinho.length === 0) {
      this.elements.carrinhoItens.innerHTML = `
        <div class="carrinho-vazio">
          <p>Seu carrinho está vazio</p>
          <a href="produtos.html" class="btn btn-primario">Voltar para Produtos</a>
        </div>
      `;
      this.elements.resumoDetalhes.innerHTML = '';
      return;
    }

    this.elements.carrinhoItens.innerHTML = this.carrinho.map(item => `
      <div class="item-carrinho">
        <img src="${item.imagem || 'https://via.placeholder.com/100'}" alt="${item.nome}" class="item-imagem" loading="lazy">
        <div class="item-info">
          <h3 class="item-titulo">${item.nome}</h3>
          <p class="item-preco">${this.formatarMoeda(item.preco)}</p>
          <div class="item-quantidade">
            <button data-action="alterar-quantidade" data-id="${item.id}" data-alteracao="-1">-</button>
            <span>${item.quantidade}</span>
            <button data-action="alterar-quantidade" data-id="${item.id}" data-alteracao="1">+</button>
          </div>
        </div>
        <button class="btn-remover" data-action="remover-item" data-id="${item.id}">
          ✕
        </button>
      </div>
    `).join('');

    this.atualizarResumo();
  }

  atualizarResumo() {
    const totalItens = this.carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const subtotal = this.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const frete = this.freteSelecionado?.valor || this.calcularFretePadrao(subtotal);
    const total = subtotal + frete;

    this.elements.resumoDetalhes.innerHTML = `
      <div class="resumo-linha">
        <span>Itens (${totalItens})</span>
        <span>${this.formatarMoeda(subtotal)}</span>
      </div>
      <div class="resumo-linha">
        <span>Frete</span>
        <span>${frete > 0 ? this.formatarMoeda(frete) : 'Grátis'}</span>
      </div>
      <div class="resumo-total">
        <span>Total</span>
        <span>${this.formatarMoeda(total)}</span>
      </div>
    `;
  }

  mostrarFormularioEntrega() {
    if (!this.verificarLogin()) return;

    this.elements.carrinhoItens.style.display = 'none';
    document.getElementById('resumo-carrinho').style.display = 'none';

    this.elements.formularioEntrega.innerHTML = `
      <div class="form-compacto">
        <h3>Informações de Entrega</h3>
        <div class="form-group-compact">
          <label for="cep">CEP</label>
          <input type="text" id="cep" placeholder="00000-000" required>
          <button type="button" class="btn-buscar-cep" id="btn-buscar-cep">Buscar</button>
        </div>
        <div id="opcoes-frete-container">
          <div class="carregando-frete"><p>Informe o CEP para calcular o frete</p></div>
        </div>
        <div class="form-actions">
          <a href="produtos.html" class="btn btn-secundario">Voltar</a>
          <button type="button" class="btn btn-primario" id="btn-finalizar-compra">Finalizar Compra</button>
        </div>
      </div>
    `;

    this.elements.formularioEntrega.style.display = 'block';

    document.getElementById('btn-buscar-cep')?.addEventListener('click', () => this.buscarCEP());
    document.getElementById('btn-finalizar-compra')?.addEventListener('click', () => this.finalizarCompra());
  }

  async buscarCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
      this.mostrarFeedback('CEP inválido. Digite 8 números.', 'error');
      return;
    }

    try {
      await this.buscarEnderecoPorCEP(cep);
      await this.calcularOpcoesFrete(cep);
    } catch (error) {
      this.mostrarFeedback('Erro ao buscar CEP ou calcular frete.', 'error');
    }
  }

  async buscarEnderecoPorCEP(cep) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await response.json();
    if (dados.erro) throw new Error('CEP não encontrado');
    return dados;
  }

  async calcularOpcoesFrete(cep) {
    const opcoesContainer = document.getElementById('opcoes-frete-container');
    opcoesContainer.innerHTML = `<p>Calculando opções de entrega...</p>`;

    try {
      const opcoesFrete = await this.simularAPICorreios(cep);

      opcoesContainer.innerHTML = `
        <h4>Opções de Entrega</h4>
        <div class="opcoes-frete">
          ${opcoesFrete.map(opcao => `
            <div class="opcao-frete" data-action="selecionar-frete" data-codigo="${opcao.codigo}">
              <input type="radio" name="frete" ${opcao.selecionado ? 'checked' : ''}>
              <span>${opcao.nome} - ${opcao.prazo} dias úteis</span>
              <span>${this.formatarMoeda(opcao.valor)}</span>
            </div>
          `).join('')}
        </div>
      `;

      if (opcoesFrete.length > 0) this.selecionarFrete(opcoesFrete[0].codigo);

    } catch (error) {
      opcoesContainer.innerHTML = `
        <p>Não foi possível calcular o frete.</p>
        <button onclick="carrinho.buscarCEP()">Tentar novamente</button>
      `;
    }
  }

  async simularAPICorreios(cep) {
    const subtotal = this.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    return [
      { codigo: 'PAC', nome: 'PAC', prazo: 7, valor: subtotal > 100 ? 0 : 15.90, selecionado: true },
      { codigo: 'SEDEX', nome: 'SEDEX', prazo: 3, valor: subtotal > 100 ? 0 : 24.90, selecionado: false }
    ];
  }

  selecionarFrete(codigo) {
    const opcoes = document.querySelectorAll('.opcao-frete');
    opcoes.forEach(opcao => {
      opcao.classList.remove('selecionado');
      if (opcao.dataset.codigo === codigo) {
        opcao.classList.add('selecionado');
        const valorTexto = opcao.querySelector('span:last-child').textContent.replace(/[^\d,]/g, '').replace(',', '.');
        this.freteSelecionado = {
          codigo,
          valor: parseFloat(valorTexto)
        };
      }
    });
    this.atualizarResumo();
  }

  alterarQuantidade(id, delta) {
    const item = this.carrinho.find(p => p.id === id);
    if (!item) return;

    item.quantidade += delta;
    if (item.quantidade <= 0) {
      this.removerItem(id);
    } else {
      this.salvarCarrinho();
      this.renderCarrinho();
    }
  }

  removerItem(id) {
    this.carrinho = this.carrinho.filter(p => p.id !== id);
    this.salvarCarrinho();
    this.renderCarrinho();
  }

  salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(this.carrinho));
  }

  calcularFretePadrao(subtotal) {
    return subtotal > 100 ? 0 : 19.90;
  }

  formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  mostrarFeedback(mensagem, tipo = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${tipo}`;
    feedback.textContent = mensagem;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 4000);
  }

  verificarLogin() {
    // Simulação de verificação de login. Retorne `true` se estiver logado.
    const logado = true;
    if (!logado) {
      this.mostrarFeedback('Você precisa estar logado para finalizar a compra.', 'error');
      return false;
    }
    return true;
  }

  finalizarCompra() {
    this.mostrarFeedback('Compra finalizada com sucesso!', 'success');
    localStorage.removeItem('carrinho');
    setTimeout(() => {
      window.location.href = 'confirmacao.html';
    }, 2000);
  }
}

// Para instanciar
const carrinho = new Carrinho();
