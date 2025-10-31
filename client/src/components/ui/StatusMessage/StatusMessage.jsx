import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './StatusMessage.css';

function StatusMessage({ status, message }) {
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <FaSpinner className="spinner" />;
      case 'success':
        return <FaCheckCircle className="checkmark" />;
      case 'error':
        return <FaTimesCircle className="cross" />;
      default:
        return null;
    }
  };

  return (
    <div className={`status-message ${status}`}>
      <div className="status-modal">
        <div className="status-content">
          {getIcon()}
          <p className="message-text">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default StatusMessage;