import React, { useState, useEffect, useRef } from 'react';
import TarefaList from './components/TarefaList';
import TarefaForm from './components/TarefaForm';
import ConfirmDialog from './components/ConfirmDialog';
import { tarefasAPI } from './services/api';
import './App.css';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tarefaToDelete, setTarefaToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [formClosing, setFormClosing] = useState(false);
  
  const notificationTimeoutRef = useRef(null);
  const reorderTimeoutRef = useRef(null);

  useEffect(() => {
    carregarTarefas();
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current);
      }
    };
  }, []);

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tarefasAPI.listar();
      setTarefas(response.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      setError('Erro ao carregar tarefas. Verifique se o servidor está rodando.');
      showNotification('❌ Erro ao carregar tarefas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info', duration = 3000) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setNotification({ message, type });
    
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, hiding: true }));
      setTimeout(() => setNotification(null), 300);
    }, duration);
  };

  const triggerReorderEffect = () => {
    setIsReordering(true);
    
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }
    
    reorderTimeoutRef.current = setTimeout(() => {
      setIsReordering(false);
    }, 1500);
  };

  const handleNovaTarefa = () => {
    setEditingTarefa(null);
    setShowForm(true);
    document.querySelector('.btn-primary')?.classList.add('pulsing');
    setTimeout(() => {
      document.querySelector('.btn-primary')?.classList.remove('pulsing');
    }, 1000);
  };

  const handleEditTarefa = (tarefa) => {
    setEditingTarefa(tarefa);
    setShowForm(true);
  };

  const handleDeleteTarefa = (id) => {
    setTarefaToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await tarefasAPI.excluir(tarefaToDelete);
      carregarTarefas();
      setShowConfirmDialog(false);
      setTarefaToDelete(null);
      showNotification('✅ Tarefa excluída com sucesso!', 'success');
      
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 500);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      showNotification('❌ Erro ao excluir tarefa', 'error');
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingTarefa) {
        await tarefasAPI.atualizar(editingTarefa.id, formData);
        showNotification('✅ Tarefa atualizada com sucesso!', 'success');
      } else {
        await tarefasAPI.criar(formData);
        showNotification('✅ Tarefa criada com sucesso!', 'success');
      }
      
      setFormClosing(true);
      setTimeout(() => {
        setShowForm(false);
        setFormClosing(false);
      }, 300);
      
      carregarTarefas();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      const errorMsg = error.response?.data?.error || 'Erro ao salvar tarefa';
      showNotification(`❌ ${errorMsg}`, 'error');
      
      const form = document.querySelector('.form-container');
      if (form) {
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
      }
    }
  };

  const handleTarefaReordered = (acao, tarefaNome) => {
    triggerReorderEffect();
    showNotification(`↕️ Tarefa "${tarefaNome}" ${acao}`, 'info');
  };

  const handleFormCancel = () => {
    setFormClosing(true);
    setTimeout(() => {
      setShowForm(false);
      setFormClosing(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {isReordering && <div className="reorder-progress active"></div>}
      
      {notification && (
        <div className={`reorder-toast ${notification.type} ${notification.hiding ? 'hiding' : ''}`}>
          <div className="toast-icon">
            {notification.type === 'success' && '✅'}
            {notification.type === 'error' && '❌'}
            {/* {notification.type === 'info' && 'ℹ️'} */}
          </div>
          <div className="toast-message">{notification.message}</div>
          <button 
            className="toast-close"
            onClick={() => {
              setNotification(prev => ({ ...prev, hiding: true }));
              setTimeout(() => setNotification(null), 300);
            }}
          >
            ×
          </button>
        </div>
      )}

      <header className="app-header">
        <h1>📋 Lista de Tarefas</h1>
        <div className="tasks-counter" title="Total de tarefas">
          {/* {tarefas.length} */}
        </div>
      </header>

      <main className="app-main">
        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={carregarTarefas} className="btn-retry">
              🔄 Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="actions-bar">
              <button 
                onClick={handleNovaTarefa} 
                className="btn-primary"
                title="Adicionar nova tarefa"
              >
                + Nova Tarefa
              </button>
            </div>

            <TarefaList
              tarefas={tarefas}
              onEdit={handleEditTarefa}
              onDelete={handleDeleteTarefa}
              onRefresh={() => {
                carregarTarefas();
                triggerReorderEffect();
              }}
              onReordered={handleTarefaReordered} 
            />
          </>
        )}
      </main>

      {showForm && (
        <TarefaForm
          tarefa={editingTarefa}
          onSubmit={handleSubmitForm}
          onCancel={handleFormCancel}
          isEditMode={!!editingTarefa}
          isClosing={formClosing}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="🗑️ Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta tarefa?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setTarefaToDelete(null);
        }}
      />

      <footer className="app-footer">
        <p>Sistema de Lista de Tarefas © {new Date().getFullYear()}</p>
        <div className="footer-stats">
          {/* <span>Tarefas: {tarefas.length}</span>
          <span>•</span>
          <span>Backend: {process.env.REACT_APP_API_URL ? 'Online' : 'Local'}</span> */}
        </div>
      </footer>
    </div>
  );
}

export default App;