import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ApiService from '../../utils/apiService.js';
import StatusMessage from '../ui/StatusMessage/StatusMessage.jsx';
import './UserManagement.css';

function UserManagement() {
  const { user, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="user-management">
        <div className="access-denied">
          <h2 className="access-denied__title">Access Denied</h2>
          <p className="access-denied__message">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await ApiService.get('/users');
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user.id) {
      setError('You cannot change your own role');
      return;
    }

    try {
      setUpdatingUser(userId);
      setError(null);
      setSuccess('');

      await ApiService.put(`/users/${userId}/role`, { role: newRole });
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      setSuccess(`User role updated successfully`);
      
      if (userId === user.id) {
        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn('Could not refresh user profile:', refreshError);
        }
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role) => {
    return `role-badge role-badge--${role}`;
  };

  const getUserInitials = (user) => {
    if (user.firstName || user.lastName) {
      const first = user.firstName ? user.firstName[0] : '';
      const last = user.lastName ? user.lastName[0] : '';
      return (first + last).toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-spinner">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h1 className="user-management__title">User Management</h1>
      </div>

      {error && (
        <StatusMessage type="error" message={error} />
      )}
      
      {success && (
        <StatusMessage type="success" message={success} />
      )}

      {users.length === 0 ? (
        <div className="loading-spinner">
          No users found
        </div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(userItem => (
              <tr key={userItem.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {getUserInitials(userItem)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {userItem.firstName || userItem.lastName
                          ? `${userItem.firstName || ''} ${userItem.lastName || ''}`.trim()
                          : 'No name provided'
                        }
                      </div>
                      <div className="user-meta">
                        User ID: {userItem.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="user-email">{userItem.email}</span>
                </td>
                <td>
                  <span className={getRoleBadgeClass(userItem.role)}>
                    {userItem.role}
                  </span>
                </td>
                <td>
                  <div className="user-actions">
                    {userItem.id === user.id ? (
                      <span className="text-muted">You</span>
                    ) : (
                      <select
                        className="role-select"
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        disabled={updatingUser === userItem.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                    {updatingUser === userItem.id && (
                      <span className="updating-indicator">Updating...</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="text-muted">
                    {formatDate(userItem.created_at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserManagement;