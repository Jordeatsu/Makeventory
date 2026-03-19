import axios from 'axios';

const api = axios.create({
    baseURL:         '/api',
    withCredentials: true, // send the HttpOnly cookie on every request
});

export default api;
