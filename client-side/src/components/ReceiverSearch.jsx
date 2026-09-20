import React, { useState, useEffect, useRef } from 'react';
import { searchDonors } from '../services/donorService';
import { storeReceiver } from '../services/receiverService';
import './ReceiverSearch.css';

function ReceiverSearch() {
  // State for donor search parameters
  const [searchParams, setSearchParams] = useState({
    blood_type: '',
    district: '',
    city: ''
  });

  // State for receiver request submission
  const [receiverForm, setReceiverForm] = useState({
    name: '',
    phone: '',
    blood_type: '',
    district: '',
    city: ''
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Ref to store debounce timeout id
  const debounceTimeout = useRef(null);

  // Handle search field input
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // Handle receiver request form input
  const handleReceiverFormChange = (e) => {
    const { name, value } = e.target;
    setReceiverForm((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to calculate donor's age
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 'N/A';
  };

  // Perform search for approved donors
  const performSearch = async (params = searchParams) => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const data = await searchDonors({
        blood_type: params.blood_type,
        district: params.district,
        city: params.city
      });
      setDonors(data || []);
      if (!data || data.length === 0) {
        setError('No approved donors found matching your search criteria.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search donors.');
    } finally {
      setLoading(false);
    }
  };

  // Execute search on mount and when searchParams change (debounced)
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      performSearch(searchParams);
    }, 400);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchParams]);

  // Submit receiver request to database
  const handleStoreReceiver = async (e) => {
    e.preventDefault();
    if (!receiverForm.name.trim() || !receiverForm.phone.trim() || !receiverForm.blood_type) {
      setRequestError('Please fill in your Name, Phone number, and Blood Group.');
      return;
    }

    setSubmittingRequest(true);
    setRequestError('');
    setRequestSuccess('');

    try {
      await storeReceiver({
        name: receiverForm.name.trim(),
        phone: receiverForm.phone.trim(),
        blood_type: receiverForm.blood_type.trim(),
        district: receiverForm.district.trim(),
        city: receiverForm.city.trim()
      });

      setRequestSuccess('🎉 Your blood request has been submitted successfully! Available donors and admins can now reach out to you.');
      setReceiverForm({ name: '', phone: '', blood_type: '', district: '', city: '' });
      setTimeout(() => setRequestSuccess(''), 6000);
    } catch (err) {
      console.error('Receiver storage error:', err);
      setRequestError(err.message || 'Failed to submit request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="search-container">
      <h2>🩸 Find Approved Blood Donors</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Search registered and approved blood donors by blood group, district, or city.
      </p>

      {/* Search Filter Inputs */}
      <div className="search-controls-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', textAlignment: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
            Blood Group
          </label>
          <select name="blood_type" value={searchParams.blood_type} onChange={handleSearchChange}>
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', textAlignment: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
            District
          </label>
          <input
            type="text"
            name="district"
            placeholder="e.g. Salem or Chennai"
            value={searchParams.district}
            onChange={handleSearchChange}
          />
        </div>

        <div>
          <label style={{ display: 'block', textAlignment: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
            City / Locality
          </label>
          <input
            type="text"
            name="city"
            placeholder="e.g. Adyar or Meyyanur"
            value={searchParams.city}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '25px' }}>
        <button onClick={() => performSearch()} disabled={loading} style={{ maxWidth: '250px' }}>
          {loading ? 'Searching...' : '🔍 Search Donors'}
        </button>
        <button
          type="button"
          onClick={() => setShowRequestForm(!showRequestForm)}
          style={{ maxWidth: '280px', background: showRequestForm ? '#555' : '#10b981' }}
        >
          {showRequestForm ? 'Close Request Form' : '🚨 Post Urgent Blood Request'}
        </button>
      </div>

      {/* Optional Urgent Blood Requirement Submission Form */}
      {showRequestForm && (
        <div className="urgent-request-form" style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left' }}>
          <h3 style={{ color: '#c53030', marginTop: 0 }}>🚨 Post Urgent Blood Requirement</h3>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            Can't find a donor nearby? Post your requirement here so volunteers and admins can contact you directly.
          </p>

          <form onSubmit={handleStoreReceiver}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                name="name"
                placeholder="Patient / Receiver Name *"
                value={receiverForm.name}
                onChange={handleReceiverFormChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Contact Phone Number *"
                value={receiverForm.phone}
                onChange={handleReceiverFormChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <select name="blood_type" value={receiverForm.blood_type} onChange={handleReceiverFormChange} required>
                <option value="" disabled>Select Needed Group *</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                name="district"
                placeholder="District"
                value={receiverForm.district}
                onChange={handleReceiverFormChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City / Hospital Area"
                value={receiverForm.city}
                onChange={handleReceiverFormChange}
              />
            </div>

            {requestError && <p className="error" style={{ margin: '10px 0' }}>{requestError}</p>}
            {requestSuccess && <p style={{ color: '#276749', fontWeight: 'bold', margin: '10px 0' }}>{requestSuccess}</p>}

            <button type="submit" disabled={submittingRequest} style={{ background: '#e53e3e', width: 'auto', padding: '10px 25px' }}>
              {submittingRequest ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {loading && <p style={{ fontWeight: 'bold', color: '#e53e3e' }}>Fetching donors list...</p>}

      {/* Donor Card Grid */}
      <ul className="donor-list">
        {donors.length > 0 ? (
          donors.map((donor) => (
            <li key={donor.id} className="donor-card">
              <div className="card-header">
                <img
                  className="donor-profile"
                  src={donor.profilePic || 'https://via.placeholder.com/150'}
                  alt={donor.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                />
                <div className="donor-name-group">
                  <h3>{donor.name}</h3>
                  <span className="blood-group-badge">{donor.blood_type}</span>
                </div>
                <div className={`availability-badge ${donor.availability ? 'available' : 'unavailable'}`}>
                  {donor.availability ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{donor.city || 'N/A'}, {donor.district || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{calculateAge(donor.dob)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value" style={{ textTransform: 'capitalize' }}>{donor.gender || 'N/A'}</span>
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
                <a href={`tel:${donor.phone}`} className="contact-info" style={{ display: 'block', textDecoration: 'none' }}>
                  📞 Call {donor.phone}
                </a>
              </div>
            </li>
          ))
        ) : (
          searched && !loading && (
            <p className="no-results" style={{ gridColumn: '1 / -1' }}>
              No approved donors found for the specified criteria. Try clearing filters or selecting another blood group.
            </p>
          )
        )}
      </ul>
    </div>
  );
}

export default ReceiverSearch;
