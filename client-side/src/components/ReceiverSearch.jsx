import React, { useState, useEffect, useRef } from 'react';
import { searchDonors } from '../services/donorService';
import { storeReceiver } from '../services/receiverService';
import './ReceiverSearch.css';

function ReceiverSearch() {
  // State for receiver details
  const [receiver, setReceiver] = useState({
    name: '',
    phone: ''
  });

  // State for donor search parameters
  const [searchParams, setSearchParams] = useState({
    blood_type: '',
    district: '',
    city: ''
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ref to store debounce timeout id
  const debounceTimeout = useRef(null);

  // Handle changes for receiver details
  const handleReceiverChange = (e) => {
    const { name, value } = e.target;
    setReceiver((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for search parameters
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to calculate donor's age (if dob is provided)
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Function to store receiver details in the receiver table
  const handleStoreReceiver = async () => {
    try {
      await storeReceiver({
        name: receiver.name.trim(),
        phone: receiver.phone.trim(),
        blood_type: searchParams.blood_type.trim(),
        district: searchParams.district.trim(),
        city: searchParams.city.trim()
      });
      console.log('Receiver data stored successfully.');
    } catch (err) {
      console.error('Receiver storage error:', err);
    }
  };

  const handleSearch = async () => {
    // Validate that receiver details are filled
    if (receiver.name.trim() === '' || receiver.phone.trim() === '') {
      setError("Please enter your name and phone number before searching.");
      return;
    }

    setLoading(true);
    setError('');

    // First, store receiver details to the receiver table
    await handleStoreReceiver();

    try {
      const data = await searchDonors({
        blood_type: searchParams.blood_type,
        district: searchParams.district,
        city: searchParams.city
      });
      if (data.length === 0) {
        setDonors([]);
        setError("No donors found");
      } else {
        setDonors(data);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
    }

    setLoading(false);
  };

  // Debounce effect for donor search when search parameters change (if all fields are non-empty)
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (
      searchParams.blood_type.trim() !== '' &&
      searchParams.district.trim() !== '' &&
      searchParams.city.trim() !== ''
    ) {
      debounceTimeout.current = setTimeout(() => {
        console.log("Debounced search triggered with:", searchParams);
        handleSearch();
      }, 500);
    } else {
      // Clear donors if any search field is empty
      setDonors([]);
    }

    return () => clearTimeout(debounceTimeout.current);
  }, [searchParams]);

  return (
    <div className="search-container">
      <h2>Find Blood Donors</h2>

      {/* Receiver Details Section */}
      <div className="receiver-details">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={receiver.name}
          onChange={handleReceiverChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Your Phone Number"
          value={receiver.phone}
          onChange={handleReceiverChange}
          required
        />
      </div>

      {/* Donor Search Fields */}
      <select name="blood_type" value={searchParams.blood_type} onChange={handleSearchChange} required>
        <option value="" disabled>Select Blood Group</option>
        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input type="text" name="district" placeholder="District" value={searchParams.district} onChange={handleSearchChange} required />
      <input type="text" name="city" placeholder="City" value={searchParams.city} onChange={handleSearchChange} required />

      <button onClick={handleSearch} disabled={loading}>Search</button>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="donor-list">
        {donors.length > 0 ? (
          donors.map((donor) => (
            <li key={donor.id} className="donor-card">
              <div className="card-header">
                <img
                  className="donor-profile"
                  src={donor.profilePic || 'https://via.placeholder.com/150'}
                  alt={donor.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                />
                <div className="donor-name-group">
                  <h3>{donor.name}</h3>
                  <span className="blood-group-badge">{donor.blood_type}</span>
                </div>
                {/* Note: In database schema, availability is TINYINT(1) where 1 is true. So donor.availability might be 1 or 0 */}
                <div className={`availability-badge ${donor.availability ? 'available' : 'unavailable'}`}>
                  {donor.availability ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{calculateAge(donor.dob)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value" style={{ textTransform: 'capitalize' }}>{donor.gender || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Weight</span>
                    <span className="info-value">{donor.weight ? `${donor.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Donated</span>
                    <span className="info-value">
                      {donor.lastDonatedDate
                        ? new Date(donor.lastDonatedDate).toLocaleDateString()
                        : 'First Donation'}
                    </span>
                  </div>
                </div>
                <div className="contact-info">
                  📞 {donor.phone}
                </div>
              </div>
            </li>
          ))
        ) : (
          !loading && <p className="no-results">No donors found. Please try a different location or blood group.</p>
        )}
      </ul>
    </div>
  );
}

export default ReceiverSearch;
