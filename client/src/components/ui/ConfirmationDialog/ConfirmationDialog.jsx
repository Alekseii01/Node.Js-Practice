import React from 'react';
import Button from '../Button/Button';
import './ConfirmationDialog.css';

function ConfirmationDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <p>{message}</p>
        <div className="confirmation-actions">
          <Button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="btn btn-danger" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;