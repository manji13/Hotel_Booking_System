import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Dashboard'; // Make sure to create this file
import Userpage from './Pages/Userpage';
import UserProfile from './Pages/Userprofile';

import Booking from './Pages/Booking';

import UserDetails from './Pages/Employee/UserDetails';
import AddBooking from './Pages/Employee/AddBooking';
import DetailsBooking from './Pages/Employee/DetailsBooking';
function App() {


  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/userpage" element={<Userpage/>} />
          <Route path="/userprofile" element={<UserProfile/>} />

          <Route path="/booking" element={<Booking/>} />

          <Route path="/userdetails" element={<UserDetails/>} />
          <Route path="/addbooking" element={<AddBooking/>} />
          <Route path="/detailsbooking" element={<DetailsBooking/>} />

      </Routes>
    </Router>
  );
}

export default App;