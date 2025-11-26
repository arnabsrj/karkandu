import React, { useEffect, useState } from 'react';
import { FaEnvelope, FaUser, FaPhone, FaCalendarAlt, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../../services/api.js';
import Loader from '../../../components/common/Loader.jsx';
import { API } from '../../../config.js';
import { TAMIL } from '../../../utils/tamilText.js'; 
import './ContactMessages.css'; 

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(API.adminContacts.getAll);
        const data = res.data.data || res.data || [];
        setMessages(data);
        setError('');
      } catch (err) {
        console.error('Fetch contacts error:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // --- DELETE FUNCTIONALITY ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      // FIX: Added fallback string '/admin/contacts' in case API.adminContacts.delete is undefined
      const deleteEndpoint = API.adminContacts?.delete || '/admin/contacts';
      
      await api.delete(`${deleteEndpoint}/${id}`);
      
      // Remove from UI
      setMessages(prev => prev.filter(msg => msg._id !== id));
      
      // Reset pagination if page becomes empty
      const total = messages.length - 1;
      const maxPage = Math.ceil(total / itemsPerPage);
      if (currentPage > maxPage && currentPage > 1) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error(err);
      alert(TAMIL.deleteFailed);
    }
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMessages = messages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(messages.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <Loader message="Loading messages..." />;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="admin-comments-page">
      <div className="page-header">
        <h2 className="page-title"><FaEnvelope /> Contact Messages</h2>
      </div>
      
      <div className="total-count">
        "Total Messages": {messages.length} | "Showing" {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, messages.length)} / {messages.length}
      </div>

      {messages.length === 0 ? (
        <p className="no-comments">No contact messages yet.</p>
      ) : (
        <>
          <div className="comments-list">
            {currentMessages.map((msg) => (
              <div key={msg._id} className="admin-comment-item">
                <div className="comment-card">
                  
                  {/* Header: User Info & Actions */}
                  <div className="comment-header">
                    <div className="author-info">
                      <div className="avatar-placeholder" style={{display:'flex', alignItems:'center', justifyContent:'center', background:'#e0e7ff', color:'#4f46e5', width:'40px', height:'40px', borderRadius:'50%'}}>
                          <FaUser />
                      </div>
                      
                      <div>
                        <strong className="author-name">{msg.name}</strong>
                        
                        <div style={{ fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                            <FaEnvelope size={10}/> {msg.email}
                          </span>
                          {msg.mobile && (
                            <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                              <FaPhone size={10}/> {msg.mobile}
                            </span>
                          )}
                        </div>

                        <small className="comment-date" style={{marginTop: '4px', display: 'block'}}>
                          <FaCalendarAlt /> {new Date(msg.createdAt).toLocaleDateString('En-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>

                    <div className="comment-actions">
                      <button onClick={() => handleDelete(msg._id)} className="delete-btn" title="Delete button">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Body: The Message */}
                  <div className="comment-body" style={{ marginTop: '10px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn prev"
              >
                <FaChevronLeft />
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn next"
              >
                 <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactMessages;