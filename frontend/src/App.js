import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import TarefaForm from './components/TarefaForm';
import TarefaList from './components/TarefaList';
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

  // ✅ CORREÇÃO ESLINT
  const carregarTarefas = useCallback(async () => {
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
  }, []);

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
  }, [carregarTarefas]);

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
      await carregarTarefas();
      setShowConfirmDialog(false);
      setTarefaToDelete(null);
      showNotification('✅ Tarefa excluída com sucesso!', 'success');
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
      const mensagemErro =
        error.response?.data?.error ||
        error.response?.data?.erro ||
        'Erro ao salvar tarefa';

      showNotification(`❌ ${mensagemErro}`, 'error');
    }
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
        <div className={`reorder-toast ${notification.type}`}>
          <div className="toast-message">{notification.message}</div>
        </div>
      )}

      <header className="app-header">
        <h1>📋 Lista de Tarefas</h1>
      </header>

      <main className="app-main">
        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={carregarTarefas}>🔄 Tentar novamente</button>
          </div>
        ) : (
          <>
            <button onClick={handleNovaTarefa} className="btn-primary">
              + Nova Tarefa
            </button>

            <TarefaList
              tarefas={tarefas}
              onEdit={handleEditTarefa}
              onDelete={handleDeleteTarefa}
              onRefresh={carregarTarefas}
              onReordered={triggerReorderEffect}
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
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  );
}

export default App;
