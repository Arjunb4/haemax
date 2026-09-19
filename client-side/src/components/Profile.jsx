import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/profileService";
import "./Profile.css";
import { FaUserEdit, FaEnvelope, FaPhone, FaTint, FaCalendarAlt, FaCheck, FaTimes, FaCamera } from "react-icons/fa";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
        setUpdatedUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setUpdatedUser(user);
    setSelectedImage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...updatedUser,
        profilePic: selectedImage || updatedUser.profilePic
      };

      await updateProfile(payload);

      setUser(payload);
      setUpdatedUser(payload);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-card">
          <div className="profile-photo-section">
            <label htmlFor="profileImage" className="profile-photo">
              <img src={selectedImage || user.profilePic || "https://via.placeholder.com/150"} alt="Profile" />
              {isEditing && (
                <div className="upload-overlay">
                  <FaCamera />
                  <span>Upload Photo</span>
                </div>
              )}
            </label>
            {isEditing && (
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            )}
          </div>

          <h2>{user.fname} {user.lname}</h2>
          <p className="blood-group">Blood Group: <strong>{user.bloodGroup || 'Not set'}</strong></p>

          <div className="donation-status">
            <FaCalendarAlt className="calendar-icon" />
            <p>Last Donated: <strong>{user.lastDonated}</strong></p>
          </div>
        </div>
      </div>

      <div className="profile-main">
        <h1>My Profile</h1>
        <div className="profile-info">
          <div className="profile-field">
            <label><FaUserEdit /> Name</label>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" name="fname" placeholder="First Name" value={updatedUser.fname || ''} onChange={handleChange} />
                <input type="text" name="lname" placeholder="Last Name" value={updatedUser.lname || ''} onChange={handleChange} />
              </div>
            ) : (
              <p>{user.fname} {user.lname}</p>
            )}
          </div>

          <div className="profile-field">
            <label><FaEnvelope /> Email</label>
            <p>{user.email}</p>
          </div>

          <div className="profile-field">
            <label><FaPhone /> Phone</label>
            {isEditing ? (
              <input type="text" name="phone" value={updatedUser.phone} onChange={handleChange} />
            ) : (
              <p>{user.phone}</p>
            )}
          </div>

          <div className="profile-field">
            <label><FaTint style={{ color: '#E21B1B' }} /> Blood Group</label>
            {isEditing ? (
              <select name="bloodGroup" value={updatedUser.bloodGroup || ""} onChange={handleChange}>
                <option value="">Not set</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            ) : (
              <p>{user.bloodGroup || 'Not set'}</p>
            )}
          </div>

          <div className="profile-field">
            <label><FaCalendarAlt /> Last Donated Date</label>
            {isEditing ? (
              <input type="date" name="lastDonated" value={updatedUser.lastDonated && updatedUser.lastDonated !== 'Never' ? updatedUser.lastDonated : ''} onChange={handleChange} />
            ) : (
              <p>{user.lastDonated || 'Never'}</p>
            )}
          </div>
        </div>

        <div className="profile-buttons">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}><FaCheck /> Save</button>
              <button className="cancel-btn" onClick={handleCancel}><FaTimes /> Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={handleEdit}><FaUserEdit /> Edit</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
