const axios = require('axios');
axios.get('http://localhost:3001person')
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response ? err.response.data : err.message));
