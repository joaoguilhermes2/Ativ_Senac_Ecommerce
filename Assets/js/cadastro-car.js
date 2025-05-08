document.getElementById('formCadastro').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const endereco = document.getElementById('endereco').value;
  
    if (nome && email && endereco) {
      const usuario = { nome, email, endereco };
      localStorage.setItem('usuario', JSON.stringify(usuario));
  
      document.getElementById('confirmacao').innerHTML = `
        <p style="color: lime;">Cadastro realizado com sucesso!</p>
        <a href="finalizar.html" style="color: yellow;">Clique aqui para finalizar a compra</a>
      `;
      document.getElementById('formCadastro').reset();
    }
  });
  