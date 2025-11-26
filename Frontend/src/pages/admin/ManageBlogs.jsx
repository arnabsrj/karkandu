// src/pages/admin/ManageBlogs.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaArchive, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import api from '../../services/api.js';
import Loader from '../../components/common/Loader.jsx';
import './ManageBlogs.css';
import { TAMIL } from '../../utils/tamilText.js';

const CATEGORIES = [
  { id: 'meditation', name: 'Home', subcategories: [''] },
  { id: 'yoga', name: 'Spirituality', subcategories: ['ஸ்தல வரலாறு', 'மந்திரம்', 'பக்தி பாடல்', 'பக்தி கதை'] },
  { id: 'spirituality', name: 'Zodiac result', subcategories: ['தினப்பலன்', 'வார பலன்', 'ஆண்டு பலன்'] },
  { id: 'wellness', name: 'Lets find out too.', subcategories: ['அழகு குறிப்பு', 'சமையல் குறிப்பு', 'தொழில் நுட்பம்', 'பாட்டி வைத்தியம்', 'மற்றவை'] },
];


const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    category: '',
    subcategory: '',
    tags: '',
    isPublished: false,
  });
  const [subcategories, setSubcategories] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/blogs');
      setBlogs(res.data.data || []);
      setFilteredBlogs(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = blogs.filter(b =>
      b.title.toLowerCase().includes(term) ||
      b.excerpt.toLowerCase().includes(term) ||
      b.tags.some(t => t.toLowerCase().includes(term))
    );
    setFilteredBlogs(filtered);
  }, [searchTerm, blogs]);

  // Open Modal
  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setForm({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        featuredImage: blog.featuredImage || '',
        category: blog.category || '',
        subcategory: blog.subcategory || '',
        tags: blog.tags.join(', '),
        isPublished: blog.isPublished,
      });
      const cat = CATEGORIES.find(c => c.id === blog.category);
      setSubcategories(cat ? cat.subcategories : []);
    } else {
      setEditingBlog(null);
      setForm({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        category: '',
        subcategory: '',
        tags: '',
        isPublished: false,
      });
      setSubcategories([]);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBlog(null);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = CATEGORIES.find(c => c.id === catId);
    setSubcategories(cat ? cat.subcategories : []);
    setForm({ ...form, category: catId, subcategory: '' });
  };

  // Save Blog
//   const handleSave = async () => {
//     if (!form.title || !form.content || !form.category) {
//       alert('Title, Content, and Category are required');
//       return;
//     }

//     setSaving(true);
//     try {
//       const payload = {
//         ...form,
//         tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
//         subcategory: form.subcategory || null,
//       };

//       let res;
//       if (editingBlog) {
//         res = await api.put(`/admin/blogs/${editingBlog._id}`, payload);
//       } else {
//         res = await api.post('/admin/blogs', payload);
//       }

//       const savedBlog = res.data.data;
//       if (editingBlog) {
//         setBlogs(blogs.map(b => b.id === savedBlog._id ? savedBlog : b));
//         setFilteredBlogs(filteredBlogs.map(b => b.id === savedBlog._id ? savedBlog : b));
//       } else {
//         setBlogs([savedBlog, ...blogs]);
//         setFilteredBlogs([savedBlog, ...filteredBlogs]);
//       }
//       closeModal();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to save blog');
//     } finally {
//       setSaving(false);
//     }
//   };


const handleSave = async () => {
  if (!form.title || !form.content || !form.category) {
    alert('Title, Content, and Category are required');
    return;
  }



  setSaving(true);


  // inside handleSave before sending payload
// helper: strip HTML tags
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

// build excerpt: prefer user-provided excerpt; otherwise derive from content plain text
const plainText = stripHtml(form.content);
let derivedExcerpt = form.excerpt && form.excerpt.trim() ? form.excerpt.trim() : '';
if (!derivedExcerpt) {
  derivedExcerpt = plainText.length > 297 ? plainText.substring(0, 297).trim() + '...' : plainText;
} else {
  derivedExcerpt = derivedExcerpt.length > 300 ? derivedExcerpt.substring(0, 297).trim() + '...' : derivedExcerpt;
}

  try {
    const payload = {
      title: form.title,
      content: form.content,
      excerpt:    derivedExcerpt,  //form.excerpt || '',
      featuredImage: form.featuredImage || '',
      category: form.category,           // ← SEND CATEGORY
      subcategory: form.subcategory || null,  // ← SEND SUBCATEGORY (or null)
      tags: form.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
      isPublished: form.isPublished,
    };

    let res;
    if (editingBlog) {
      res = await api.put(`/admin/blogs/${editingBlog._id}`, payload);
    } else {
      res = await api.post('/admin/blogs', payload);
    }

     const savedBlog = res.data.data;
    if (editingBlog) {
         setBlogs(blogs.map(b => b.id === savedBlog._id ? savedBlog : b));
         setFilteredBlogs(filteredBlogs.map(b => b.id === savedBlog._id ? savedBlog : b));
       } else {
         setBlogs([savedBlog, ...blogs]);
         setFilteredBlogs([savedBlog, ...filteredBlogs]);
       }
       closeModal();

    // ... rest same
  } catch (err) {
  alert(err.response?.data?.message || 'Failed to save blog');
  } finally {
    setSaving(false);
  }
};


  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      setBlogs(blogs.filter(b => b.id !== id));
      setFilteredBlogs(filteredBlogs.filter(b => b.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Archive (Unpublish)
  const handleArchive = async (id, current) => {
    try {
      const res = await api.patch(`/admin/blogs/${id}/publish`, { isPublished: !current });
      const updated = res.data.data;
      setBlogs(blogs.map(b => b.id === id ? updated : b));
      setFilteredBlogs(filteredBlogs.map(b => b.id === id ? updated : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    setUploadingImage(true);
    const res = await api.post("/admin/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    console.log("Image URL from backend:", res.data.url);


    // set the returned URL
    setForm({ ...form, featuredImage: res.data.url });

  } catch (err) {
    alert("Image upload failed");
  } finally {
    setUploadingImage(false);
  }
};



  if (loading) return <Loader />;

  return (
    <div className="manage-blogs-page">
      <div className="admin-card">
        <div className="page-header">
          <h2 className="admin-page-title"> Manage Blogs</h2>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
            <button onClick={() => openModal()} className="btn-primary">
              <FaPlus /> New Blog
            </button>
        </div>

        <div className="blogs-table-container">
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.length === 0 ? (
                <tr><td colSpan="6" className="no-data">{TAMIL.noBlogsFound}</td></tr>
              ) : (
                filteredBlogs.map(blog => (
                  <tr key={blog._id}>
                    <td className="blog-title">
                      <strong>{blog.title}</strong>
                      {blog.isPublished ? <FaEye className="published-icon" /> : <FaEyeSlash className="draft-icon" />}
                    </td>
                    <td>{blog.category} {blog.subcategory && `> ${blog.subcategory}`}</td>
                    <td>
                      <span className={`status-badge ${blog.isPublished ? 'published' : 'draft'}`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{blog.viewsCount}</td>
                    <td>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button onClick={() => openModal(blog)} className="action-btn edit" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleArchive(blog._id, blog.isPublished)} className="action-btn archive" title={blog.isPublished ? 'Unpublish' : 'Publish'}>
                        <FaArchive />
                      </button>
                      <button onClick={() => handleDelete(blog._id)} className="action-btn delete" title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBlog ? 'Edit blog' : 'Create a new blog'}</h3>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Blog Title*</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter a blog title."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={handleCategoryChange}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sub Category</label>
                  <select
                    value={form.subcategory}
                    onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    disabled={!subcategories.length}
                  >
                    <option value="">Select SubCategory</option>
                    {subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  rows="3"
                  placeholder="Short Summary (Optional)" // short summary optional
                />
              </div>

              <div className="form-group">
  <label>
    Featured Image
  </label>

  {/* Existing URL input */}
  <input
    type="text"
    value={form.featuredImage}
    onChange={(e) =>
      setForm({ ...form, featuredImage: e.target.value })
    }
    placeholder="https://example.com/image.jpg"
    style={{ marginBottom: "8px" }}
  />

  {/* New Upload Button */}
  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
  />

  {uploadingImage && <p style={{ color: "orange" }}>Uploading...</p>}

  {/* Preview */}
  {form.featuredImage && (
    <img
      src={form.featuredImage}
      alt="Preview"
      style={{
        marginTop: "10px",
        height: "120px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        objectFit: "cover",
      }}
    />
  )}

</div>


              <div className="form-group">
                <label>
                  Tags (comma separated)
                  {/* Tags (comma separated) */}

                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="Spirituality, Yoga, etc"
                />
              </div>

              {/* <div className="form-group">
                <label>Content *</label> */}
            <div className="form-group">
  <label>Content *</label>
<ReactQuill
  theme="snow"
  value={form.content}
  onChange={(content) => setForm({ ...form, content })}
  placeholder= "Write your spiritual blog content here..."  //"Write your spiritual blog content here..."
  modules={{
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  }}
  formats={[
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'link',
    'image',
  ]}
  style={{ height: '320px', marginBottom: '3rem' }}
/>


</div>
              {/* </div> */}

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  Publish Immediately
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingBlog ? 'Update' : 'Create a new blog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;