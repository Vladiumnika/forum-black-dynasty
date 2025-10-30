// Set your backend base URL here when deployed, e.g.:
// window.API_BASE = 'https://your-api.onrender.com';
window.API_BASE = window.API_BASE || '';
window.api = function(path) { return (window.API_BASE || '') + path; };
