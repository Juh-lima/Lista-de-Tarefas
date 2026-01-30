import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  
  reordenar: (id, novaOrdem) => 
    api.patch(`/tarefas/${id}/reordenar`, { nova_ordem: novaOrdem }),

  subir: (id) => api.patch(`/tarefas/${id}/subir`),
  descer: (id) => api.patch(`/tarefas/${id}/descer`),
  somatorioCustos: () => api.get('/tarefas/soma/custos'),
};

export default api;

