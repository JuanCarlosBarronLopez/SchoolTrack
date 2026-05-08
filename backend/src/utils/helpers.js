import crypto from 'crypto';

export const generateCode = (prefix = '', length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};

export const formatTime = (time) => {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(`2024-01-01T${time}`));
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateETA = (distance, averageSpeed = 30) => {
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = timeInHours * 60;
  return { time: timeInMinutes, formatted: `${Math.round(timeInMinutes)} minutos` };
};

export const sanitizeString = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
};

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^\+?[\d\s\-\(\)]{10,}$/.test(phone);

export const paginate = (array, pageSize, pageNumber) => {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

export const filterByDateRange = (items, dateField, startDate, endDate) => {
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    return itemDate >= start && itemDate <= end;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (order === 'desc') return bVal > aVal ? 1 : -1;
    return aVal > bVal ? 1 : -1;
  });
};

export default {
  generateCode, formatDate, formatTime, calculateDistance, calculateETA,
  sanitizeString, validateEmail, validatePhone, paginate, filterByDateRange, groupBy, sortBy
};