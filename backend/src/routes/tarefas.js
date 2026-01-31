const express = require('express');
const router = express.Router();
const Tarefa = require('../models/Tarefa');

function formatarData(dataStr) {
  if (!dataStr) return null;
  const [year, month, day] = dataStr.split('-');
  return `${day}/${month}/${year}`;
}

function validarData(dataStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dataStr.match(regex)) return false;
  
  const date = new Date(dataStr);
  return date instanceof Date && !isNaN(date);
}

router.get('/', async (req, res) => {
  try {
    const tarefas = await Tarefa.listar();
    
    const tarefasFormatadas = tarefas.map(tarefa => ({
      ...tarefa,
      data_limite_formatada: formatarData(tarefa.data_limite)
    }));
    
    res.json(tarefasFormatadas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, custo, data_limite } = req.body;
    
    if (!nome || !custo || !data_limite) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (custo < 0) {
      return res.status(400).json({ error: 'Custo não pode ser negativo' });
    }
    
    if (!validarData(data_limite)) {
      return res.status(400).json({ error: 'Data inválida. Use o formato YYYY-MM-DD' });
    }
    
    const nomeExiste = await Tarefa.buscarPorNome(nome);
    if (nomeExiste) {
      return res.status(400).json({ error: 'Já existe uma tarefa com este nome' });
    }
    
    const novaTarefa = await Tarefa.criar({
      nome,
      custo: parseFloat(custo),
      data_limite
    });
    
    res.status(201).json({
      ...novaTarefa,
      data_limite_formatada: formatarData(novaTarefa.data_limite)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, custo, data_limite } = req.body;
    
    if (!nome || custo === undefined || !data_limite) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (custo < 0) {
      return res.status(400).json({ error: 'Custo não pode ser negativo' });
    }
    
    if (!validarData(data_limite)) {
      return res.status(400).json({ error: 'Data inválida. Use o formato YYYY-MM-DD' });
    }
    
    const nomeExiste = await Tarefa.buscarPorNome(nome, id);
    if (nomeExiste) {
      return res.status(400).json({ error: 'Já existe uma tarefa com este nome' });
    }
    
    const tarefaExistente = await Tarefa.buscarPorId(id);
    if (!tarefaExistente) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    const tarefaAtualizada = await Tarefa.atualizar(id, {
      nome,
      custo: parseFloat(custo),
      data_limite
    });
    
    res.json({
      ...tarefaAtualizada,
      data_limite_formatada: formatarData(data_limite)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarefaExistente = await Tarefa.buscarPorId(id);
    if (!tarefaExistente) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    await Tarefa.excluir(id);
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

router.patch('/:id/reordenar', async (req, res) => {
  try {
    const { id } = req.params;
    const { nova_ordem } = req.body;
    
    if (nova_ordem === undefined || nova_ordem < 1) {
      return res.status(400).json({ error: 'Nova ordem inválida' });
    }
    
    const tarefaExistente = await Tarefa.buscarPorId(id);
    if (!tarefaExistente) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    await Tarefa.reordenar(id, nova_ordem);
    res.json({ message: 'Tarefa reordenada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reordenar tarefa' });
  }
});

router.patch('/:id/subir', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarefa = await Tarefa.buscarPorId(id);
    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    if (tarefa.ordem <= 1) {
      return res.status(400).json({ error: 'Tarefa já está no topo' });
    }
    
    await Tarefa.reordenar(id, tarefa.ordem - 1);
    res.json({ message: 'Tarefa movida para cima' });
  } catch (error) {
    console.error('Erro ao subir tarefa:', error);
    res.status(500).json({ error: 'Erro ao mover tarefa para cima' });
  }
});

router.patch('/:id/descer', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarefa = await Tarefa.buscarPorId(id);
    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    const todasTarefas = await Tarefa.listar();
    const ultimaOrdem = todasTarefas.length;
    
    if (tarefa.ordem >= ultimaOrdem) {
      return res.status(400).json({ error: 'Tarefa já está no final' });
    }
    
    await Tarefa.reordenar(id, tarefa.ordem + 1);
    res.json({ message: 'Tarefa movida para baixo' });
  } catch (error) {
    console.error('Erro ao descer tarefa:', error);
    res.status(500).json({ error: 'Erro ao mover tarefa para baixo' });
  }
});

router.get('/soma/custos', async (req, res) => {
  try {
    const total = await Tarefa.somatorioCustos();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular somatório' });
  }
});


module.exports = router;