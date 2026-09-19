-- Create the database
CREATE DATABASE IF NOT EXISTS blooddonation;
USE blooddonation;

-- 1. Users Table (for Authentication/Profile)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profilePic LONGTEXT,
    resetToken VARCHAR(255),
    resetTokenExpiry DATETIME,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'denied') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Donors Table (registered donors)
CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    availability TINYINT(1) DEFAULT 1,
    gender VARCHAR(20) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    dob DATE NOT NULL,
    lastDonatedDate DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Receivers Table (blood receivers)
CREATE TABLE IF NOT EXISTS receivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hospitals Table (for Admin Dashboard)
CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    available_beds INT DEFAULT 0,
    blood_inventory LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
