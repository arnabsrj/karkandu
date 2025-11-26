import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { TAMIL } from "../../utils/tamilText.js"; // Import Tamil Dictionary
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalUsers: 0,
    totalViews: 0,
    totalComments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Admin stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="admin-card">Loading</div>;

  return (
    <div className="admin-card">
      <h2 className="admin-page-title">Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Blogs</h3>
          <p className="stat-number">{stats.totalBlogs}</p>
        </div>

        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Total Views</h3>
          <p className="stat-number">{stats.totalViews}</p>
        </div>

        <div className="stat-card">
          <h3>Total Comments</h3>
          <p className="stat-number">{stats.totalComments}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;