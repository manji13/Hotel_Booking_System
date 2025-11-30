import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- Auth & Main Pages ---
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Dashboard';
import Userpage from './Pages/Userpage';
import UserProfile from './Pages/Userprofile';

// --- User Booking Flow ---
import Booking from './Pages/Booking';
import UserBookingForm from './Pages/UserBookingForm';
import UserBookingDetails from './Pages/Employee/userbookingdetails'; // Corrected path based on previous steps

// --- Employee Pages ---
import UserDetails from './Pages/Employee/UserDetails';
import AddBooking from './Pages/Employee/AddBooking';
import DetailsRooms from './Pages/Employee/DetailsRooms';
import EmployeeBookingList from './Pages/Employee/bookinglist'; // <--- NEW PAGE

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
          {/* --- Public & Auth Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* --- User Dashboard & Profile --- */}
          <Route path="/userpage" element={<Userpage/>} />
          <Route path="/userprofile" element={<UserProfile/>} />

          {/* --- Booking Flow --- */}
          {/* 1. List of Rooms */}
          <Route path="/booking" element={<Booking/>} />
          
          {/* 2. Booking Form (Selected Room) */}
          <Route path="/booking/:roomId" element={<UserBookingForm/>} />
          
          {/* 3. Booking Success/Details (View & Delete) */}
          <Route path="/booking-details/:id" element={<UserBookingDetails />} />

          {/* --- Employee Routes --- */}
          {/* New List of All Bookings */}
          <Route path="/employee-bookings" element={<EmployeeBookingList />} />
          
          {/* Existing Employee Pages */}
          <Route path="/userdetails" element={<UserDetails/>} />
          <Route path="/addbooking" element={<AddBooking/>} />
          <Route path="/detailsrooms" element={<DetailsRooms/>} />

      </Routes>
    </Router>
  );
}

export default App;