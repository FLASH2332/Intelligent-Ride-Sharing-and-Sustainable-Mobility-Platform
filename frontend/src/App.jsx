import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Driver Pages
import CreateTrip from './pages/driver/CreateTrip';
import RideRequests from './pages/driver/RideRequests';

// Passenger Pages
import SearchTrips from './pages/passenger/SearchTrips';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Driver Routes */}
        <Route path="/driver/create-trip" element={<CreateTrip />} />
        <Route path="/driver/requests" element={<RideRequests />} />
        
        {/* Passenger Routes */}
        <Route path="/passenger/search" element={<SearchTrips />} />
      </Routes>
    </Router>
  );
}

export default App;
