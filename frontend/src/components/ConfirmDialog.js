import React from 'react';
import "../styles/ConfirmDialog.css";

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-buttons">
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;