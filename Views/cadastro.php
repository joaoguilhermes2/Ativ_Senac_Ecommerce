<?php
require_once 'classes/Usuario.php';
require_once 'config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

    if (!empty($nome) && !empty($email) && !empty($senha)) {
        $usuario = new Usuario($pdo);
        $resultado = $usuario->cadastrar($nome, $email, $senha);

        if ($resultado) {
            echo "<script>alert('Usuário cadastrado com sucesso!'); window.location.href='login.html';</script>";
        } else {
            echo "<script>alert('Erro ao cadastrar usuário. Verifique se o e-mail já está em uso.'); window.history.back();</script>";
        }
    } else {
        echo "<script>alert('Preencha todos os campos.'); window.history.back();</script>";
    }
}
?>
