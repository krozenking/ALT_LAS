#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
API Genişletmeleri

Bu modül, ALT_LAS sisteminde çoklu GPU desteği için API genişletmelerini içerir.
Flask tabanlı bir API örneği sunmaktadır.

Kullanım:
    python api_extensions.py
"""

import os
import json
import logging
import time
import uuid
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask uygulaması
app = Flask(__name__)

# Bu örnekte, gerçek GPU Havuzu Yöneticisi, Strateji Seçici ve İş Yükü Dağıtıcı
# yerine mock nesneler kullanıyoruz
class MockWorkloadDistributor:
    def __init__(self):
        self.tasks = {}
        self.gpu_mapping = {0: [], 1: []}
        
    def distribute_task(self, task):
        task_id = task.get('id', str(uuid.uuid4()))
        task['id'] = task_id
        
        # GPU seçim stratejisi
        strategy = task.get('gpu_options', {}).get('strategy', 'least_loaded')
        specific_gpu = task.get('gpu_options', {}).get('specific_gpu_id')
        
        # GPU seç
        if specific_gpu is not None and specific_gpu in [0, 1]:
            selected_gpu = specific_gpu
        elif strategy == 'round_robin':
            # Basit round-robin: task_id'nin hash'ine göre
            selected_gpu = hash(task_id) % 2
        else:  # least_loaded veya diğerleri
            # En az yüklü GPU'yu seç
            if len(self.gpu_mapping[0]) <= len(self.gpu_mapping[1]):
                selected_gpu = 0
            else:
                selected_gpu = 1
                
        # Görevi kaydet ve GPU'ya ata
        self.tasks[task_id] = task
        self.gpu_mapping[selected_gpu].append(task_id)
        
        return {
            'task_id': task_id,
            'gpu_id': selected_gpu,
            'status': 'running'
        }
        
    def distribute_batch(self, batch_tasks, split_batch=True):
        results = {
            'status': 'running',
            'tasks': []
        }
        
        if not split_batch:
            # Tüm batch'i aynı GPU'ya gönder
            # İlk görev için GPU seç
            first_result = self.distribute_task(batch_tasks[0])
            selected_gpu = first_result['gpu_id']
            
            results['tasks'].append(first_result)
            
            # Diğer görevleri de aynı GPU'ya gönder
            for task in batch_tasks[1:]:
                task['gpu_options'] = {'specific_gpu_id': selected_gpu}
                result = self.distribute_task(task)
                results['tasks'].append(result)
        else:
            # Görevleri farklı GPU'lara dağıt
            for task in batch_tasks:
                result = self.distribute_task(task)
                results['tasks'].append(result)
                
        return results
        
    def get_task_status(self, task_id):
        if task_id not in self.tasks:
            return None
            
        # GPU'yu bul
        gpu_id = None
        for gpu, tasks in self.gpu_mapping.items():
            if task_id in tasks:
                gpu_id = gpu
                break
                
        return {
            'task_id': task_id,
            'gpu_id': gpu_id,
            'status': 'completed',  # Bu örnekte tüm görevler hemen tamamlanıyor
            'result': {
                'execution_time': 0.1,
                'timestamp': time.time()
            }
        }
        
    def get_all_task_statuses(self):
        return {
            task_id: self.get_task_status(task_id)
            for task_id in self.tasks
        }
        
    def get_gpu_status(self):
        return {
            'gpus': [
                {
                    'id': 0,
                    'name': 'NVIDIA A100',
                    'utilization': 30,
                    'memory_used': 4000,
                    'memory_total': 16000,
                    'task_count': len(self.gpu_mapping[0])
                },
                {
                    'id': 1,
                    'name': 'NVIDIA A100',
                    'utilization': 70,
                    'memory_used': 8000,
                    'memory_total': 16000,
                    'task_count': len(self.gpu_mapping[1])
                }
            ]
        }

# Mock İş Yükü Dağıtıcı örneği
distributor = MockWorkloadDistributor()

# API endpoint'leri
@app.route('/api/v1/predict', methods=['POST'])
def predict():
    """
    Tahmin API endpoint'i.
    
    Örnek istek:
    ```json
    {
      "text": "Sample input text",
      "max_length": 128,
      "temperature": 0.7,
      "gpu_options": {
        "strategy": "round_robin",
        "specific_gpu_id": null,
        "batch_split": true
      }
    }
    ```
    
    Örnek yanıt:
    ```json
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "gpu_id": 0,
      "status": "running"
    }
    ```
    """
    try:
        data = request.json
        
        # Temel doğrulama
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        if 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        # Görevi oluştur
        task = {
            'id': str(uuid.uuid4()),
            'type': 'text_generation',
            'text': data['text'],
            'max_length': data.get('max_length', 128),
            'temperature': data.get('temperature', 0.7),
            'gpu_options': data.get('gpu_options', {})
        }
        
        # Görevi dağıt
        result = distributor.distribute_task(task)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/batch_predict', methods=['POST'])
def batch_predict():
    """
    Batch tahmin API endpoint'i.
    
    Örnek istek:
    ```json
    {
      "batch": [
        {
          "text": "Sample input text 1",
          "max_length": 128,
          "temperature": 0.7
        },
        {
          "text": "Sample input text 2",
          "max_length": 256,
          "temperature": 0.5
        }
      ],
      "gpu_options": {
        "strategy": "round_robin",
        "batch_split": true
      }
    }
    ```
    
    Örnek yanıt:
    ```json
    {
      "status": "running",
      "tasks": [
        {
          "task_id": "123e4567-e89b-12d3-a456-426614174000",
          "gpu_id": 0,
          "status": "running"
        },
        {
          "task_id": "223e4567-e89b-12d3-a456-426614174000",
          "gpu_id": 1,
          "status": "running"
        }
      ]
    }
    ```
    """
    try:
        data = request.json
        
        # Temel doğrulama
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        if 'batch' not in data or not isinstance(data['batch'], list):
            return jsonify({'error': 'No batch provided or batch is not a list'}), 400
            
        if not data['batch']:
            return jsonify({'error': 'Batch is empty'}), 400
            
        # Görevleri oluştur
        batch_tasks = []
        for item in data['batch']:
            if 'text' not in item:
                return jsonify({'error': 'Text not provided for all batch items'}), 400
                
            task = {
                'id': str(uuid.uuid4()),
                'type': 'text_generation',
                'text': item['text'],
                'max_length': item.get('max_length', 128),
                'temperature': item.get('temperature', 0.7)
            }
            
            # GPU seçeneklerini ekle
            if 'gpu_options' in data:
                task['gpu_options'] = data['gpu_options']
                
            batch_tasks.append(task)
            
        # Batch'i dağıt
        split_batch = data.get('gpu_options', {}).get('batch_split', True)
        result = distributor.distribute_batch(batch_tasks, split_batch)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in batch_predict endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/task/<task_id>', methods=['GET'])
def get_task(task_id):
    """
    Görev durumu API endpoint'i.
    
    Örnek yanıt:
    ```json
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "gpu_id": 0,
      "status": "completed",
      "result": {
        "text": "Generated text response",
        "execution_time": 0.5,
        "timestamp": "2025-08-10T12:34:56.789Z"
      }
    }
    ```
    """
    try:
        task_status = distributor.get_task_status(task_id)
        
        if task_status is None:
            return jsonify({'error': 'Task not found'}), 404
            
        return jsonify(task_status)
    except Exception as e:
        logger.error(f"Error in get_task endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/tasks', methods=['GET'])
def get_all_tasks():
    """
    Tüm görevlerin durumu API endpoint'i.
    
    Örnek yanıt:
    ```json
    {
      "tasks": {
        "123e4567-e89b-12d3-a456-426614174000": {
          "task_id": "123e4567-e89b-12d3-a456-426614174000",
          "gpu_id": 0,
          "status": "completed",
          "result": {
            "text": "Generated text response",
            "execution_time": 0.5,
            "timestamp": "2025-08-10T12:34:56.789Z"
          }
        },
        "223e4567-e89b-12d3-a456-426614174000": {
          "task_id": "223e4567-e89b-12d3-a456-426614174000",
          "gpu_id": 1,
          "status": "running"
        }
      }
    }
    ```
    """
    try:
        task_statuses = distributor.get_all_task_statuses()
        return jsonify({'tasks': task_statuses})
    except Exception as e:
        logger.error(f"Error in get_all_tasks endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/gpus', methods=['GET'])
def get_gpus():
    """
    GPU durumu API endpoint'i.
    
    Örnek yanıt:
    ```json
    {
      "gpus": [
        {
          "id": 0,
          "name": "NVIDIA A100",
          "utilization": 30,
          "memory_used": 4000,
          "memory_total": 16000,
          "task_count": 2
        },
        {
          "id": 1,
          "name": "NVIDIA A100",
          "utilization": 70,
          "memory_used": 8000,
          "memory_total": 16000,
          "task_count": 3
        }
      ]
    }
    ```
    """
    try:
        gpu_status = distributor.get_gpu_status()
        return jsonify(gpu_status)
    except Exception as e:
        logger.error(f"Error in get_gpus endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # API sunucusunu başlat
    app.run(host='0.0.0.0', port=5000, debug=True)
