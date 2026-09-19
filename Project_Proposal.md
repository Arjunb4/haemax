# PROJECT PROPOSAL

## Project Title: HAEMAX – Web-Based Blood Bank & Donation Management System

---

### 1. ABSTRACT
**Haemax** is an integrated, full-stack web application designed to bridge the gap between voluntary blood donors, patients requiring urgent blood transfusions, and healthcare facilities (hospitals/blood banks). The platform automates donor registration, blood availability searching by location and blood group, emergency receiver requests, user authentication (including Google OAuth), and centralized administrative governance. Built using the **PERN/MERN-style relational stack** (React.js, Node.js, Express.js, MySQL), Haemax provides a real-time, responsive, secure, and user-friendly solution to save lives efficiently.

---

### 2. PROBLEM STATEMENT
In traditional blood bank management systems:
1. **Time-Consuming Searches:** Locating specific blood types in urgent medical emergencies often involves manual phone calls and physical visits to multiple blood banks.
2. **Data Inaccuracy:** Paper-based or uncoordinated records lead to outdated donor availability and stock levels.
3. **Lack of Real-time Connectivity:** Donors are often unaware of nearby blood requirements, leading to delayed medical care.
4. **Security & Tracking Issues:** Lack of role-based access control can compromise user privacy and donor records.

---

### 3. OBJECTIVES & SCOPE

#### Objectives:
* To create a **centralized platform** for seamless interaction between blood donors, receivers, and administrators.
* To provide **location-based donor search** filtering by Blood Group, District, and City.
* To implement **secure authentication** with JWT (JSON Web Tokens) and Google OAuth 2.0.
* To provide an **Admin Dashboard** for managing users, approving/denying access, monitoring blood requests, and overseeing hospital inventories.
* To enable donors to track their **donation history** and toggle real-time availability.

#### Scope:
* Applicable for hospitals, blood banks, NGOs, and voluntary donor communities.
* Scalable architecture capable of extending to emergency SMS/Email notifications, geo-location mapping, and blood compatibility AI matching in future iterations.

---

### 4. SYSTEM ARCHITECTURE & HOW IT WORKS

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT SIDE                                      |
|    React.js 19 + Vite | React Router DOM | Axios | Google OAuth | CSS3            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | REST API Calls (HTTP/HTTPS)
                                          v
+-----------------------------------------------------------------------------------+
|                                  SERVER SIDE                                      |
|    Node.js + Express.js Server (Port 5001)                                        |
|    - CORS & Middleware | JWT Authentication | Bcrypt Hashing                      |
|    - Route Controllers: Auth, Donors, Receivers, Profile, Admin                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | MySQL Queries (mysql2 Driver)
                                          v
+-----------------------------------------------------------------------------------+
|                                DATABASE LAYER                                     |
|    MySQL Relational Database (`blooddonation`)                                    |
|    - Tables: users, donors, receivers, hospitals                                  |
+-----------------------------------------------------------------------------------+
```

#### How System Execution Works:
1. **User Sign Up & Authentication:** Users register via regular email/password or Google OAuth. Passwords are securely hashed using `bcryptjs`. Upon login, the server issues a signed `JSON Web Token (JWT)` for session management.
2. **Donor Registration:** Authenticated users register as blood donors by providing personal details, blood type, weight, date of birth, location (district & city), and last donation date.
3. **Receiver Search:** Patients or relatives search for blood donors by selecting the required **Blood Group**, **District**, and **City**. The system queries the MySQL database for matching, active, and eligible donors.
4. **Emergency Requests:** Receivers can post urgent blood request forms, making them visible to potential donors and administrators.
5. **Profile Management:** Users can update profile information, upload profile pictures (Base64), track their donation history, and switch their donation availability status.
6. **Admin Governance:** Admins log into a specialized dashboard to view overall system metrics, manage user statuses (Active/Denied), handle hospital inventory levels, and process blood requests.

---

### 5. TECHNOLOGIES & TOOLS USED

#### Frontend (Client-Side):
* **Language:** JavaScript (ES6+), HTML5, CSS3
* **Framework:** React.js (v19) with Vite (Fast build tool)
* **Routing:** React Router DOM (v7)
* **HTTP Client:** Axios (for API communication)
* **Authentication UI:** `@react-oauth/google` (Google OAuth 2.0 Integration)
* **Icons:** React Icons (`react-icons`)

#### Backend (Server-Side):
* **Runtime:** Node.js
* **Framework:** Express.js (v4)
* **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), `bcrypt` / `bcryptjs`
* **Google Auth Verification:** `google-auth-library`
* **Cross-Origin & Config:** `cors`, `dotenv`, `body-parser`

#### Database:
* **Database Management System:** MySQL Relational Database
* **Database Driver:** `mysql2` (Promise-based MySQL client for Node.js)

#### Development Tools:
* **Code Editor:** Visual Studio Code
* **API Testing Tool:** Postman / cURL
* **Version Control:** Git & GitHub

---

### 6. DATABASE SCHEMA

#### 1. `users` Table (Authentication & User Accounts)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK, Auto Inc) | Unique user identifier |
| `name` | VARCHAR(255) | First Name |
| `lname` | VARCHAR(255) | Last Name |
| `email` | VARCHAR(255) (Unique) | User email address |
| `phone` | VARCHAR(20) | Contact number |
| `password` | VARCHAR(255) | Hashed password |
| `profilePic` | LONGTEXT | Base64 encoded image data |
| `role` | ENUM('user', 'admin') | Access role (Default: user) |
| `status` | ENUM('active', 'denied') | Account status (Default: active) |
| `resetToken` | VARCHAR(255) | Password reset token |
| `resetTokenExpiry`| DATETIME | Reset token expiration time |
| `created_at` | TIMESTAMP | Registration timestamp |

#### 2. `donors` Table (Registered Donors)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK, Auto Inc) | Unique donor identifier |
| `name` | VARCHAR(255) | Full Name |
| `email` | VARCHAR(255) (Unique) | Contact email |
| `phone` | VARCHAR(20) | Contact number |
| `city` | VARCHAR(100) | Donor city |
| `district` | VARCHAR(100) | Donor district |
| `availability` | TINYINT(1) | Availability status (1 = Available, 0 = Not Available) |
| `gender` | VARCHAR(20) | Gender |
| `blood_type` | VARCHAR(10) | Blood Group (A+, B+, O+, AB+, etc.) |
| `weight` | DECIMAL(5,2) | Weight in kg (Eligibility check) |
| `dob` | DATE | Date of Birth |
| `lastDonatedDate` | DATE | Date of last donation |
| `created_at` | TIMESTAMP | Record creation date |

#### 3. `receivers` Table (Blood Requests)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK, Auto Inc) | Unique request identifier |
| `name` | VARCHAR(255) | Receiver / Patient name |
| `phone` | VARCHAR(20) | Contact number |
| `blood_type` | VARCHAR(10) | Required blood group |
| `district` | VARCHAR(100) | District required |
| `city` | VARCHAR(100) | City required |
| `created_at` | TIMESTAMP | Request timestamp |

#### 4. `hospitals` Table (Hospital & Stock Inventory)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK, Auto Inc) | Hospital ID |
| `name` | VARCHAR(255) | Hospital name |
| `location` | VARCHAR(255) | Address / Location |
| `contact` | VARCHAR(20) | Hospital phone number |
| `available_beds` | INT | Number of available beds |
| `blood_inventory`| LONGTEXT | Stock levels per blood group |
| `created_at` | TIMESTAMP | Record timestamp |

---

### 7. MODULES BREAKDOWN

1. **Authentication & Authorization Module:**
   * Signup & Login with password encryption (`bcrypt`).
   * One-click Google Login (`@react-oauth/google`).
   * Password recovery via token reset (`ResetPassword.jsx`).
   * Session preservation using JWT stored securely.

2. **Donor Management Module:**
   * Interactive Donor Registration Form with validation (Weight >= 50kg, Age eligibility).
   * Real-time toggle of active availability.
   * Donor profile view and history tracking ("My Donations").

3. **Receiver & Search Module:**
   * Dynamic search engine for donors by Blood Group, District, and City.
   * Direct contact display for rapid reach during medical emergencies.
   * Receiver request submission form.

4. **Admin Dashboard Module:**
   * Management of registered users (Approve / Deny accounts).
   * View live statistics: total donors, total receivers, active users.
   * Monitoring hospital stock and bed capacity.

---

### 8. HARDWARE & SOFTWARE REQUIREMENTS

#### Software Requirements:
* **Operating System:** Windows 10/11, Linux, or macOS
* **Web Browser:** Google Chrome, Mozilla Firefox, or Microsoft Edge (Latest versions)
* **Runtime & Server:** Node.js (v18.x or above), npm (v9.x or above)
* **Database Server:** MySQL Server (v8.0 or above) / XAMPP / WAMP

#### Hardware Requirements:
* **Processor:** Dual-Core 2.0 GHz CPU or higher (Intel Core i3/i5/i7 or AMD equivalent)
* **RAM:** 4 GB minimum (8 GB recommended)
* **Storage:** 500 MB free hard drive space for application code and dependencies

---

### 9. FUTURE ENHANCEMENTS
1. **SMS & WhatsApp Alerts:** Instant automated notification to matching nearby donors when an emergency blood request is submitted.
2. **Geo-Location & Map Integration:** Live GPS mapping using Google Maps API to pinpoint the nearest available donor or blood bank.
3. **AI Blood Demand Forecasting:** Predictive analytics to forecast blood group shortages during festival seasons or seasonal health outbreaks.
4. **Mobile Application:** Building cross-platform iOS and Android mobile apps using React Native.

---

### 10. CONCLUSION
The **Haemax Blood Bank Management System** presents a modern, efficient, and reliable platform for managing blood donation workflows. By digitizing donor records, providing real-time location-based search, ensuring secure authentication, and offering administrative oversight, Haemax drastically reduces response time during critical medical emergencies and contributes significantly to saving human lives.
