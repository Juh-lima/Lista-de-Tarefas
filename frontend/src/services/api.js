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
  listar: () => api.get('/tarefas'),
  criar: (tarefa) => api.post('/tarefas', tarefa),
  atualizar: (id, tarefa) => api.put(`/tarefas/${id}`, tarefa),
  excluir: (id) => api.delete(`/tarefas/${id}`),
  subir: (id) => api.patch(`/tarefas/${id}/subir`),
  descer: (id) => api.patch(`/tarefas/${id}/descer`),
  somatorioCustos: () => api.get('/tarefas/soma/custos'),
};

export default api;
