// src/models/task.js
// Mock task data
const tasks = [
  {
    id: 'task-1',
    title: 'Rapor hazırlama',
    description: 'Aylık satış raporu hazırlanacak',
    status: 'pending',
    priority: 'high',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    dueDate: '2023-01-31T23:59:59Z',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Müşteri görüşmesi',
    description: 'ABC Şirketi ile yeni proje hakkında görüşme',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    dueDate: '2023-01-20T14:00:00Z',
    createdAt: '2023-01-10T09:00:00Z',
    updatedAt: '2023-01-16T11:30:00Z'
  },
  {
    id: 'task-3',
    title: 'Yazılım güncellemesi',
    description: 'Sistem yazılımının güncellenmesi',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'user-3',
    createdBy: 'user-2',
    dueDate: '2023-01-18T17:00:00Z',
    createdAt: '2023-01-12T13:00:00Z',
    updatedAt: '2023-01-17T16:45:00Z'
  }
];

module.exports = { tasks };
