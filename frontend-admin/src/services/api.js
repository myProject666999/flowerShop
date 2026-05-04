import request from '../utils/request'

export const merchantApi = {
  login: (data) => request.post('/merchant/login', data),
  getProfile: () => request.get('/merchant/profile'),
  updateProfile: (data) => request.put('/merchant/profile', data),
  updatePassword: (data) => request.put('/merchant/password', data),
}

export const adminApi = {
  login: (data) => request.post('/admin/login', data),
  getProfile: () => request.get('/admin/profile'),
  updateProfile: (data) => request.put('/admin/profile', data),
  updatePassword: (data) => request.put('/admin/password', data),
  getStats: () => request.get('/admin/stats'),
}

export const flowerApi = {
  getList: (params) => request.get('/admin/flowers', { params }),
  getDetail: (id) => request.get(`/admin/flowers/${id}`),
  create: (data) => request.post('/admin/flowers', data),
  update: (id, data) => request.put(`/admin/flowers/${id}`, data),
  delete: (id) => request.delete(`/admin/flowers/${id}`),
}

export const merchantFlowerApi = {
  getList: (params) => request.get('/merchant/flowers', { params }),
  getDetail: (id) => request.get(`/merchant/flowers/${id}`),
  create: (data) => request.post('/merchant/flowers', data),
  update: (id, data) => request.put(`/merchant/flowers/${id}`, data),
  delete: (id) => request.delete(`/merchant/flowers/${id}`),
}

export const categoryApi = {
  getList: (params) => request.get('/admin/categories', { params }),
  getAll: () => request.get('/categories'),
  getDetail: (id) => request.get(`/admin/categories/${id}`),
  create: (data) => request.post('/admin/categories', data),
  update: (id, data) => request.put(`/admin/categories/${id}`, data),
  delete: (id) => request.delete(`/admin/categories/${id}`),
}

export const orderApi = {
  getList: (params) => request.get('/admin/orders', { params }),
  getDetail: (id) => request.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => request.put(`/admin/orders/${id}/status`, data),
}

export const merchantOrderApi = {
  getList: (params) => request.get('/merchant/orders', { params }),
  getDetail: (id) => request.get(`/merchant/orders/${id}`),
  ship: (id) => request.post(`/merchant/orders/${id}/ship`),
}

export const userAdminApi = {
  getList: (params) => request.get('/admin/users', { params }),
  getDetail: (id) => request.get(`/admin/users/${id}`),
  create: (data) => request.post('/admin/users', data),
  update: (id, data) => request.put(`/admin/users/${id}`, data),
  delete: (id) => request.delete(`/admin/users/${id}`),
  updateStatus: (id, data) => request.put(`/admin/users/${id}/status`, data),
}

export const announcementApi = {
  getList: (params) => request.get('/admin/announcements', { params }),
  getDetail: (id) => request.get(`/admin/announcements/${id}`),
  create: (data) => request.post('/admin/announcements', data),
  update: (id, data) => request.put(`/admin/announcements/${id}`, data),
  delete: (id) => request.delete(`/admin/announcements/${id}`),
}

export const bannerApi = {
  getList: (params) => request.get('/admin/banners', { params }),
  getDetail: (id) => request.get(`/admin/banners/${id}`),
  create: (data) => request.post('/admin/banners', data),
  update: (id, data) => request.put(`/admin/banners/${id}`, data),
  delete: (id) => request.delete(`/admin/banners/${id}`),
}

export const logApi = {
  getList: (params) => request.get('/admin/logs', { params }),
}
