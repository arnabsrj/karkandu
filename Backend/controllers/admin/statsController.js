// controllers/admin/statsController.js
import Blog from "../../models/Blog.js";
import User from "../../models/User.js";
import Comment from "../../models/Comment.js";


export const getAdminStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });

    // Sum all views
    const blogs = await Blog.find({}, "viewsCount");
   const totalViews = blogs.reduce((acc, blog) => acc + (blog.viewsCount || 0), 0);

    const totalComments = await Comment.countDocuments();

    res.json({
      success: true,
      data: {
        totalBlogs,
        totalUsers,
        totalViews,
        totalComments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
