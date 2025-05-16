# api_extensions.py
import time
import logging
from flask import Blueprint, request, jsonify

# Logger oluştur
logger = logging.getLogger('api_extensions')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Blueprint oluştur
gpu_api = Blueprint('gpu_api', __name__)

# GPU Havuzu Yöneticisi, Strateji Seçici ve İş Yükü Dağıtıcı örnekleri
gpu_manager = None
strategy_selector = None
workload_distributor = None

def init_gpu_api(app, config):
    """GPU API'sini başlat."""
    global gpu_manager, strategy_selector, workload_distributor

    # GPU Havuzu Yöneticisi oluştur
    from gpu_pool_manager import NVMLGPUPoolManager
    gpu_manager = NVMLGPUPoolManager(config['gpu'])

    # Strateji Seçici oluştur
    from gpu_selection_strategy import StrategySelector
    strategy_selector = StrategySelector(config['gpu'])

    # İş Yükü Dağıtıcı oluştur
    from workload_distributor import WorkloadDistributor
    workload_distributor = WorkloadDistributor(gpu_manager, strategy_selector, config['gpu'])

    # Blueprint'i kaydet
    app.register_blueprint(gpu_api, url_prefix='/api/v1')

    logger.info("GPU API başlatıldı")

@gpu_api.route('/gpus', methods=['GET'])
def get_gpus():
    """Tüm GPU'ların bilgilerini döndür."""
    gpus = []

    for gpu_id in gpu_manager.gpus:
        gpu_info = gpu_manager.gpus[gpu_id]
        gpus.append({
            'id': gpu_id,
            'name': gpu_info.name,
            'memory_total': gpu_info.memory_total,
            'memory_used': gpu_info.memory_used,
            'memory_free': gpu_info.memory_free,
            'utilization': gpu_info.utilization,
            'temperature': gpu_info.temperature,
            'status': gpu_info.status,
            'task_count': len(gpu_info.processes)
        })

    return jsonify({'gpus': gpus})

@gpu_api.route('/gpus/<int:gpu_id>', methods=['GET'])
def get_gpu(gpu_id):
    """Belirli bir GPU'nun bilgilerini döndür."""
    try:
        gpu_info = gpu_manager.get_gpu_info(gpu_id)
        return jsonify(gpu_info.to_dict())
    except ValueError as e:
        return jsonify({'error': str(e)}), 404

@gpu_api.route('/predict', methods=['POST'])
def predict():
    """Metin tahmin isteği gönder ve bir GPU'da çalıştır."""
    data = request.json

    # Gerekli parametreleri kontrol et
    if 'text' not in data:
        return jsonify({'error': 'text parametresi gerekli'}), 400

    # Görev parametrelerini oluştur
    params = {
        'text': data['text'],
        'max_length': data.get('max_length', 128),
        'temperature': data.get('temperature', 0.7),
        'duration': data.get('duration', 1.0)  # Simülasyon için görev süresi
    }

    # Görev oluştur
    task_id = workload_distributor.create_task('text_generation', params, data.get('priority', 'normal'))

    # GPU seçim stratejisi
    gpu_options = data.get('gpu_options', {})
    strategy = gpu_options.get('strategy', None)
    gpu_id = gpu_options.get('gpu_id', None)

    # Görevi dağıt
    if gpu_id is not None:
        # Belirli bir GPU'da çalıştır
        try:
            gpu_id = workload_distributor.distribute_task_to_gpu(task_id, gpu_id)
            return jsonify({
                'task_id': task_id,
                'gpu_id': gpu_id,
                'status': 'QUEUED'
            })
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    else:
        # Strateji kullanarak GPU seç
        gpu_id = workload_distributor.distribute_task(task_id, strategy)

        if gpu_id is None:
            return jsonify({
                'task_id': task_id,
                'status': 'QUEUED',
                'message': 'Görev kuyruğa eklendi, ancak şu anda kullanılabilir GPU yok'
            })

        return jsonify({
            'task_id': task_id,
            'gpu_id': gpu_id,
            'status': 'QUEUED'
        })

@gpu_api.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Toplu metin tahmin isteği gönder ve bir veya daha fazla GPU'da çalıştır."""
    data = request.json

    # Gerekli parametreleri kontrol et
    if 'texts' not in data or not isinstance(data['texts'], list):
        return jsonify({'error': 'texts parametresi gerekli ve bir liste olmalı'}), 400

    # Görev parametrelerini oluştur
    params_list = []
    for text in data['texts']:
        params = {
            'text': text,
            'max_length': data.get('max_length', 128),
            'temperature': data.get('temperature', 0.7),
            'duration': data.get('duration', 1.0)  # Simülasyon için görev süresi
        }
        params_list.append(params)

    # Batch oluştur
    batch_id = workload_distributor.create_batch('text_generation', params_list, data.get('priority', 'normal'))

    # Batch durumunu al
    batch = workload_distributor.get_batch_status(batch_id)

    return jsonify({
        'batch_id': batch_id,
        'task_ids': batch['task_ids'],
        'status': batch['status']
    })

@gpu_api.route('/tasks', methods=['GET'])
def get_tasks():
    """Tüm görevlerin durumlarını döndür."""
    tasks = workload_distributor.get_all_tasks()
    return jsonify({'tasks': tasks})

@gpu_api.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    """Belirli bir görevin durumunu döndür."""
    task = workload_distributor.get_task_status(task_id)

    if task is None:
        return jsonify({'error': f'Görev {task_id} bulunamadı'}), 404

    return jsonify(task)

@gpu_api.route('/tasks/<task_id>', methods=['DELETE'])
def cancel_task(task_id):
    """Belirli bir görevi iptal et."""
    result = workload_distributor.cancel_task(task_id)

    if not result:
        return jsonify({'error': f'Görev {task_id} iptal edilemedi'}), 400

    return jsonify({
        'success': True,
        'message': f'Görev {task_id} iptal edildi'
    })

@gpu_api.route('/batches', methods=['GET'])
def get_batches():
    """Tüm batch'lerin durumlarını döndür."""
    batches = workload_distributor.get_all_batches()
    return jsonify({'batches': batches})

@gpu_api.route('/batches/<batch_id>', methods=['GET'])
def get_batch(batch_id):
    """Belirli bir batch'in durumunu döndür."""
    batch = workload_distributor.get_batch_status(batch_id)

    if batch is None:
        return jsonify({'error': f'Batch {batch_id} bulunamadı'}), 404

    return jsonify(batch)

@gpu_api.route('/batches/<batch_id>', methods=['DELETE'])
def cancel_batch(batch_id):
    """Belirli bir batch'i iptal et."""
    result = workload_distributor.cancel_batch(batch_id)

    if not result:
        return jsonify({'error': f'Batch {batch_id} iptal edilemedi'}), 400

    return jsonify({
        'success': True,
        'message': f'Batch {batch_id} iptal edildi'
    })
