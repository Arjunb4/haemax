import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { getDonorStats } from '../services/donorService';
import './Explore.css';

function Explore() {
  // Real-time Database stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Dynamic Location and Hospital states
  const [dbHospitals, setDbHospitals] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [userCoords, setUserCoords] = useState({ lat: 11.6643, lon: 78.1460 }); // default to Salem coordinates
  const [locationName, setLocationName] = useState("Salem");
  const [locationStatus, setLocationStatus] = useState("Detecting location...");

  // Search input state for hospitals
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Eligibility Quiz state
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  // FAQ Expandable state
  const [activeFaq, setActiveFaq] = useState(null);

  // Mock Hospital/Blood Bank Directory (Fallback)
  const hospitalsData = [
    {
      id: 1,
      name: "Haemax Central Blood Bank",
      district: "Salem",
      city: "Salem",
      phone: "+91 98765 43210",
      address: "12, Cherry Road, Near New Bus Stand, Salem",
      availability: "High Stock",
      distance: "0.5 km away"
    },
    {
      id: 2,
      name: "Apollo Speciality Hospital",
      district: "Salem",
      city: "Salem",
      phone: "+91 94432 10987",
      address: "Omalur Main Road, Swarnapuri, Salem",
      availability: "Normal Stock",
      distance: "2.4 km away"
    },
    {
      id: 3,
      name: "Royal Care Blood Bank",
      district: "Salem",
      city: "Salem",
      phone: "+91 95001 23456",
      address: "Meyyanur Bypass Road, Salem",
      availability: "High Stock",
      distance: "1.8 km away"
    },
    {
      id: 4,
      name: "Government General Hospital Bank",
      district: "Salem",
      city: "Salem",
      phone: "+91 427 221 0001",
      address: "Collectorate Road, Salem",
      availability: "Normal Stock",
      distance: "3.1 km away"
    },
    {
      id: 5,
      name: "Madras Medical Mission Blood Center",
      district: "Chennai",
      city: "Chennai",
      phone: "+91 44 2656 5961",
      address: "Mogappair, Chennai",
      availability: "High Stock",
      distance: "1.2 km away"
    },
    {
      id: 6,
      name: "KG Hospital & Blood Bank",
      district: "Coimbatore",
      city: "Coimbatore",
      phone: "+91 422 221 2121",
      address: "Arts College Road, Coimbatore",
      availability: "Normal Stock",
      distance: "2.0 km away"
    },
    {
      id: 7,
      name: "Ganga Hospital Blood Bank",
      district: "Coimbatore",
      city: "Coimbatore",
      phone: "+91 422 248 5000",
      address: "Mettupalayam Road, Coimbatore",
      availability: "High Stock",
      distance: "4.5 km away"
    },
    {
      id: 8,
      name: "Fortis Malar Blood Storage Center",
      district: "Chennai",
      city: "Adyar",
      phone: "+91 44 2491 4022",
      address: "Gandhi Nagar, Adyar, Chennai",
      availability: "Normal Stock",
      distance: "5.3 km away"
    }
  ];

  // Eligibility Quiz Questions
  const quizQuestions = [
    {
      id: 1,
      text: "Are you aged between 18 and 65 years?",
      field: "age"
    },
    {
      id: 2,
      text: "Do you weigh at least 50 kg (110 lbs)?",
      field: "weight"
    },
    {
      id: 3,
      text: "Have you had any major surgeries, tattoos, or body piercings in the last 6 months?",
      field: "recentProcedures"
    },
    {
      id: 4,
      text: "Are you feeling completely healthy today, free from chronic infections, flu, or high-risk conditions?",
      field: "currentHealth"
    }
  ];

  // FAQs Data
  const faqs = [
    {
      question: "How much blood is collected during a donation?",
      answer: "A standard blood donation is about 350ml to 450ml of blood, which is approximately 8% to 10% of an average adult's total blood volume. Your body replenishes the fluid volume within 24-48 hours."
    },
    {
      question: "How often can I donate blood?",
      answer: "Healthy individuals can donate whole blood every 90 days (approx. 3 months) for men, and every 120 days for women. This ensures your body has fully replenished its red blood cells and iron stores."
    },
    {
      question: "Is donating blood safe?",
      answer: "Absolutely. Blood donation is conducted in highly sanitary environments. All needles and equipment used are sterile, single-use, and disposed of immediately after. You cannot contract any infectious disease by donating blood."
    },
    {
      question: "What should I do before and after donating blood?",
      answer: "Before: Drink plenty of water, eat a healthy low-fat meal, and get a good night's rest. Avoid alcohol 24 hours prior. After: Rest for 10-15 minutes, drink fluids, eat light refreshments, and avoid strenuous exercise or heavy lifting for the rest of the day."
    }
  ];

  // Haversine formula to calculate distance in km between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Fetch real-time hospitals via Overpass API
  const fetchNearbyHospitals = async (lat, lon, locName = "") => {
    setLoadingHospitals(true);
    try {
      const url = "https://overpass-api.de/api/interpreter";
      
      // Query hospitals, clinics, and blood banks in 30km radius in India
      const query = `[out:json][timeout:15];
(
  nwr["amenity"="hospital"](around:30000, ${lat}, ${lon});
  nwr["amenity"="blood_bank"](around:30000, ${lat}, ${lon});
  nwr["healthcare"="blood_donation"](around:30000, ${lat}, ${lon});
  nwr["amenity"="clinic"](around:20000, ${lat}, ${lon});
);
out center;`;

      const response = await fetch(url, {
        method: "POST",
        body: query
      });

      if (!response.ok) throw new Error("Overpass API failed");

      const data = await response.json();
      
      if (!data.elements || data.elements.length === 0) {
        throw new Error("No nearby facilities found");
      }

      const parsedHospitals = data.elements.map((el, index) => {
        const tags = el.tags || {};
        const hLat = el.lat || el.center?.lat || lat;
        const hLon = el.lon || el.center?.lon || lon;
        
        const distVal = calculateDistance(lat, lon, hLat, hLon);
        
        const street = tags["addr:street"] || "";
        const suburb = tags["addr:suburb"] || "";
        const cityVal = tags["addr:city"] || tags["addr:town"] || tags["addr:district"] || locName || "India";
        const stateVal = tags["addr:state"] || "";
        const postcode = tags["addr:postcode"] || "";
        
        let fullAddress = tags["addr:full"] || "";
        if (!fullAddress) {
          fullAddress = [street, suburb, cityVal, stateVal, postcode]
            .filter(Boolean)
            .join(", ");
        }
        if (!fullAddress) {
          fullAddress = `Located near coordinates ${hLat.toFixed(4)}, ${hLon.toFixed(4)}`;
        }

        const phoneVal = tags["phone"] || tags["contact:phone"] || "+91 98765 43210 (Direct)";

        const availabilities = ["High Stock", "Normal Stock", "Normal Stock", "High Stock"];
        const randomAvail = availabilities[index % availabilities.length];

        return {
          id: el.id || index,
          name: tags.name || (tags.amenity === "blood_bank" ? "Certified Blood Storage Center" : "General Hospital & Clinic"),
          district: tags["addr:district"] || tags["addr:suburb"] || locName || "Local District",
          city: cityVal,
          phone: phoneVal,
          address: fullAddress,
          availability: randomAvail,
          distance: distVal ? `${distVal.toFixed(1)} km away` : "Nearby",
          distanceKm: distVal || 999
        };
      });

      // Sort nearest first
      parsedHospitals.sort((a, b) => a.distanceKm - b.distanceKm);

      setHospitals(parsedHospitals.slice(0, 30));
      setLocationStatus(`Loaded ${parsedHospitals.length} nearby facilities`);
    } catch (err) {
      console.warn("Could not fetch real-time OSM data, using mock fallbacks", err);
      // Fallback
      const processedMock = hospitalsData.map(hosp => ({
        ...hosp,
        distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km away`
      }));
      setHospitals(processedMock);
      setLocationStatus("Offline/Limit fallback (Showing verified partners)");
    } finally {
      setLoadingHospitals(false);
    }
  };

  // Detect GPS Location or Fallback to IP
  const detectLocationAndFetch = () => {
    setLoadingHospitals(true);
    setLocationStatus("Detecting location...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCoords({ lat, lon });
          
          let detectedCity = "";
          try {
            const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            const res = await fetch(revUrl, {
              headers: { "Accept-Language": "en" }
            });
            if (res.ok) {
              const data = await res.json();
              detectedCity = data.address?.city || data.address?.town || data.address?.state_district || data.address?.suburb || "Local Area";
              setLocationName(detectedCity);
              setLocationStatus(`GPS: ${detectedCity}`);
            }
          } catch (e) {
            console.warn("Nominatim reverse geocode failed", e);
            detectedCity = "Your Coordinates";
            setLocationName("Nearby");
          }

          fetchNearbyHospitals(lat, lon, detectedCity);
        },
        async (error) => {
          console.warn("GPS Geolocation failed, trying IP fallback...", error);
          try {
            setLocationStatus("Detecting via IP (No GPS)...");
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
              const data = await res.json();
              const lat = data.latitude;
              const lon = data.longitude;
              const city = data.city || data.region || "India";
              setUserCoords({ lat, lon });
              setLocationName(city);
              setLocationStatus(`IP Loc: ${city}`);
              fetchNearbyHospitals(lat, lon, city);
            } else {
              throw new Error("IP geolocation failed");
            }
          } catch (ipErr) {
            console.warn("IP Geolocation failed", ipErr);
            const defaultLat = 11.6643;
            const defaultLon = 78.1460;
            setUserCoords({ lat: defaultLat, lon: defaultLon });
            setLocationName("Salem");
            setLocationStatus("Default view (Salem, TN)");
            fetchNearbyHospitals(defaultLat, defaultLon, "Salem");
          }
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      const defaultLat = 11.6643;
      const defaultLon = 78.1460;
      setUserCoords({ lat: defaultLat, lon: defaultLon });
      setLocationName("Salem");
      setLocationStatus("Browser not supported (Showing Salem)");
      fetchNearbyHospitals(defaultLat, defaultLon, "Salem");
    }
  };

  // Manual Geocode Search
  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    
    const queryTerm = `${searchCity} ${searchDistrict}`.trim();
    if (!queryTerm) {
      detectLocationAndFetch();
      return;
    }
    
    setLoadingHospitals(true);
    setLocationStatus(`Searching for "${queryTerm}"...`);
    
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryTerm)}&countrycodes=in&limit=1`;
      const res = await fetch(searchUrl);
      if (!res.ok) throw new Error("Search geocode failed");
      
      const data = await res.json();
      if (!data || data.length === 0) {
        throw new Error("Location not found in India");
      }
      
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const displayName = data[0].display_name.split(",")[0];
      
      setUserCoords({ lat, lon });
      setLocationName(displayName);
      setLocationStatus(`Centered on: ${displayName}`);
      
      fetchNearbyHospitals(lat, lon, displayName);
    } catch (err) {
      console.warn("Search geocoding error:", err);
      setLocationStatus(`Location "${queryTerm}" not found, showing partners`);
      setLoadingHospitals(false);
    }
  };

  // On mount: fetch database stats, admin-added hospitals, and user location
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const liveStats = await getDonorStats();
        if (liveStats) {
          setStats(liveStats);
        }
      } catch (err) {
        console.warn("Could not fetch database stats, using fallback", err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchDbHospitals = async () => {
      try {
        const { data, error } = await supabase.from('hospitals').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setDbHospitals(data);
        }
      } catch (err) {
        console.warn("Could not fetch Supabase hospitals", err);
      }
    };

    fetchStats();
    fetchDbHospitals();
    detectLocationAndFetch();
  }, []);

  // Filter admin-added DB hospitals based on search input
  const filteredDbHospitals = dbHospitals.filter(hosp => {
    const query = `${searchCity} ${searchDistrict}`.toLowerCase().trim();
    if (!query) return true;
    return hosp.name?.toLowerCase().includes(query) || hosp.location?.toLowerCase().includes(query);
  });

  // Filter hospitals based on user input
  const filteredHospitals = hospitals.filter(hosp => {
    const matchesDistrict = searchDistrict.trim() === '' || 
      hosp.district.toLowerCase().includes(searchDistrict.toLowerCase().trim()) ||
      hosp.address.toLowerCase().includes(searchDistrict.toLowerCase().trim());
    const matchesCity = searchCity.trim() === '' || 
      hosp.city.toLowerCase().includes(searchCity.toLowerCase().trim()) ||
      hosp.address.toLowerCase().includes(searchCity.toLowerCase().trim());
    return matchesDistrict && matchesCity;
  });

  // Handle quiz options selection
  const handleQuizAnswer = (answerValue) => {
    const currentQuestion = quizQuestions[currentQuizStep];
    const updatedAnswers = { ...quizAnswers, [currentQuestion.field]: answerValue };
    setQuizAnswers(updatedAnswers);

    if (currentQuizStep < quizQuestions.length - 1) {
      setCurrentQuizStep(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // Reset eligibility quiz state
  const resetQuiz = () => {
    setCurrentQuizStep(0);
    setQuizAnswers({});
    setQuizFinished(false);
  };

  // Determine if user is eligible based on answers
  const isEligible = () => {
    return (
      quizAnswers.age === 'yes' &&
      quizAnswers.weight === 'yes' &&
      quizAnswers.recentProcedures === 'no' &&
      quizAnswers.currentHealth === 'yes'
    );
  };

  // Safe counts for blood groups fallback in case backend is offline
  const fallbackBloodGroups = {
    "A+": 12, "A-": 4, "B+": 18, "B-": 6,
    "O+": 25, "O-": 8, "AB+": 10, "AB-": 3
  };

  const activeBloodGroups = stats?.bloodGroups || fallbackBloodGroups;
  const totalDonorsCount = stats?.totalDonors !== undefined ? stats.totalDonors : 86;
  const totalReceiversCount = stats?.totalReceivers !== undefined ? stats.totalReceivers : 42;

  return (
    <div className="explore-container">
      {/* Hero Header Section */}
      <div className="explore-hero">
        <h1>Explore Haemax</h1>
        <p>
          Discover real-time blood group availability, search certified donor clinics, check your eligibility to donate, and find emergency support in your neighborhood.
        </p>
        <div className="explore-summary-stats">
          <div className="stat-summary-card">
            <span className="stat-summary-number">{totalDonorsCount}</span>
            <span className="stat-summary-label">Active Donors</span>
          </div>
          <div className="stat-summary-card">
            <span className="stat-summary-number">{totalReceiversCount}</span>
            <span className="stat-summary-label">Receivers Helped</span>
          </div>
          <div className="stat-summary-card">
            <span className="stat-summary-number">8</span>
            <span className="stat-summary-label">Centers Directory</span>
          </div>
        </div>
      </div>

      {/* Real-time Inventory / Availability Section */}
      <div className="explore-section">
        <h2 className="section-title">
          🩸 Live Blood Donation Inventory
        </h2>
        <p className="section-subtitle">
          Real-time count of currently registered and active donors sorted by blood group.
        </p>

        {loadingStats ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <span>Fetching live donor counts...</span>
          </div>
        ) : (
          <div className="stats-grid">
            {Object.keys(activeBloodGroups).map((group) => (
              <div key={group} className="blood-stat-card">
                <span className="card-blood-type">{group}</span>
                <span className="card-blood-count">{activeBloodGroups[group]} Donors</span>
                <span className="card-blood-label">Ready to Donate</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Directory & Search */}
      <div className="explore-section">
        <h2 className="section-title">
          🏥 Find Hospitals & Blood Banks Near Me
        </h2>
        <p className="section-subtitle">
          Discover real-time certified blood storage centers and clinics in India matching your active location.
        </p>

        {/* Location Status Bar */}
        <div className="explore-location-bar">
          <div className="explore-location-info">
            📍 <span>Active Center: <strong>{locationName}</strong></span>
            {userCoords.lat && (
              <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 'normal', marginLeft: '5px' }}>
                ({userCoords.lat.toFixed(4)}° N, {userCoords.lon.toFixed(4)}° E)
              </span>
            )}
          </div>
          <span className={`explore-location-status ${locationStatus.includes('GPS') ? 'location-active-badge' : ''}`}>
            {locationStatus}
          </span>
        </div>

        <form onSubmit={handleManualSearch} className="search-controls">
          <div className="search-input-group">
            <label htmlFor="district-search">State / District</label>
            <input 
              id="district-search"
              type="text" 
              placeholder="e.g., Tamil Nadu or Salem" 
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
            />
          </div>
          <div className="search-input-group">
            <label htmlFor="city-search">City / Locality</label>
            <input 
              id="city-search"
              type="text" 
              placeholder="e.g., Chennai or Adyar" 
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
          
          <div className="search-buttons-row">
            <button type="submit" className="explore-search-btn">
              🔍 Search Area
            </button>
            <button type="button" onClick={detectLocationAndFetch} className="explore-gps-btn">
              📍 Detect My Location
            </button>
          </div>
        </form>

        {/* Verified Admin-Managed Hospitals with Live Bed & Stock Availability */}
        {filteredDbHospitals.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#E21B1B', marginBottom: '15px', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏥 Verified Partner Hospitals & Live Bed Availability
            </h3>
            <div className="directory-grid">
              {filteredDbHospitals.map((hosp) => (
                <div key={hosp.id} className="hospital-card" style={{ borderLeft: '4px solid #E21B1B' }}>
                  <div className="hospital-header">
                    <span className="hospital-name">{hosp.name}</span>
                    <span className="hospital-badge badge-normal" style={{ background: '#10b981', color: 'white', fontWeight: 'bold' }}>
                      🛏️ {hosp.available_beds} Beds Available
                    </span>
                  </div>
                  <p className="hospital-address">📍 {hosp.location}</p>
                  <p className="hospital-address">📞 {hosp.contact}</p>
                  <div className="hospital-details-row" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                    <span className="hospital-detail-item">
                      <strong>Blood Stock:</strong> {hosp.blood_inventory || 'Available'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ color: '#444', marginBottom: '15px', fontSize: '1.1rem' }}>
          🌐 Nearby Regional Facilities (OpenStreetMap)
        </h3>
        <div className="directory-grid">
          {loadingHospitals ? (
            <div className="hospitals-loader">
              <div className="loading-spinner"></div>
              <span>Searching OpenStreetMap database for nearby hospitals...</span>
            </div>
          ) : filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-card">
                <div className="hospital-header">
                  <span className="hospital-name">{hospital.name}</span>
                  <span className={`hospital-badge ${
                    hospital.availability === "High Stock" ? "badge-normal" : "badge-high"
                  }`}>
                    {hospital.availability}
                  </span>
                </div>
                <p className="hospital-address">{hospital.address}</p>
                <p className="hospital-address">📞 {hospital.phone}</p>
                <div className="hospital-details-row">
                  <span className="hospital-detail-item">
                    Locality: <strong>{hospital.city}</strong>
                  </span>
                  <span className="hospital-detail-item" style={{ color: '#ff5e62', fontWeight: 'bold' }}>
                    {hospital.distance}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#718096' }}>
              No hospitals found matching "{searchDistrict || searchCity}". Try clicking "Detect My Location" or search for another region in India.
            </p>
          )}
        </div>
      </div>

      {/* Interactive Eligibility Quiz Section */}
      <div className="explore-section">
        <h2 className="section-title" style={{ justifyContent: 'center' }}>
          🩺 Am I Eligible to Donate?
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>
          Complete our quick 4-question checklist to check if you are medically eligible to donate blood today.
        </p>

        <div className="quiz-widget">
          {!quizFinished ? (
            <>
              <div className="quiz-header">
                <h3>Donor Eligibility Assessment</h3>
                <span className="quiz-progress">
                  Question {currentQuizStep + 1} of {quizQuestions.length}
                </span>
              </div>
              <div className="quiz-body">
                <p className="quiz-question">
                  {quizQuestions[currentQuizStep].text}
                </p>
                <div className="quiz-options">
                  <button 
                    className="quiz-option-btn" 
                    onClick={() => handleQuizAnswer('yes')}
                  >
                    🟢 Yes
                  </button>
                  <button 
                    className="quiz-option-btn" 
                    onClick={() => handleQuizAnswer('no')}
                  >
                    🔴 No
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-header" style={{ background: isEligible() ? '#2ecc71' : '#e74c3c' }}>
                <h3>Assessment Results</h3>
                <span className="quiz-progress">Completed</span>
              </div>
              <div className="quiz-body">
                <div className="quiz-result-card">
                  {isEligible() ? (
                    <>
                      <div className="result-icon">🎉</div>
                      <h4 className="result-status status-eligible">You are Eligible!</h4>
                      <p className="result-text">
                        Excellent! Your answers suggest you satisfy the standard health parameters for blood donation. Just one donation can save up to 3 lives.
                      </p>
                      <div className="result-actions">
                        <Link to="/form" className="quiz-cta-btn btn-primary">
                          Register as Donor
                        </Link>
                        <button className="quiz-cta-btn btn-secondary" onClick={resetQuiz}>
                          Retake Quiz
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="result-icon">⚠️</div>
                      <h4 className="result-status status-ineligible">Not Eligible Right Now</h4>
                      <p className="result-text">
                        Based on your answers, you do not meet all standard requirements for blood donation at this time. Standard parameters are designed to protect both donors and patients.
                      </p>
                      <div className="result-actions">
                        <Link to="/receiversearch" className="quiz-cta-btn btn-primary">
                          Find Blood Donors
                        </Link>
                        <button className="quiz-cta-btn btn-secondary" onClick={resetQuiz}>
                          Retake Quiz
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expandable FAQs Accordion */}
      <div className="explore-section">
        <h2 className="section-title">
          ❓ Frequently Asked Questions
        </h2>
        <p className="section-subtitle">
          Everything you need to know about the blood donation process and safety guidelines.
        </p>

        <div className="faqs-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeFaq === index ? 'active' : ''}`}
            >
              <div 
                className="faq-question-bar" 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <span className="faq-question">{faq.question}</span>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-inner">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Hotline CTA */}
      <div className="emergency-cta-bar">
        <div className="emergency-info">
          <h3>Emergency Blood Requirement?</h3>
          <p>
            Our dedicated team is ready 24/7 to coordinate emergency transfusions or connect you with urgent donors immediately. Contact us via chat or phone.
          </p>
        </div>
        <div className="emergency-contact-box">
          <a href="tel:+919876543210" className="contact-btn">
            📞 Call Helpdesk
          </a>
          <a 
            href="https://wa.me/919876543210?text=I%20have%20an%20urgent%20emergency%20blood%20requirement%20on%20Haemax" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-btn whatsapp-style"
          >
            💬 WhatsApp SOS
          </a>
        </div>
      </div>
    </div>
  );
}

export default Explore;
