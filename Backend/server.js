const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Para analisar requisições com corpo JSON

// Simulação de banco de dados
const fakeUsersDb = {
  "joao": { id: 1, username: "joao", password: "1234" },
  "maria": { id: 2, username: "maria", password: "abcd" },
};

app.get('/', (req, res) => {
  res.send('API está rodando corretamente.');
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = fakeUsersDb[username];
  
  if (user && user.password === password) {
    return res.json({ token: 'fake-jwt-token', username: user.username });
  }

  return res.status(401).json({ message: 'Usuário ou senha inválidos' });
});

// Rota para obter ID do usuário
app.get('/user/id', (req, res) => {
  const { username } = req.query;
  const { authorization } = req.headers;

  // Verifica o token
  if (authorization !== 'Bearer fake-jwt-token') {
    return res.status(403).json({ message: 'Token inválido' });
  }

  const user = fakeUsersDb[username];
  if (user) {
    return res.json({ id: user.id });
  }

  return res.status(404).json({ message: 'Usuário não encontrado' });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});