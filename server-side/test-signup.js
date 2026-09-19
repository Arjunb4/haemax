async function testSignup() {
  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fname: "Test",
        lname: "User",
        phone: "1234567890",
        email: "test." + Date.now() + "@example.com",
        password: "password123"
      })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Data:", data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
testSignup();
