function calcularFrete() {
  const cep = document.getElementById("cep").value;
  const freteResultado = document.getElementById("freteResultado");

  if (cep.length !== 8) {
    freteResultado.textContent = "CEP inválido. Digite 8 números.";
    return;
  }

  // Simulação de API
  freteResultado.textContent = "Calculando...";
  setTimeout(() => {
    freteResultado.textContent = `Frete estimado: R$ 19,90 - Entrega em 5 dias úteis`;
  }, 1000);
}

// Alterna seções de pagamento
document.addEventListener("DOMContentLoaded", () => {
  const opcoes = document.getElementsByName("pagamento");

  opcoes.forEach((opcao) => {
    opcao.addEventListener("change", () => {
      document.getElementById("pagamentoCartao").style.display = "none";
      document.getElementById("pagamentoPix").style.display = "none";
      document.getElementById("pagamentoBoleto").style.display = "none";

      if (opcao.checked) {
        const divId = "pagamento" + opcao.value.charAt(0).toUpperCase() + opcao.value.slice(1);
        document.getElementById(divId).style.display = "block";
      }
    });
  });
});
function finalizarCompra() {
  // Verificação básica fake de campos preenchidos
  const cep = document.getElementById('cep').value;
  const numero = document.getElementById('numero').value;
  const telefone = document.getElementById('telefone').value;

  if (!cep || !numero || !telefone) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // Exibir o modal de sucesso
  document.getElementById('modal-sucesso').classList.remove('hidden');

  // Limpar carrinho depois de alguns segundos (ou ao fechar modal)
  localStorage.removeItem("carrinho");
}
function fecharModal() {
  document.getElementById('modal-sucesso').classList.add('hidden');
  window.location.href = "../index.html"; // redirecionar após fechar modal
}