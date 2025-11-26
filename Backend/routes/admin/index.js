// routes/admin/index.js
import express from 'express';
import { register, login, getProfile } from '../../controllers/admin/authController.js';
import { 
  create as createBlog, 
  update as updateBlog, 
  remove as removeBlog, 
  getAll as getAllBlogs, 
  togglePublish
} from '../../controllers/admin/blogController.js';
import { 
  getAll as getAllComments,
  removeComment, 
} from '../../controllers/admin/commentController.js';

// import User from '../../models/User.js'
import User from '../../models/User.js';

import { 
  getAnalytics, 
  getBlogDetail 
} from '../../controllers/admin/interactionController.js';
import { 
  getUsers, 
  getLogs, 
  updateStatus ,
  deleteUser,
  createUser
} from '../../controllers/admin/userController.js';
import { protectAdmin } from '../../middleware/auth.js';
import { deleteContact, getAllContacts } from '../../controllers/admin/contactController.js';
import { getAdminStats } from '../../controllers/admin/statsController.js';
import multer from 'multer';

const router = express.Router();

// Auth
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protectAdmin, getProfile); 

// backend/routes/admin/userRoutes.js
router.post('/users/create', protectAdmin, createUser);

// Blogs
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_"); // replace spaces with underscores
    cb(null, Date.now() + "-" + safeName);
  },
});


const upload = multer({ storage });

router.post('/blogs', protectAdmin, createBlog);
router.put('/blogs/:id', protectAdmin, updateBlog);
router.delete('/blogs/:id', protectAdmin, removeBlog);
router.get('/blogs', protectAdmin, getAllBlogs);
router.patch('/blogs/:id/publish', protectAdmin, togglePublish);
router.post("/upload-image", upload.single("image"), (req, res) => {
  // OLD BROKEN LINE:
  // const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  
  // NEW FIXED LINE:
  // Use process.env.BASE_URL which is "http://localhost:5000"
  const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
  
  res.json({ url: fileUrl });
});


// Comments
router.get('/comments', protectAdmin, getAllComments);
router.delete('/comments/:id', protectAdmin, removeComment); // ← ADD THIS LINE

// Interactions
router.get('/interactions', protectAdmin, getAnalytics);
router.get('/interactions/:blogId', protectAdmin, getBlogDetail);

// Users & Logs
router.get('/users', protectAdmin, getUsers);
router.get('/users/logs', protectAdmin, getLogs);
router.delete('/users/:id', protectAdmin, deleteUser);
router.patch('/users/:id/status', protectAdmin, updateStatus);

// router.get('/contacts', protectAdmin, getAllContacts);  // ← ADD THIS LINE
// Contacts
router.get('/contacts', protectAdmin, getAllContacts);
router.delete('/contacts/:id', protectAdmin, deleteContact); // ← NEW DELETE ROUTE


router.get("/stats", protectAdmin, getAdminStats);

export default router;