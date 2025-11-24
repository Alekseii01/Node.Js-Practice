import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperclip, FaFilePdf, FaFileImage, FaTrash } from 'react-icons/fa';
import Button from '../Button/Button';
import './AttachmentManager.css';

function AttachmentManager({ articleId, attachments = [], onAttachmentsChange, readOnly = false, hideUploadButton = false }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    const validFiles = [];
    let hasError = false;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed.');
        hasError = true;
        break;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        hasError = true;
        break;
      }

      validFiles.push(file);
    }

    if (!hasError) {
      setError(null);
      if (hideUploadButton && onAttachmentsChange) {
        onAttachmentsChange([...attachments, ...validFiles]);
      } else {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedAttachments = [];
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/articles/${articleId}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        uploadedAttachments.push(response.data.attachment);
      }

      setSelectedFiles([]);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

      if (onAttachmentsChange) {
        onAttachmentsChange([...attachments, ...uploadedAttachments]);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.response?.data?.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index) => {
    if (hideUploadButton && onAttachmentsChange) {
      onAttachmentsChange(attachments.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      const fileInput = document.getElementById('file-upload');
      if (fileInput && selectedFiles.length === 1) {
        fileInput.value = '';
      }
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/articles/${articleId}/attachments/${filename}`
      );

      if (onAttachmentsChange) {
        onAttachmentsChange(attachments.filter(att => att.filename !== filename));
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError(err.response?.data?.message || 'Failed to delete attachment. Please try again.');
    }
  };

  const handleAttachmentClick = (attachment) => {
    const url = `${import.meta.env.VITE_API_URL}/uploads/${attachment.filename}`;
    window.open(url, '_blank');
  };

  const getFileIcon = (mimetype) => {
    if (mimetype === 'application/pdf') {
      return <FaFilePdf className="attachment-icon" style={{ color: '#d32f2f' }} />;
    }
    return <FaFileImage className="attachment-icon" style={{ color: '#1976d2' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`attachment-manager ${readOnly ? 'readOnly' : ''}`}>
      <h3>
        <FaPaperclip /> Attachments
      </h3>

      {!readOnly && (
        <div className="attachment-upload">
          <div className="file-input-wrapper">
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload" className="file-input-label">
              Choose File
            </label>
          </div>
          {!hideUploadButton && (
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : `Upload${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}`}
            </Button>
          )}
        </div>
      )}

      {error && <div className="attachment-error">{error}</div>}

      {(attachments && attachments.length > 0) || (!hideUploadButton && selectedFiles.length > 0) ? (
        <ul className="attachment-list">
          {hideUploadButton ? (
            attachments.map((file, index) => (
              <li key={`pending-${index}`} className="attachment-item pending">
                <div className="attachment-info">
                  {getFileIcon(file.type)}
                  <div className="attachment-details">
                    <span className="attachment-name">{file.name}</span>
                    <span className="attachment-meta">
                      {formatFileSize(file.size)} • Pending upload
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <div className="attachment-actions">
                    <button
                      type="button"
                      className="delete-attachment-btn"
                      onClick={() => removeSelectedFile(index)}
                      title="Remove file"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            selectedFiles.map((file, index) => (
              <li key={`pending-${index}`} className="attachment-item pending">
                <div className="attachment-info">
                  {getFileIcon(file.type)}
                  <div className="attachment-details">
                    <span className="attachment-name">{file.name}</span>
                    <span className="attachment-meta">
                      {formatFileSize(file.size)} • Pending upload
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <div className="attachment-actions">
                    <button
                      type="button"
                      className="delete-attachment-btn"
                      onClick={() => removeSelectedFile(index)}
                      title="Remove file"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
          {attachments && !hideUploadButton && attachments.map((attachment) => (
            <li key={attachment.filename} className="attachment-item">
              <div
                className="attachment-info"
                onClick={() => handleAttachmentClick(attachment)}
              >
                {getFileIcon(attachment.mimetype)}
                <div className="attachment-details">
                  <span className="attachment-name">{attachment.originalName}</span>
                  <span className="attachment-meta">
                    {formatFileSize(attachment.size)} • {new Date(attachment.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {!readOnly && (
                <div className="attachment-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="delete-attachment-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(attachment.filename);
                    }}
                    title="Delete attachment"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-attachments">No attachments</div>
      )}
    </div>
  );
}

export default AttachmentManager;
