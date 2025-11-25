import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Dashboard'; // Make sure to create this file
import Userpage from './Pages/Userpage';

function App() {


  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Userpage" element={<Userpage/>} />

          
      </Routes>
    </Router>
  );
}

export default App;