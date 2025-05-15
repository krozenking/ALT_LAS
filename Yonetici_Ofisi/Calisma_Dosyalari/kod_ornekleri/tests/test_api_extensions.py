#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
API Genişletmeleri Birim Testleri

Bu modül, API Genişletmeleri için birim testleri içerir.
"""

import unittest
import sys
import os
import json
from unittest.mock import patch, MagicMock

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test edilecek modülü içe aktar
import api_extensions
from api_extensions import app

class TestAPIExtensions(unittest.TestCase):
    """API Genişletmeleri için birim testleri."""
    
    def setUp(self):
        """Her test öncesinde çalışacak kurulum."""
        # Flask test istemcisi oluştur
        self.app = app.test_client()
        self.app.testing = True
        
        # Mock İş Yükü Dağıtıcı
        self.mock_distributor = MagicMock()
        
        # Örnek görevler
        self.tasks = [
            {'id': 'task-1', 'type': 'image_segmentation', 'text': 'Sample input 1'},
            {'id': 'task-2', 'type': 'text_generation', 'text': 'Sample input 2'},
            {'id': 'task-3', 'type': 'object_detection', 'text': 'Sample input 3'}
        ]
        
    def test_predict_endpoint(self):
        """predict endpoint'ini test et."""
        # Mock İş Yükü Dağıtıcı'yı ayarla
        api_extensions.distributor = self.mock_distributor
        self.mock_distributor.distribute_task.return_value = {
            'task_id': 'task-1',
            'gpu_id': 0,
            'status': 'running'
        }
        
        # İstek gönder
        response = self.app.post(
            '/api/v1/predict',
            data=json.dumps({
                'text': 'Sample input text',
                'max_length': 128,
                'temperature': 0.7,
                'gpu_options': {
                    'strategy': 'round_robin',
                    'specific_gpu_id': None,
                    'batch_split': True
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['task_id'], 'task-1')
        self.assertEqual(data['gpu_id'], 0)
        self.assertEqual(data['status'], 'running')
        
        # İş Yükü Dağıtıcı'nın çağrıldığını doğrula
        self.mock_distributor.distribute_task.assert_called_once()
        
    def test_predict_endpoint_no_text(self):
        """Text olmadan predict endpoint'ini test et."""
        # İstek gönder
        response = self.app.post(
            '/api/v1/predict',
            data=json.dumps({
                'max_length': 128,
                'temperature': 0.7
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    def test_predict_endpoint_no_data(self):
        """Veri olmadan predict endpoint'ini test et."""
        # İstek gönder
        response = self.app.post(
            '/api/v1/predict',
            data='',
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    def test_batch_predict_endpoint(self):
        """batch_predict endpoint'ini test et."""
        # Mock İş Yükü Dağıtıcı'yı ayarla
        api_extensions.distributor = self.mock_distributor
        self.mock_distributor.distribute_batch.return_value = {
            'status': 'running',
            'tasks': [
                {
                    'task_id': 'task-1',
                    'gpu_id': 0,
                    'status': 'running'
                },
                {
                    'task_id': 'task-2',
                    'gpu_id': 1,
                    'status': 'running'
                }
            ]
        }
        
        # İstek gönder
        response = self.app.post(
            '/api/v1/batch_predict',
            data=json.dumps({
                'batch': [
                    {
                        'text': 'Sample input text 1',
                        'max_length': 128,
                        'temperature': 0.7
                    },
                    {
                        'text': 'Sample input text 2',
                        'max_length': 256,
                        'temperature': 0.5
                    }
                ],
                'gpu_options': {
                    'strategy': 'round_robin',
                    'batch_split': True
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'running')
        self.assertEqual(len(data['tasks']), 2)
        
        # İş Yükü Dağıtıcı'nın çağrıldığını doğrula
        self.mock_distributor.distribute_batch.assert_called_once()
        
    def test_batch_predict_endpoint_no_batch(self):
        """Batch olmadan batch_predict endpoint'ini test et."""
        # İstek gönder
        response = self.app.post(
            '/api/v1/batch_predict',
            data=json.dumps({
                'gpu_options': {
                    'strategy': 'round_robin',
                    'batch_split': True
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    def test_batch_predict_endpoint_empty_batch(self):
        """Boş batch ile batch_predict endpoint'ini test et."""
        # İstek gönder
        response = self.app.post(
            '/api/v1/batch_predict',
            data=json.dumps({
                'batch': [],
                'gpu_options': {
                    'strategy': 'round_robin',
                    'batch_split': True
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    def test_batch_predict_endpoint_no_text(self):
        """Text olmadan batch_predict endpoint'ini test et."""
        # İstek gönder
        response = self.app.post(
            '/api/v1/batch_predict',
            data=json.dumps({
                'batch': [
                    {
                        'max_length': 128,
                        'temperature': 0.7
                    }
                ],
                'gpu_options': {
                    'strategy': 'round_robin',
                    'batch_split': True
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
    def test_get_task_endpoint(self):
        """get_task endpoint'ini test et."""
        # Mock İş Yükü Dağıtıcı'yı ayarla
        api_extensions.distributor = self.mock_distributor
        self.mock_distributor.get_task_status.return_value = {
            'task_id': 'task-1',
            'gpu_id': 0,
            'status': 'completed',
            'result': {
                'text': 'Generated text response',
                'execution_time': 0.5,
                'timestamp': '2025-08-10T12:34:56.789Z'
            }
        }
        
        # İstek gönder
        response = self.app.get('/api/v1/task/task-1')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['task_id'], 'task-1')
        self.assertEqual(data['gpu_id'], 0)
        self.assertEqual(data['status'], 'completed')
        self.assertEqual(data['result']['text'], 'Generated text response')
        
        # İş Yükü Dağıtıcı'nın çağrıldığını doğrula
        self.mock_distributor.get_task_status.assert_called_once_with('task-1')
        
    def test_get_task_endpoint_not_found(self):
        """Var olmayan görev için get_task endpoint'ini test et."""
        # Mock İş Yükü Dağıtıcı'yı ayarla
        api_extensions.distributor = self.mock_distributor
        self.mock_distributor.get_task_status.return_value = None
        
        # İstek gönder
        response = self.app.get('/api/v1/task/non-existent-task')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
        # İş Yükü Dağıtıcı'nın çağrıldığını doğrula
        self.mock_distributor.get_task_status.assert_called_once_with('non-existent-task')
        
    def test_get_all_tasks_endpoint(self):
        """get_all_tasks endpoint'ini test et."""
        # Mock İş Yükü Dağıtıcı'yı ayarla
        api_extensions.distributor = self.mock_distributor
        self.mock_distributor.get_all_task_statuses.return_value = {
            'task-1': {
                'task_id': 'task-1',
                'gpu_id': 0,
                'status': 'completed',
                'result': {
                    'text': 'Generated text response 1',
                    'execution_time': 0.5,
                    'timestamp': '2025-08-10T12:34:56.789Z'
                }
            },
            'task-2': {
                'task_id': 'task-2',
                'gpu_id': 1,
                'status': 'running'
            }
        }
        
        # İstek gönder
        response = self.app.get('/api/v1/tasks')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['tasks']), 2)
        self.assertEqual(data['tasks']['task-1']['status'], 'completed')
        self.assertEqual(data['tasks']['task-2']['status'], 'running')
        
        # İş Yükü Dağıtıcı'nın çağrıldığını doğrula
        self.mock_distributor.get_all_task_statuses.assert_called_once()
        
    def test_get_gpus_endpoint(self):
        """get_gpus endpoint'ini test et."""
        # Mock İş Yükü Dağıtıcı'yı ayarla
        api_extensions.distributor = self.mock_distributor
        self.mock_distributor.get_gpu_status.return_value = {
            'gpus': [
                {
                    'id': 0,
                    'name': 'NVIDIA A100',
                    'utilization': 30,
                    'memory_used': 4000,
                    'memory_total': 16000,
                    'task_count': 2
                },
                {
                    'id': 1,
                    'name': 'NVIDIA A100',
                    'utilization': 70,
                    'memory_used': 8000,
                    'memory_total': 16000,
                    'task_count': 3
                }
            ]
        }
        
        # İstek gönder
        response = self.app.get('/api/v1/gpus')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['gpus']), 2)
        self.assertEqual(data['gpus'][0]['id'], 0)
        self.assertEqual(data['gpus'][0]['name'], 'NVIDIA A100')
        self.assertEqual(data['gpus'][0]['task_count'], 2)
        self.assertEqual(data['gpus'][1]['id'], 1)
        self.assertEqual(data['gpus'][1]['name'], 'NVIDIA A100')
        self.assertEqual(data['gpus'][1]['task_count'], 3)
        
        # İş Yükü Dağıtıcı'nın çağrıldığını doğrula
        self.mock_distributor.get_gpu_status.assert_called_once()


if __name__ == '__main__':
    unittest.main()
