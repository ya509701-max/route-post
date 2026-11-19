const BASE = 'https://route-posts.routemisr.com';

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form; // FormData: browser sets the boundary itself
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errs = Array.isArray(json.errors) ? json.errors : [json.errors];
    const msg = [...new Set([json.message, ...errs].filter(Boolean))].join(' - ');
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return json;
}

// Responses may nest data differently, so find the first array inside data.
export function pickList(json) {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d;
  const arr = Object.values(d || {}).find(Array.isArray);
  return arr || [];
}
const fd = (obj) => { const f = new FormData(); Object.entries(obj).forEach(([k, v]) => v != null && v !== '' && f.append(k, v)); return f; };
const qs = (o) => '?' + new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString();

export const api = {
  signup: (b) => request('/users/signup', { method: 'POST', body: b }),
  signin: (b) => request('/users/signin', { method: 'POST', body: b }),
  changePassword: (b) => request('/users/change-password', { method: 'PATCH', body: b }),
  uploadPhoto: (file) => request('/users/upload-photo', { method: 'PUT', form: fd({ photo: file }) }),
  myProfile: () => request('/users/profile-data'),
  myPosts: () => request('/posts/feed?only=me&limit=50'),
  userProfile: (id) => request(`/users/${id}/profile`),
  suggestions: (page = 1, limit = 10) => request(`/users/suggestions${qs({ page, limit })}`),
  bookmarks: () => request('/users/bookmarks'),
  follow: (id) => request(`/users/${id}/follow`, { method: 'PUT' }),

  allPosts: () => request('/posts'),
  feed: (only, page = 1, limit = 10) => request(`/posts/feed${qs({ only, page, limit })}`),
  getPost: (id) => request(`/posts/${id}`),
  createPost: (body, image) => request('/posts', { method: 'POST', form: fd({ body, image }) }),
  updatePost: (id, body, image) => request(`/posts/${id}`, { method: 'PUT', form: fd({ body, image }) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => request(`/posts/${id}/like`, { method: 'PUT' }),
  bookmarkPost: (id) => request(`/posts/${id}/bookmark`, { method: 'PUT' }),
  sharePost: (id, body) => request(`/posts/${id}/share`, { method: 'POST', body: { body } }),

  comments: (id, page = 1, limit = 20) => request(`/posts/${id}/comments${qs({ page, limit })}`),
  addComment: (id, content, image) => request(`/posts/${id}/comments`, { method: 'POST', form: fd({ content, image }) }),
  replies: (id, cid, page = 1, limit = 10) => request(`/posts/${id}/comments/${cid}/replies${qs({ page, limit })}`),
  addReply: (id, cid, content, image) => request(`/posts/${id}/comments/${cid}/replies`, { method: 'POST', form: fd({ content, image }) }),
  updateComment: (id, cid, content, image) => request(`/posts/${id}/comments/${cid}`, { method: 'PUT', form: fd({ content, image }) }),
  deleteComment: (id, cid) => request(`/posts/${id}/comments/${cid}`, { method: 'DELETE' }),
  likeComment: (id, cid) => request(`/posts/${id}/comments/${cid}/like`, { method: 'PUT' }),

  notifications: (page = 1, limit = 10, unread = false) => request(`/notifications?unread=${unread}&page=${page}&limit=${limit}`),
  unreadCount: () => request('/notifications/unread-count'),
  readOne: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  readAll: () => request('/notifications/read-all', { method: 'PATCH' }),
};
