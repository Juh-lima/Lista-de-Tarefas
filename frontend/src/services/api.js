import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tarefasAPI = {
  listar: () => api.get('/api/tarefas'),
  criar: (tarefa) => api.post('/api/tarefas', tarefa),
  atualizar: (id, tarefa) => api.put(`/api/tarefas/${id}`, tarefa),
  excluir: (id) => api.delete(`/api/tarefas/${id}`),
  subir: (id) => api.patch(`/api/tarefas/${id}/subir`),
  descer: (id) => api.patch(`/api/tarefas/${id}/descer`),
  somatorioCustos: () => api.get('/api/tarefas/soma/custos'),
};

export default api;
