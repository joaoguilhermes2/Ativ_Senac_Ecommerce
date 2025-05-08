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
        carrinhoContainer: document.querySelector('.carrinho-container')
      };
    }
  
    setupEventListeners() {
      this.elements.btnFinalizar?.addEventListener('click', () => this.mostrarFormularioEntrega());
      
      // Event delegation para botões dinâmicos
      this.elements.carrinhoContainer?.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="alterar-quantidade"]')) {
          const button = e.target.closest('[data-action="alterar-quantidade"]');
          const id = parseInt(button.dataset.id);
          const alteracao = parseInt(button.dataset.alteracao);
          this.alterarQuantidade(id, alteracao);
        }
        
        if (e.target.closest('[data-action="remover-item"]')) {
          const button = e.target.closest('[data-action="remover-item"]');
          const id = parseInt(button.dataset.id);
          this.removerItem(id);
        }
        
        if (e.target.closest('[data-action="selecionar-frete"]')) {
          const opcao = e.target.closest('[data-action="selecionar-frete"]');
          const codigo = opcao.dataset.codigo;
          this.selecionarFrete(codigo);
        }
      });
    }
  
    renderCarrinho() {
      if (this.carrinho.length === 0) {
        this.elements.carrinhoItens.innerHTML = `
          <div class="carrinho-vazio">
            <p>Seu carrinho está vazio</p>
            <a href="produtos.html" class="btn btn-primario">Continuar Comprando</a>
          </div>
        `;
        this.elements.resumoDetalhes.innerHTML = '';
        return;
      }
  
      this.elements.carrinhoItens.innerHTML = this.carrinho.map(item => `
        <div class="item-carrinho">
          <img src="${item.imagem || 'https://via.placeholder.com/100'}" 
               alt="${item.nome}" 
               class="item-imagem" 
               loading="lazy">
          <div class="item-info">
            <h3 class="item-titulo">${item.nome}</h3>
            <p class="item-preco">${this.formatarMoeda(item.preco)}</p>
            <div class="item-quantidade">
              <button data-action="alterar-quantidade" 
                      data-id="${item.id}" 
                      data-alteracao="-1">-</button>
              <span>${item.quantidade}</span>
              <button data-action="alterar-quantidade" 
                      data-id="${item.id}" 
                      data-alteracao="1">+</button>
            </div>
          </div>
          <button class="btn-remover" 
                  data-action="remover-item" 
                  data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      `).join('');
  
      this.atualizarResumo();
    }
  
    atualizarResumo() {
      const totalItens = this.carrinho.reduce((total, item) => total + item.quantidade, 0);
      const subtotal = this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
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
  
    async mostrarFormularioEntrega() {
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
            <div class="carregando-frete">
              <p>Informe o CEP para calcular o frete</p>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secundario" id="btn-voltar-carrinho">Voltar</button>
            <button type="button" class="btn btn-primario" id="btn-finalizar-compra">Finalizar Compra</button>
          </div>
        </div>
      `;
  
      this.elements.formularioEntrega.style.display = 'block';
      
      // Configura eventos do formulário
      document.getElementById('btn-buscar-cep').addEventListener('click', () => this.buscarCEP());
      document.getElementById('btn-voltar-carrinho').addEventListener('click', () => this.voltarParaCarrinho());
      document.getElementById('btn-finalizar-compra').addEventListener('click', () => this.finalizarCompra());
    }
  
    async buscarCEP() {
      const cepInput = document.getElementById('cep');
      const cep = cepInput.value.replace(/\D/g, '');
      
      if (cep.length !== 8) {
        this.mostrarFeedback('CEP inválido. Digite 8 números.', 'error');
        return;
      }
      
      try {
        // Primeiro busca o endereço no ViaCEP
        const endereco = await this.buscarEnderecoPorCEP(cep);
        
        // Depois calcula as opções de frete
        await this.calcularOpcoesFrete(cep);
        
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        this.mostrarFeedback('Erro ao calcular frete. Tente novamente.', 'error');
      }
    }
  
    async buscarEnderecoPorCEP(cep) {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await response.json();
      
      if (dados.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return dados;
    }
  
    async calcularOpcoesFrete(cepDestino) {
      const opcoesContainer = document.getElementById('opcoes-frete-container');
      opcoesContainer.innerHTML = '<div class="carregando-frete"><p>Calculando opções de entrega...</p></div>';
      
      try {
        // Simulação - substitua pela chamada real à API dos Correios
        const opcoesFrete = await this.simularAPICorreios(cepDestino);
        
        opcoesContainer.innerHTML = `
          <h4>Opções de Entrega</h4>
          <div class="opcoes-frete">
            ${opcoesFrete.map(opcao => `
              <div class="opcao-frete ${opcao.selecionado ? 'selecionado' : ''}" 
                   data-action="selecionar-frete" 
                   data-codigo="${opcao.codigo}">
                <div class="opcao-info">
                  <input type="radio" name="frete" ${opcao.selecionado ? 'checked' : ''}>
                  <span class="opcao-nome">${opcao.nome}</span>
                  <span class="opcao-prazo">${opcao.prazo} dias úteis</span>
                </div>
                <span class="opcao-valor">${this.formatarMoeda(opcao.valor)}</span>
              </div>
            `).join('')}
          </div>
        `;
        
        // Seleciona a primeira opção por padrão
        if (opcoesFrete.length > 0) {
          this.selecionarFrete(opcoesFrete[0].codigo);
        }
        
      } catch (error) {
        console.error('Erro ao calcular frete:', error);
        opcoesContainer.innerHTML = `
          <div class="erro-frete">
            <p>Não foi possível calcular o frete para este CEP.</p>
            <button type="button" class="btn btn-pequeno" onclick="carrinho.buscarCEP()">Tentar novamente</button>
          </div>
        `;
      }
    }
  
    async simularAPICorreios(cepDestino) {
      // Simulação - implemente a chamada real à API dos Correios aqui
      const subtotal = this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
      const pesoTotal = this.carrinho.reduce((total, item) => total + (item.peso || 0.3 * item.quantidade), 0);
      
      // Retorno simulado baseado no valor e peso
      return [
        {
          codigo: '04014',
          nome: 'PAC',
          prazo: Math.max(3, Math.ceil(pesoTotal)),
          valor: Math.min(30, Math.max(10, subtotal * 0.1)),
          selecionado: true
        },
        {
          codigo: '04510',
          nome: 'SEDEX',
          prazo: Math.max(1, Math.ceil(pesoTotal / 2)),
          valor: Math.min(50, Math.max(20, subtotal * 0.2)),
          selecionado: false
        }
      ];
    }
  
    selecionarFrete(codigo) {
      // Atualiza visualmente a seleção
      document.querySelectorAll('.opcao-frete').forEach(opcao => {
        opcao.classList.remove('selecionado');
        opcao.querySelector('input').checked = false;
      });
      
      const opcaoSelecionada = document.querySelector(`.opcao-frete[data-codigo="${codigo}"]`);
      if (opcaoSelecionada) {
        opcaoSelecionada.classList.add('selecionado');
        opcaoSelecionada.querySelector('input').checked = true;
        
        // Atualiza o frete selecionado (em uma implementação real, você buscaria os dados completos)
        this.freteSelecionado = {
          codigo,
          nome: opcaoSelecionada.querySelector('.opcao-nome').textContent,
          prazo: parseInt(opcaoSelecionada.querySelector('.opcao-prazo').textContent),
          valor: parseFloat(opcaoSelecionada.querySelector('.opcao-valor').textContent.replace(/[^\d,]/g, '').replace(',', '.'))
        };
        
        this.atualizarResumo();
      }
    }
  
    alterarQuantidade(id, alteracao) {
      const item = this.carrinho.find(p => p.id === id);
      
      if (item) {
        const novaQuantidade = item.quantidade + alteracao;
        
        if (novaQuantidade < 1) {
          this.removerItem(id);
          return;
        }
        
        item.quantidade = novaQuantidade;
        this.salvarCarrinho();
        this.renderCarrinho();
      }
    }
  
    removerItem(id) {
      this.carrinho = this.carrinho.filter(item => item.id !== id);
      this.salvarCarrinho();
      this.renderCarrinho();
      this.mostrarFeedback('Item removido do carrinho', 'success');
    }
  
    salvarCarrinho() {
      localStorage.setItem('carrinho', JSON.stringify(this.carrinho));
    }
  
    voltarParaCarrinho() {
      this.elements.carrinhoItens.style.display = 'block';
      document.getElementById('resumo-carrinho').style.display = 'block';
      this.elements.formularioEntrega.style.display = 'none';
    }
  
    verificarLogin() {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.mostrarFeedback('Você precisa estar logado para finalizar a compra', 'error');
        setTimeout(() => {
          window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 1500);
        return false;
      }
      return true;
    }
  
    finalizarCompra() {
      if (!this.freteSelecionado) {
        this.mostrarFeedback('Selecione uma opção de frete', 'error');
        return;
      }
  
      const cep = document.getElementById('cep').value;
      if (!cep || cep.replace(/\D/g, '').length !== 8) {
        this.mostrarFeedback('CEP inválido', 'error');
        return;
      }
  
      // Simulação de finalização de compra
      console.log('Compra finalizada:', {
        itens: this.carrinho,
        frete: this.freteSelecionado,
        cepEntrega: cep,
        total: this.calcularTotal()
      });
  
      this.mostrarFeedback('Compra finalizada com sucesso!', 'success');
      
      setTimeout(() => {
        this.carrinho = [];
        this.salvarCarrinho();
        window.location.href = 'index.html';
      }, 2000);
    }
  
    calcularTotal() {
      const subtotal = this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
      return subtotal + (this.freteSelecionado?.valor || 0);
    }
  
    calcularFretePadrao(subtotal) {
      return subtotal > 250 ? 0 : 15.90;
    }
  
    formatarMoeda(valor) {
      return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
  
    mostrarFeedback(mensagem, tipo = 'success') {
      const feedback = document.createElement('div');
      feedback.className = `feedback feedback-${tipo}`;
      feedback.textContent = mensagem;
      document.body.appendChild(feedback);
      
      setTimeout(() => feedback.classList.add('show'), 10);
      setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 500);
      }, 3000);
    }
  }
  
  // Inicializa o carrinho quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', () => {
    window.carrinho = new Carrinho();
  });