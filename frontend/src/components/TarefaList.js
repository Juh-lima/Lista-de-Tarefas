import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import { tarefasAPI } from '../services/api';
import "../styles/TarefaList.css";

const TarefaList = ({ tarefas, onEdit, onDelete, onRefresh, onReordered, onAdd }) => {
  const [somatorio, setSomatorio] = useState(0);

  useEffect(() => {
    calcularSomatorio();
  }, [tarefas]);

  const calcularSomatorio = async () => {
    try {
      const response = await tarefasAPI.somatorioCustos();
      setSomatorio(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao calcular somatório:', error);
      const totalLocal = tarefas.reduce((sum, tarefa) => sum + (parseFloat(tarefa.custo) || 0), 0);
      setSomatorio(totalLocal);
    }
  };

  const formatarMoeda = (valor) => {
    const numero = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) : valor;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero || 0);
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    if (dataString && dataString.includes('/')) {
      return dataString;
    }
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return dataString;
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      return dataString;
    }
  };

  const handleSubir = async (tarefa) => {
    try {
      const response = await tarefasAPI.subir(tarefa.id);
      if (response.data.message) {
        if (onReordered) {
          onReordered('subiu', tarefa.nome);
        }
        onRefresh();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.error);
      } else {
        alert('Erro ao subir tarefa');
      }
    }
  };

  const handleDescer = async (tarefa) => {
    try {
      const response = await tarefasAPI.descer(tarefa.id);
      if (response.data.message) {
        if (onReordered) {
          onReordered('desceu', tarefa.nome);
        }
        onRefresh();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.error);
      } else {
        alert('Erro ao descer tarefa');
      }
    }
  };

  return (
    <div className="tarefa-list-container">
      {/* <div className="tarefa-header">
        <h1>Lista de Tarefas</h1>
      </div> */}

      <div className="nova-tarefa-container">
        {/* <button onClick={onAdd} className="btn-nova-tarefa">
          <FaPlus /> Nova Tarefa
        </button> */}
      </div>

      {tarefas.length === 0 ? (
        <div className="sem-tarefas">
          <p>Nenhuma tarefa cadastrada. Clique em "Nova Tarefa" para começar.</p>
        </div>
      ) : (
        <>
          <div className="tarefa-table-wrapper">
            <div className="tarefa-table">
              <div className="table-header">
                <div className="col-ordem">ORDEM</div>
                <div className="col-nome">NOME DA TAREFA</div>
                <div className="col-custo">CUSTO</div>
                <div className="col-data">DATA LIMITE</div>
                <div className="col-acoes">AÇÃO</div>
              </div>

              {tarefas
                .sort((a, b) => (a.ordem_apresentacao || a.ordem || 0) - (b.ordem_apresentacao || b.ordem || 0))
                .map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className={`table-row ${tarefa.custo >= 1000 ? 'destaque-amarelo' : ''}`}
                  >
                    <div className="col-ordem">
                      <div className="ordem-numero">{tarefa.ordem_apresentacao || tarefa.ordem || 1}</div>
                      <div className="reordenar-buttons">
                        <button
                          onClick={() => handleSubir(tarefa)}
                          disabled={tarefa.ordem_apresentacao === 1 || tarefa.ordem === 1}
                          className="btn-reordenar"
                          title="Subir"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          onClick={() => handleDescer(tarefa)}
                          disabled={tarefa.ordem_apresentacao === tarefas.length || tarefa.ordem === tarefas.length}
                          className="btn-reordenar"
                          title="Descer"
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                    </div>
                    <div className="col-nome">{tarefa.nome || tarefa.nome_tarefa || 'Sem nome'}</div>
                    <div className="col-custo">{formatarMoeda(tarefa.custo)}</div>
                    <div className="col-data">{formatarData(tarefa.data_limite)}</div>
                    <div className="col-acoes">
                      <button
                        onClick={() => onEdit(tarefa)}
                        className="btn-edit"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(tarefa.id)}
                        className="btn-delete"
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="legenda-container">
            <div className="legenda">
              <div className="destaque-amarelo-legenda"></div>
              <span>Custo ≥ R$ 1.000,00</span>
            </div>
          </div>

          <div className="rodape-tarefas">
            <div className="somatorio">
              <strong>Total:</strong> {formatarMoeda(somatorio)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TarefaList;