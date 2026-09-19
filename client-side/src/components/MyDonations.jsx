import React, { useState, useEffect } from "react";
import { getMyDonations } from "../services/donorService";
import { Link } from "react-router-dom";
import "./MyDonations.css";

function MyDonations() {
  const [donationData, setDonationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonationRecord = async () => {
      try {
        const data = await getMyDonations();
        setDonationData(data);
      } catch (err) {
        setError("Failed to load donation records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonationRecord();
  }, []);

  if (loading) return <div className="loading-state">Loading your donation history...</div>;

  return (
    <div className="donations-container">
      <div className="donations-header">
        <h2>My Donations</h2>
        <p>Track your blood donation history and status.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!donationData && !error && (
        <div className="no-donations-card">
          <div className="icon">🩸</div>
          <h3>You haven't registered as a donor yet!</h3>
          <p>Register as a blood donor today and help save lives.</p>
          <Link to="/form" className="register-btn">Register to Donate</Link>
        </div>
      )}

      {donationData && (
        <div className="donation-record-card">
          <div className="record-header">
            <h3>Donor Status</h3>
            <span className={`status-badge ${donationData.availability ? 'active' : 'inactive'}`}>
              {donationData.availability ? 'Available to Donate' : 'Currently Unavailable'}
            </span>
          </div>

          <div className="record-details">
            <div className="detail-item">
              <span className="label">Blood Group</span>
              <span className="value blood-group">{donationData.blood_type}</span>
            </div>
            <div className="detail-item">
              <span className="label">Location</span>
              <span className="value">{donationData.city}, {donationData.district}</span>
            </div>
            <div className="detail-item">
              <span className="label">Last Donated</span>
              <span className="value">
                {donationData.lastDonatedDate
                  ? new Date(donationData.lastDonatedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'No previous donations recorded'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyDonations;
