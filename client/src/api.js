const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const text = await res.text();
  if (!text) throw new Error('No response from server');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Server unavailable'); }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const api = {
  // Auth
  login: (body) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  register: (body) => fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () => fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  // Destinations
  getDestinations: () => fetch(`${API_BASE}/destinations`, { headers: getHeaders() }).then(handleResponse),
  getDestination: (slug) => fetch(`${API_BASE}/destinations/${slug}`, { headers: getHeaders() }).then(handleResponse),

  // Hotels
  getHotels: (params = '') => fetch(`${API_BASE}/hotels${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getHotel: (slug) => fetch(`${API_BASE}/hotels/${slug}`, { headers: getHeaders() }).then(handleResponse),
  getHotelsByDestination: (slug) => fetch(`${API_BASE}/hotels/destination/${slug}`, { headers: getHeaders() }).then(handleResponse),

  // Bookings
  createBooking: (body) => fetch(`${API_BASE}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMyBookings: () => fetch(`${API_BASE}/bookings/my`, { headers: getHeaders() }).then(handleResponse),
  getBooking: (id) => fetch(`${API_BASE}/bookings/${id}`, { headers: getHeaders() }).then(handleResponse),

  // Admin
  getDashboard: () => fetch(`${API_BASE}/admin/dashboard`, { headers: getHeaders() }).then(handleResponse),
  adminGetDestinations: () => fetch(`${API_BASE}/admin/destinations`, { headers: getHeaders() }).then(handleResponse),
  adminCreateDestination: (body) => fetch(`${API_BASE}/admin/destinations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateDestination: (id, body) => fetch(`${API_BASE}/admin/destinations/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteDestination: (id) => fetch(`${API_BASE}/admin/destinations/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  adminGetHotels: () => fetch(`${API_BASE}/admin/hotels`, { headers: getHeaders() }).then(handleResponse),
  adminCreateHotel: (body) => fetch(`${API_BASE}/admin/hotels`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateHotel: (id, body) => fetch(`${API_BASE}/admin/hotels/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteHotel: (id) => fetch(`${API_BASE}/admin/hotels/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  adminGetBookings: (params = '') => fetch(`${API_BASE}/admin/bookings${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  adminUpdateBooking: (id, body) => fetch(`${API_BASE}/admin/bookings/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminGetUsers: () => fetch(`${API_BASE}/admin/users`, { headers: getHeaders() }).then(handleResponse),

  // Upload
  uploadImage: (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    }).then(handleResponse);
  },

  // Tour Packages
  getPackages: (params = '') => fetch(`${API_BASE}/packages${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getPackage: (slug) => fetch(`${API_BASE}/packages/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetPackages: () => fetch(`${API_BASE}/packages/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreatePackage: (body) => fetch(`${API_BASE}/packages/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdatePackage: (id, body) => fetch(`${API_BASE}/packages/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeletePackage: (id) => fetch(`${API_BASE}/packages/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Treks
  getTreks: (params = '') => fetch(`${API_BASE}/treks${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getTrek: (slug) => fetch(`${API_BASE}/treks/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetTreks: () => fetch(`${API_BASE}/treks/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateTrek: (body) => fetch(`${API_BASE}/treks/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateTrek: (id, body) => fetch(`${API_BASE}/treks/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteTrek: (id) => fetch(`${API_BASE}/treks/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Activities
  getActivities: (params = '') => fetch(`${API_BASE}/activities${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getActivity: (slug) => fetch(`${API_BASE}/activities/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetActivities: () => fetch(`${API_BASE}/activities/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateActivity: (body) => fetch(`${API_BASE}/activities/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateActivity: (id, body) => fetch(`${API_BASE}/activities/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteActivity: (id) => fetch(`${API_BASE}/activities/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Rental Services
  getRentals: (params = '') => fetch(`${API_BASE}/rentals${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getRental: (slug) => fetch(`${API_BASE}/rentals/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetRentals: () => fetch(`${API_BASE}/rentals/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateRental: (body) => fetch(`${API_BASE}/rentals/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateRental: (id, body) => fetch(`${API_BASE}/rentals/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteRental: (id) => fetch(`${API_BASE}/rentals/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Enquiries
  createEnquiry: (body) => fetch(`${API_BASE}/enquiries`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminGetEnquiries: (params = '') => fetch(`${API_BASE}/enquiries/admin/all${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  adminUpdateEnquiry: (id, body) => fetch(`${API_BASE}/enquiries/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteEnquiry: (id) => fetch(`${API_BASE}/enquiries/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Homestays
  getHomestays: (params = '') => fetch(`${API_BASE}/homestays${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getHomestay: (slug) => fetch(`${API_BASE}/homestays/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetHomestays: () => fetch(`${API_BASE}/homestays/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateHomestay: (body) => fetch(`${API_BASE}/homestays/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateHomestay: (id, body) => fetch(`${API_BASE}/homestays/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteHomestay: (id) => fetch(`${API_BASE}/homestays/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Houseboats
  getHouseboats: (params = '') => fetch(`${API_BASE}/houseboats${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getHouseboat: (slug) => fetch(`${API_BASE}/houseboats/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetHouseboats: () => fetch(`${API_BASE}/houseboats/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateHouseboat: (body) => fetch(`${API_BASE}/houseboats/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateHouseboat: (id, body) => fetch(`${API_BASE}/houseboats/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteHouseboat: (id) => fetch(`${API_BASE}/houseboats/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Articles
  getArticles: (params = '') => fetch(`${API_BASE}/articles${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getArticle: (slug) => fetch(`${API_BASE}/articles/${slug}`, { headers: getHeaders() }).then(handleResponse),
  likeArticle: (slug) => fetch(`${API_BASE}/articles/${slug}/like`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  adminGetArticles: () => fetch(`${API_BASE}/articles/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateArticle: (body) => fetch(`${API_BASE}/articles/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateArticle: (id, body) => fetch(`${API_BASE}/articles/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteArticle: (id) => fetch(`${API_BASE}/articles/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Books
  getBooks: (params = '') => fetch(`${API_BASE}/books${params ? '?' + params : ''}`).then(handleResponse),
  getBook: (slug) => fetch(`${API_BASE}/books/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetBooks: () => fetch(`${API_BASE}/books/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateBook: (body) => fetch(`${API_BASE}/books/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateBook: (id, body) => fetch(`${API_BASE}/books/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteBook: (id) => fetch(`${API_BASE}/books/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Ladakh Route Catalogue
  getRoutes: (params = '') => fetch(`${API_BASE}/routes${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  getRoute: (slug) => fetch(`${API_BASE}/routes/${slug}`, { headers: getHeaders() }).then(handleResponse),
  adminGetRoutes: () => fetch(`${API_BASE}/routes/admin/all`, { headers: getHeaders() }).then(handleResponse),
  adminCreateRoute: (body) => fetch(`${API_BASE}/routes/admin/create`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminUpdateRoute: (id, body) => fetch(`${API_BASE}/routes/admin/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  adminDeleteRoute: (id) => fetch(`${API_BASE}/routes/admin/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  adminSeedRoutes: () => fetch(`${API_BASE}/routes/admin/seed`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  // Site Settings (WhatsApp + contact info shown to all visitors)
  getSettings: () => fetch(`${API_BASE}/settings`, { headers: getHeaders() }).then(handleResponse),
  adminUpdateSettings: (body) => fetch(`${API_BASE}/settings`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
};

export default api;
