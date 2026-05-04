import request from '../utils/request'

export const userApi = {
  register: (data) => request.post('/user/register', data),
  login: (data) => request.post('/user/login', data),
  getProfile: () => request.get('/user/profile'),
  updateProfile: (data) => request.put('/user/profile', data),
  updatePassword: (data) => request.put('/user/password', data),
}

export const flowerApi = {
  getList: (params) => request.get('/flowers', { params }),
  getDetail: (id) => request.get(`/flowers/${id}`),
  getCategories: () => request.get('/categories'),
  getBanners: () => request.get('/banners'),
  getAnnouncements: () => request.get('/announcements'),
}

export const cartApi = {
  getList: () => request.get('/user/cart'),
  add: (data) => request.post('/user/cart', data),
  update: (id, data) => request.put(`/user/cart/${id}`, data),
  delete: (id) => request.delete(`/user/cart/${id}`),
  batchDelete: (data) => request.delete('/user/cart', { data }),
}

export const favoriteApi = {
  getList: (params) => request.get('/user/favorites', { params }),
  add: (data) => request.post('/user/favorites', data),
  delete: (id) => request.delete(`/user/favorites/${id}`),
  toggle: (data) => request.post('/user/favorites/toggle', data),
  check: (params) => request.get('/user/favorites/check', { params }),
}

export const addressApi = {
  getList: () => request.get('/user/addresses'),
  getDefault: () => request.get('/user/addresses/default'),
  getDetail: (id) => request.get(`/user/addresses/${id}`),
  create: (data) => request.post('/user/addresses', data),
  update: (id, data) => request.put(`/user/addresses/${id}`, data),
  delete: (id) => request.delete(`/user/addresses/${id}`),
  setDefault: (id) => request.put(`/user/addresses/${id}/default`),
}

export const orderApi = {
  getList: (params) => request.get('/user/orders', { params }),
  getDetail: (id) => request.get(`/user/orders/${id}`),
  create: (data) => request.post('/user/orders', data),
  pay: (id) => request.post(`/user/orders/${id}/pay`),
  complete: (id) => request.post(`/user/orders/${id}/complete`),
  cancel: (id) => request.post(`/user/orders/${id}/cancel`),
}
