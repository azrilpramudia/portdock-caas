const axios = require('axios');
(async () => {
  try {
    const api = axios.create({ baseURL: 'http://localhost:3000/api', withCredentials: true });
    // We can't actually do this without a cookie jar in Node easily, but let's try.
  } catch (e) {
    console.log(e);
  }
})();
