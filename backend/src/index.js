require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tarefasRoutes = require('./routes/tarefas');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/tarefas', tarefasRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Tarefas funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

app.get('/teste', (req, res) => {
  res.json({ status: 'API ATUALIZADA 🚀' });
});
