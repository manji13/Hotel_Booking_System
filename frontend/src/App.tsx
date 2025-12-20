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
import UserBookingHistory from './Pages/UserBookingHistory'; // <--- NEW IMPORT
import UserBookingDetails from './Pages/Employee/userbookingdetails'; 

// --- Employee Pages ---
import UserDetails from './Pages/Employee/UserDetails';
import AddBooking from './Pages/Employee/AddBooking';
import DetailsRooms from './Pages/Employee/DetailsRooms';
import EmployeeBookingList from './Pages/Employee/bookinglist';
import EmployeeHomePage from './Pages/Employee/EmployeeHomePage';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
          {/* --- Public & Auth Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/userpage" element={<Userpage/>} />
          <Route path="/userprofile" element={<UserProfile/>} />

          {/* --- Booking Flow --- */}
          {/* 1. List of Rooms */}
          <Route path="/booking" element={<Booking/>} />
          
          {/* 2. Booking Form (Selected Room) */}
          <Route path="/booking/:roomId" element={<UserBookingForm/>} />
          
          {/* 3. User's Personal Booking History (List of their own bookings) */}
          <Route path="/my-history" element={<UserBookingHistory />} /> {/* <--- NEW ROUTE */}
          
          {/* 4. Single Booking Details (View & Delete) */}
          <Route path="/booking-details/:id" element={<UserBookingDetails />} />

          {/* --- Employee Routes --- */}
          {/* List of All Bookings (Admin View) */}
          <Route path="/employee-bookings" element={<EmployeeBookingList />} />
          
          {/* Existing Employee Pages */}
          <Route path="/userdetails" element={<UserDetails/>} />
          <Route path="/addbooking" element={<AddBooking/>} />
          <Route path="/detailsrooms" element={<DetailsRooms/>} />
          <Route path="/employee_home_page" element={<EmployeeHomePage/>} />

      </Routes>
    </Router>
  );
}

export default App;