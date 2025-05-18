// src/models/user.js
// Mock user data
const users = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    password: 'admin123', // In a real app, this would be hashed
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    password: 'manager123',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  },
  {
    id: 'user-3',
    username: 'user',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    password: 'user123',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z'
  }
];

module.exports = { users };
