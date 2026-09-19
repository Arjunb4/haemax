import React, { useState, useEffect } from "react";
import { getReceivers } from "../services/receiverService";
import "./DonationRequests.css";

function DonationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getReceivers();
        setRequests(data);
      } catch (err) {
        setError("Failed to load donation requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return <div className="loading-state">Loading active requests...</div>;

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h2>Donation Requests</h2>
        <p>People in your area who are urgently in need of blood.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!error && requests.length === 0 && (
        <div className="no-requests">
          <p>There are currently no active blood donation requests.</p>
        </div>
      )}

      <div className="requests-grid">
        {requests.map((req) => (
          <div key={req.id} className="request-card">
            <div className="card-top">
              <span className="blood-group">{req.blood_type}</span>
              <span className="date-posted">
                {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h3 className="patient-name">{req.name}</h3>

            <div className="location-info">
              📍 {req.city}, {req.district}
            </div>

            <div className="contact-box">
              <span className="phone-label">Contact:</span>
              <span className="phone-number">{req.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonationRequests;
