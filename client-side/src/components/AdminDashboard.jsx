import React, { useState, useEffect } from "react";
import {
  getAllUsers, updateUserStatus,
  getHospitals, addHospital, deleteHospital,
  getRequests, getMatches,
  getAllDonors, updateDonorStatus
} from "../services/adminService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchingDonors, setMatchingDonors] = useState([]);
  const [matchingHospitals, setMatchingHospitals] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const [newHospital, setNewHospital] = useState({
    name: "", location: "", contact: "", available_beds: 0, blood_inventory: ""
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "users") {
        const data = await getAllUsers();
        setUsers(data);
      } else if (activeTab === "hospitals") {
        const data = await getHospitals();
        setHospitals(data);
      } else if (activeTab === "requests") {
        const data = await getRequests();
        setRequests(data);
      } else if (activeTab === "donors") {
        const data = await getAllDonors();
        setDonors(data);
      }
    } catch (err) {
      setError("Failed to load data. Please ensure you have admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "denied" : "active";
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const handleDonorApproval = async (donorId, newStatus) => {
    try {
      await updateDonorStatus(donorId, newStatus);
      setDonors(donors.map(d => d.id === donorId ? { ...d, status: newStatus } : d));
    } catch (err) {
      alert("Failed to update donor status.");
    }
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      await addHospital(newHospital);
      setNewHospital({ name: "", location: "", contact: "", available_beds: 0, blood_inventory: "" });
      fetchData();
    } catch (err) {
      alert("Failed to add hospital.");
    }
  };

  const handleDeleteHospital = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital?")) return;
    try {
      await deleteHospital(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete hospital.");
    }
  };

  const handleOpenMatchModal = async (req) => {
    setSelectedRequest(req);
    setIsMatchModalOpen(true);
    setLoadingMatches(true);
    try {
      const result = await getMatches({
        blood_type: req.blood_type,
        district: req.district,
        city: req.city
      });
      setMatchingDonors(result.donors);
      setMatchingHospitals(result.hospitals);
    } catch (err) {
      alert("Failed to fetch matching donors and hospitals.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleCloseMatchModal = () => {
    setIsMatchModalOpen(false);
    setSelectedRequest(null);
    setMatchingDonors([]);
    setMatchingHospitals([]);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Control Panel</h1>
        <p>Manage users, donors, hospitals, and view donation requests.</p>
      </div>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`} onClick={() => setActiveTab('donors')}>Donors Approval</button>
        <button className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>Hospitals</button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Donation Requests</button>
      </div>

      <div className="admin-content">
        {loading && <div className="loader">Loading data...</div>}
        {error && <div className="error-box">{error}</div>}

        {!loading && !error && activeTab === 'users' && (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.fname} {u.lname}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`action-btn ${u.status === 'active' ? 'deny' : 'allow'}`}
                          onClick={() => handleToggleStatus(u.id, u.status)}
                        >
                          {u.status === 'active' ? 'Deny Access' : 'Allow Access'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && activeTab === 'donors' && (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Location</th>
                  <th>Phone / Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td><span className="blood-type-badge">{d.blood_type}</span></td>
                    <td>{d.city}, {d.district}</td>
                    <td>{d.phone} <br/><small>{d.email}</small></td>
                    <td>
                      <span className={`status-badge ${d.status === 'approved' ? 'active' : (d.status === 'rejected' ? 'deny' : 'pending')}`}>
                        {d.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      {d.status !== 'approved' && (
                        <button
                          className="action-btn allow"
                          style={{ marginRight: '5px' }}
                          onClick={() => handleDonorApproval(d.id, 'approved')}
                        >
                          Approve
                        </button>
                      )}
                      {d.status !== 'rejected' && (
                        <button
                          className="action-btn deny"
                          onClick={() => handleDonorApproval(d.id, 'rejected')}
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {donors.length === 0 && <tr><td colSpan="6">No donors found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && activeTab === 'hospitals' && (
          <div className="hospitals-section">
            <div className="add-hospital-card">
              <h3>Add New Hospital</h3>
              <form onSubmit={handleAddHospital} className="add-hospital-form">
                <input type="text" placeholder="Hospital Name" required value={newHospital.name} onChange={e => setNewHospital({ ...newHospital, name: e.target.value })} />
                <input type="text" placeholder="Location" required value={newHospital.location} onChange={e => setNewHospital({ ...newHospital, location: e.target.value })} />
                <input type="text" placeholder="Contact Number" required value={newHospital.contact} onChange={e => setNewHospital({ ...newHospital, contact: e.target.value })} />
                <input type="number" placeholder="Available Beds" value={newHospital.available_beds} onChange={e => setNewHospital({ ...newHospital, available_beds: e.target.value })} />
                <input type="text" placeholder="Blood Inventory (e.g. A+: 5, O-: 2)" value={newHospital.blood_inventory} onChange={e => setNewHospital({ ...newHospital, blood_inventory: e.target.value })} />
                <button type="submit" className="submit-hospital-btn">Add Hospital</button>
              </form>
            </div>

            <div className="hospitals-grid">
              {hospitals.map(h => (
                <div key={h.id} className="hospital-card">
                  <h4>{h.name}</h4>
                  <p><strong>Location:</strong> {h.location}</p>
                  <p><strong>Contact:</strong> {h.contact}</p>
                  <p><strong>Beds Available:</strong> {h.available_beds}</p>
                  <p><strong>Inventory:</strong> {h.blood_inventory || 'N/A'}</p>
                  <button onClick={() => handleDeleteHospital(h.id)} className="delete-hospital-btn">Remove</button>
                </div>
              ))}
              {hospitals.length === 0 && <p>No hospitals added yet.</p>}
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'requests' && (
          <div className="requests-section">
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Blood Type</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Date Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td>{req.name}</td>
                      <td><span className="blood-type-badge">{req.blood_type}</span></td>
                      <td>{req.city}, {req.district}</td>
                      <td>{req.phone}</td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="action-btn allow"
                          onClick={() => handleOpenMatchModal(req)}
                        >
                          Match & Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && <tr><td colSpan="6">No active donation requests.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isMatchModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="match-modal">
            <div className="modal-header">
              <h2>Match & Contact for {selectedRequest.name}</h2>
              <button className="close-modal-btn" onClick={handleCloseMatchModal}>&times;</button>
            </div>

            <div className="request-summary">
              <span className="summary-badge">Request Details:</span>
              <span><strong>Blood Group:</strong> {selectedRequest.blood_type}</span>
              <span><strong>Location:</strong> {selectedRequest.city}, {selectedRequest.district}</span>
              <span><strong>Phone:</strong> {selectedRequest.phone}</span>
            </div>

            {loadingMatches ? (
              <div className="modal-loader">Searching database for nearest matches...</div>
            ) : (
              <div className="modal-lists-container">
                <div className="modal-list-section">
                  <h3>Matching Available Donors ({matchingDonors.length})</h3>
                  <div className="modal-card-list">
                    {matchingDonors.map(donor => (
                      <div key={donor.id} className="match-card donor">
                        <div className="card-main">
                          <h4>{donor.name} ({donor.blood_type})</h4>
                          <p>📍 {donor.city}, {donor.district}</p>
                          <p>Gender: {donor.gender}</p>
                        </div>
                        <a href={`tel:${donor.phone}`} className="modal-call-btn">📞 Call Now</a>
                      </div>
                    ))}
                    {matchingDonors.length === 0 && <p className="no-matches">No active donors matching {selectedRequest.blood_type} found.</p>}
                  </div>
                </div>

                <div className="modal-list-section">
                  <h3>Nearest Hospitals & Inventory ({matchingHospitals.length})</h3>
                  <div className="modal-card-list">
                    {matchingHospitals.map(hosp => (
                      <div key={hosp.id} className="match-card hospital">
                        <div className="card-main">
                          <h4>{hosp.name}</h4>
                          <p>📍 {hosp.location}</p>
                          <p>Available Beds: {hosp.available_beds}</p>
                          <p className="inventory-text"><strong>Inventory:</strong> {hosp.blood_inventory || 'N/A'}</p>
                        </div>
                        <a href={`tel:${hosp.contact}`} className="modal-call-btn hosp-btn">📞 Call Hospital</a>
                      </div>
                    ))}
                    {matchingHospitals.length === 0 && <p className="no-matches">No hospital availability records found.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
