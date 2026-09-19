const axios = require('axios');
(async () => {
  try {
    const resp = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'aj777cr@gmail.com',
      password: 'Password123!'
    }, { headers: { 'Content-Type': 'application/json' } });
    console.log('Login success', resp.data);
  } catch (e) {
    if (e.response) {
      console.error('Login failed', e.response.status, e.response.data);
    } else {
      console.error('Error', e.message);
    }
  }
})();
