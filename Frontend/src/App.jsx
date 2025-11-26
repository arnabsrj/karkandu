// import React from 'react'
// import Navbar from './components/common/Navbar'
// import UserRoutes from './routes/UserRoutes'

// const App = () => {
//   return (
//     <div>
//       <Navbar/>
//       <UserRoutes/>
      
//     </div>
//   )
// }

// export default App// src/App.jsx


// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { BlogProvider } from './context/BlogContext.jsx';
import UserRoutes from './routes/UserRoutes.jsx';
import AdminRoutes from './routes/AdminRoutes.jsx';
import NotFound from './pages/user/NotFound.jsx';
import './App.css'; // Optional global styles

function App() {
  return (
      <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;