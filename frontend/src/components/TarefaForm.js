import React, { useState, useEffect } from 'react';
import "../styles/TarefaForm.css";

const TarefaForm = ({ tarefa, onSubmit, onCancel, isEditMode, isClosing = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    custo: '',
    data_limite: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tarefa && isEditMode) {
      // Converter data de DD/MM/AAAA para YYYY-MM-DD
      const [day, month, year] = tarefa.data_limite_formatada.split('/');
      const dataISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      setFormData({
        nome: tarefa.nome,
        custo: tarefa.custo.toString(),
        data_limite: dataISO,
      });
    }
  }, [tarefa, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.custo) {
      newErrors.custo = 'Custo é obrigatório';
    } else if (parseFloat(formData.custo) < 0) {
      newErrors.custo = 'Custo não pode ser negativo';
    }
    
    if (!formData.data_limite) {
      newErrors.data_limite = 'Data limite é obrigatória';
    } else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataSelecionada = new Date(formData.data_limite);
      
      if (dataSelecionada < hoje) {
        newErrors.data_limite = 'Data não pode ser no passado';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        nome: formData.nome.trim(),
        custo: parseFloat(formData.custo),
        data_limite: formData.data_limite,
      });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className={`form-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="form-container">
        <h2>{isEditMode ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome da Tarefa *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : ''}
              maxLength="100"
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="custo">Custo (R$) *</label>
            <input
              type="number"
              id="custo"
              name="custo"
              value={formData.custo}
              onChange={handleChange}
              className={errors.custo ? 'error' : ''}
              min="0"
              step="0.01"
            />
            {errors.custo && <span className="error-message">{errors.custo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="data_limite">Data Limite *</label>
            <input
              type="date"
              id="data_limite"
              name="data_limite"
              value={formData.data_limite}
              onChange={handleChange}
              className={errors.data_limite ? 'error' : ''}
            />
            {errors.data_limite && <span className="error-message">{errors.data_limite}</span>}
          </div>

          <div className="form-buttons">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditMode ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TarefaForm;