import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaUserCheck, FaUserTimes, FaBan, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import { TAMIL } from '../../utils/tamilText.js'; // Import Tamil Dictionary
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', '1');
      params.append('limit', '50');

      const res = await api.get(`/admin/users?${params}`);
      const { data: userList, pagination } = res.data;

      setUsers(userList);
      setFilteredUsers(userList);
      setPagination(pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || TAMIL.loadFailed); // Fallback error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Toggle Active Status
  const toggleStatus = async (userId, currentStatus) => {
    // "Are you sure you want to change the status of this user?"
    if (!window.confirm(TAMIL.confirmStatusChange)) return;

    setToggling(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      const updatedUser = res.data.data;

      // UPDATE BOTH LISTS
      const updateUserInList = (list) => 
        list.map(u => u.id === userId ? { ...u, ...updatedUser } : u);

      setUsers(prev => updateUserInList(prev));
      setFilteredUsers(prev => updateUserInList(prev));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  // Delete User
  const handleDelete = async (userId) => {
    // "Permanently delete this user? This cannot be undone."
    if (!window.confirm(TAMIL.confirmDeleteUser)) return;

    setDeleting(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      
      // REMOVE FROM BOTH LISTS
      const removeUserFromList = (list) => list.filter(u => u.id !== userId);
      
      setUsers(prev => removeUserFromList(prev));
      setFilteredUsers(prev => removeUserFromList(prev));
    } catch (err) {
      alert(err.response?.data?.message || TAMIL.deleteUserFailed);
    } finally {
      setDeleting(null);
    }
  };

  if (loading && users.length === 0) return <Loader message={TAMIL.loadingUsers} />;


  
  return (
    <div className="manage-users-page">
      <div className="admin-card">
        <div className="page-header">
          <h2 className="admin-page-title">{TAMIL.manageUsersTitle}</h2>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={TAMIL.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    {searchTerm ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              ) : (
               

                filteredUsers.map((user) => (
                   
                  <tr key={user.id}>
                    <td className="user-name">
                      <strong>{user.name}</strong>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? (
                          <>
                            <FaUserCheck /> Active
                          </>
                        ) : (
                          <>
                            <FaUserTimes /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {/* Display role in Tamil if possible, otherwise English */}
                        {user.role === 'admin' ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="join-date">
{user.joinedAt
  ? new Date(user.joinedAt).toLocaleDateString('En-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  : "Unknown"}

</td>
                    <td className="actions">
                      <button
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        disabled={toggling === user.id}
                        className={`action-btn ${user.isActive ? 'ban' : 'unban'}`}
                        title={user.isActive ? TAMIL.deactivate : TAMIL.activate}
                      >
                        {toggling === user.id ? '...' : user.isActive ? <FaBan /> : <FaCheckCircle />}
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleting === user.id}
                        className="action-btn delete"
                        title= "Delete User"
                      >
                        {deleting === user.id ? '...' : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination">
            {/* "Page X of Y" -> "பக்கம் X மொத்தம் Y" */}
            <p>{TAMIL.page} {pagination.page} {TAMIL.of} {pagination.totalPages}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;