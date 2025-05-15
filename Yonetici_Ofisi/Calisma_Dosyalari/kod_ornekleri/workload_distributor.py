#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
İş Yükü Dağıtıcı

Bu modül, ALT_LAS sisteminde iş yüklerini GPU'lar arasında dağıtan
İş Yükü Dağıtıcı sınıfını içerir. Çoklu GPU desteği için temel bileşendir.

Kullanım:
    from workload_distributor import WorkloadDistributor
    from gpu_pool_manager import NVMLGPUPoolManager
    from gpu_selection_strategy import StrategySelector

    # Bileşenleri yapılandırma ile başlat
    config = {...}

    # GPU Havuzu Yöneticisi ve Strateji Seçiciyi oluştur
    gpu_manager = NVMLGPUPoolManager(config)
    strategy_selector = StrategySelector(config)

    # İş Yükü Dağıtıcıyı oluştur
    distributor = WorkloadDistributor(gpu_manager, strategy_selector, config)

    # Görevi dağıt
    task = {'id': 'task-123', 'type': 'image_segmentation', 'batch_size': 4}
    gpu_id = distributor.distribute_task(task)

    # Batch görevleri dağıt
    batch_tasks = [task1, task2, task3, task4]
    results = distributor.distribute_batch(batch_tasks)
"""

import logging
import threading
import time
import uuid
from typing import Dict, List, Any, Optional, Tuple
from queue import Queue, PriorityQueue
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """Görev durumunu temsil eden enum."""
    PENDING = "pending"
    QUEUED = "queued"
    ASSIGNED = "assigned"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"


@dataclass(order=True)
class PrioritizedTask:
    """Önceliklendirilmiş görev için veri sınıfı."""
    priority: int
    timestamp: float = field(compare=False)
    task: Dict[str, Any] = field(compare=False)


class WorkloadDistributor:
    """
    İş Yükü Dağıtıcı sınıfı.

    Bu sınıf, görevleri GPU'lara dağıtmak için GPU Havuzu Yöneticisi ve
    GPU Seçim Stratejisi bileşenlerini kullanır.
    """

    def __init__(self, gpu_pool_manager, strategy_selector, config: Dict[str, Any]):
        """
        İş Yükü Dağıtıcıyı başlatır.

        Args:
            gpu_pool_manager: GPU Havuzu Yöneticisi
            strategy_selector: GPU Seçim Stratejisi Seçici
            config: Yapılandırma parametreleri içeren sözlük
        """
        self.gpu_pool_manager = gpu_pool_manager
        self.strategy_selector = strategy_selector
        self.config = config

        # Görev kuyruğu (öncelikli kuyruk)
        self.task_queue = PriorityQueue()

        # Görev durumları
        self.task_status = {}

        # Görev sonuçları
        self.task_results = {}

        # Görev-GPU eşleştirmeleri
        self.task_gpu_mapping = {}

        # Kilit
        self.lock = threading.RLock()

        # Kuyruk işleme thread'i
        self.queue_processor_thread = None
        self.stop_queue_processor = threading.Event()

        # Kuyruk işleme yapılandırması
        self.queue_processing_interval = config.get('queue_processing_interval', 1.0)  # saniye
        self.max_concurrent_tasks_per_gpu = config.get('max_concurrent_tasks_per_gpu', 4)

        # Kuyruk işleme thread'ini başlat
        self.start_queue_processor()

        logger.info("İş Yükü Dağıtıcı başlatıldı")

    def __del__(self):
        """Yıkıcı metod, kuyruk işleme thread'ini durdurur."""
        self.stop_queue_processor.set()
        if self.queue_processor_thread and self.queue_processor_thread.is_alive():
            self.queue_processor_thread.join(timeout=5)

    def start_queue_processor(self):
        """Kuyruk işleme thread'ini başlatır."""
        if self.queue_processor_thread is not None and self.queue_processor_thread.is_alive():
            logger.warning("Kuyruk işleme thread'i zaten çalışıyor")
            return

        self.stop_queue_processor.clear()
        self.queue_processor_thread = threading.Thread(
            target=self._process_queue_loop,
            daemon=True
        )
        self.queue_processor_thread.start()
        logger.info("Kuyruk işleme thread'i başlatıldı")

    def stop_queue_processor(self):
        """Kuyruk işleme thread'ini durdurur."""
        if self.queue_processor_thread is None or not self.queue_processor_thread.is_alive():
            logger.warning("Kuyruk işleme thread'i zaten durdurulmuş")
            return

        self.stop_queue_processor.set()
        self.queue_processor_thread.join(timeout=5)
        logger.info("Kuyruk işleme thread'i durduruldu")

    def _process_queue_loop(self):
        """Kuyruk işleme döngüsü."""
        while not self.stop_queue_processor.is_set():
            try:
                self._process_queue()
            except Exception as e:
                logger.error(f"Kuyruk işleme sırasında hata: {e}")

            self.stop_queue_processor.wait(self.queue_processing_interval)

    def _process_queue(self):
        """Kuyruktaki görevleri işler."""
        with self.lock:
            # Kullanılabilir GPU'ları al
            available_gpus = self.gpu_pool_manager.get_available_gpus()

            if not available_gpus:
                return

            # GPU başına çalışan görev sayısını hesapla
            gpu_task_counts = {}
            for gpu_id in available_gpus:
                gpu_task_counts[gpu_id] = 0

            for task_id, gpu_id in self.task_gpu_mapping.items():
                if gpu_id in gpu_task_counts:
                    gpu_task_counts[gpu_id] += 1

            # Kullanılabilir kapasitesi olan GPU'ları filtrele
            available_gpus_with_capacity = [
                gpu_id for gpu_id in available_gpus
                if gpu_task_counts.get(gpu_id, 0) < self.max_concurrent_tasks_per_gpu
            ]

            if not available_gpus_with_capacity:
                return

            # Kuyruktaki görevleri işle
            processed_count = 0
            while not self.task_queue.empty() and processed_count < len(available_gpus_with_capacity):
                # Kuyruktaki bir sonraki görevi al (peek)
                prioritized_task = self.task_queue.queue[0]
                task = prioritized_task.task
                task_id = task['id']

                # GPU seçim stratejisini al
                strategy_name = task.get('strategy', self.config.get('default_strategy', 'least_loaded'))
                strategy = self.strategy_selector.get_strategy(strategy_name)

                # GPU bilgilerini al
                gpu_info = self.gpu_pool_manager.get_all_gpu_info()

                # GPU seç
                selected_gpu = strategy.select_gpu(task, available_gpus_with_capacity, gpu_info)

                if selected_gpu is None:
                    # Uygun GPU bulunamadı, kuyruğu işlemeyi durdur
                    break

                # Görevi kuyruktan çıkar
                self.task_queue.get_nowait()

                # GPU'yu rezerve et
                self.gpu_pool_manager.reserve_gpu(selected_gpu, task_id)

                # Görevi GPU'ya gönder
                self._execute_task_on_gpu(task, selected_gpu)

                # Görev durumunu güncelle
                self.task_status[task_id] = TaskStatus.RUNNING
                self.task_gpu_mapping[task_id] = selected_gpu

                # İşlenen görev sayısını artır
                processed_count += 1

                # Kullanılabilir GPU'ları güncelle
                gpu_task_counts[selected_gpu] += 1
                if gpu_task_counts[selected_gpu] >= self.max_concurrent_tasks_per_gpu:
                    available_gpus_with_capacity.remove(selected_gpu)

    def _execute_task_on_gpu(self, task: Dict[str, Any], gpu_id: int):
        """
        Görevi belirli bir GPU'da yürütür.

        Args:
            task: Görev bilgilerini içeren sözlük
            gpu_id: GPU ID'si
        """
        # Gerçek uygulamada, bu metod görevi GPU'da yürütecek
        # Bu örnekte, sadece simüle ediyoruz
        task_id = task['id']
        task_type = task.get('type', 'default')

        # Görev yürütme thread'i başlat
        thread = threading.Thread(
            target=self._task_execution_thread,
            args=(task, gpu_id),
            daemon=True
        )
        thread.start()

        logger.info(f"Görev {task_id} (tip: {task_type}) GPU {gpu_id}'de yürütülüyor")

    def _task_execution_thread(self, task: Dict[str, Any], gpu_id: int):
        """
        Görev yürütme thread'i.

        Args:
            task: Görev bilgilerini içeren sözlük
            gpu_id: GPU ID'si
        """
        task_id = task['id']

        try:
            # Gerçek uygulamada, burada GPU üzerinde gerçek işlem yapılacak
            # Bu örnekte, sadece simüle ediyoruz

            # Görev süresini simüle et
            execution_time = task.get('execution_time', 1.0)  # saniye
            time.sleep(execution_time)

            # Görev sonucunu oluştur
            result = {
                'status': 'success',
                'execution_time': execution_time,
                'gpu_id': gpu_id,
                'timestamp': datetime.now().isoformat()
            }

            # Görev sonucunu kaydet
            with self.lock:
                self.task_results[task_id] = result
                self.task_status[task_id] = TaskStatus.COMPLETED

            logger.info(f"Görev {task_id} başarıyla tamamlandı (GPU {gpu_id}, süre: {execution_time:.2f}s)")
        except Exception as e:
            # Hata durumunda
            error_result = {
                'status': 'error',
                'error': str(e),
                'gpu_id': gpu_id,
                'timestamp': datetime.now().isoformat()
            }

            # Hata sonucunu kaydet
            with self.lock:
                self.task_results[task_id] = error_result
                self.task_status[task_id] = TaskStatus.FAILED

            logger.error(f"Görev {task_id} yürütülürken hata: {e}")
        finally:
            # GPU'yu serbest bırak
            try:
                self.gpu_pool_manager.release_gpu(gpu_id, task_id)
            except Exception as e:
                logger.error(f"GPU {gpu_id} serbest bırakılırken hata: {e}")

            # Görev-GPU eşleştirmesini kaldır
            with self.lock:
                if task_id in self.task_gpu_mapping:
                    del self.task_gpu_mapping[task_id]

    def distribute_task(self, task: Dict[str, Any]) -> Optional[int]:
        """
        Belirli bir görevi uygun GPU'ya dağıtır.

        Args:
            task: Görev bilgilerini içeren sözlük

        Returns:
            Seçilen GPU ID'si veya görev kuyruğa eklendiyse None
        """
        with self.lock:
            # Görev ID'si yoksa oluştur
            if 'id' not in task:
                task['id'] = str(uuid.uuid4())

            task_id = task['id']

            # Görev durumunu başlangıçta PENDING olarak ayarla
            self.task_status[task_id] = TaskStatus.PENDING

            # Kullanılabilir GPU'ları al
            available_gpus = self.gpu_pool_manager.get_available_gpus()

            if not available_gpus:
                # Tüm GPU'lar meşgulse, görevi kuyruğa ekle
                priority = task.get('priority', 0)  # Varsayılan öncelik: 0 (normal)
                prioritized_task = PrioritizedTask(
                    priority=priority,
                    timestamp=time.time(),
                    task=task
                )
                self.task_queue.put(prioritized_task)
                self.task_status[task_id] = TaskStatus.QUEUED

                logger.info(f"Görev {task_id} kuyruğa eklendi (öncelik: {priority})")
                return None

            # GPU seçim stratejisini al
            strategy_name = task.get('strategy', self.config.get('default_strategy', 'least_loaded'))
            strategy = self.strategy_selector.get_strategy(strategy_name)

            # GPU bilgilerini al
            gpu_info = self.gpu_pool_manager.get_all_gpu_info()

            # GPU seç
            selected_gpu = strategy.select_gpu(task, available_gpus, gpu_info)

            if selected_gpu is None:
                # Uygun GPU bulunamazsa, görevi kuyruğa ekle
                priority = task.get('priority', 0)
                prioritized_task = PrioritizedTask(
                    priority=priority,
                    timestamp=time.time(),
                    task=task
                )
                self.task_queue.put(prioritized_task)
                self.task_status[task_id] = TaskStatus.QUEUED

                logger.info(f"Görev {task_id} kuyruğa eklendi (uygun GPU bulunamadı)")
                return None

            # GPU'yu rezerve et
            self.gpu_pool_manager.reserve_gpu(selected_gpu, task_id)

            # Görevi GPU'ya gönder
            self._execute_task_on_gpu(task, selected_gpu)

            # Görev durumunu güncelle
            self.task_status[task_id] = TaskStatus.RUNNING
            self.task_gpu_mapping[task_id] = selected_gpu

            return selected_gpu

    def distribute_batch(self, batch_tasks: List[Dict[str, Any]], split_batch: bool = True) -> Dict[str, Any]:
        """
        Batch görevleri GPU'lar arasında dağıtır.

        Args:
            batch_tasks: Görev bilgilerini içeren sözlük listesi
            split_batch: Batch'i bölüp farklı GPU'lara dağıtma seçeneği

        Returns:
            Dağıtım sonuçlarını içeren sözlük
        """
        if not batch_tasks:
            return {'status': 'error', 'message': 'Boş batch'}

        # Tüm görevlere ID ekle
        for task in batch_tasks:
            if 'id' not in task:
                task['id'] = str(uuid.uuid4())

        # Kullanılabilir GPU'ları al
        available_gpus = self.gpu_pool_manager.get_available_gpus()

        if not available_gpus:
            # Tüm GPU'lar meşgulse, tüm görevleri kuyruğa ekle
            for task in batch_tasks:
                priority = task.get('priority', 0)
                prioritized_task = PrioritizedTask(
                    priority=priority,
                    timestamp=time.time(),
                    task=task
                )
                self.task_queue.put(prioritized_task)
                self.task_status[task['id']] = TaskStatus.QUEUED

            logger.info(f"{len(batch_tasks)} görevden oluşan batch kuyruğa eklendi (kullanılabilir GPU yok)")
            return {
                'status': 'queued',
                'message': 'Tüm görevler kuyruğa eklendi',
                'task_ids': [task['id'] for task in batch_tasks]
            }

        if not split_batch and len(available_gpus) > 0:
            # Batch'i bölmeden tek bir GPU'ya gönder
            # GPU seçim stratejisini al
            strategy_name = self.config.get('default_strategy', 'least_loaded')
            strategy = self.strategy_selector.get_strategy(strategy_name)

            # GPU bilgilerini al
            gpu_info = self.gpu_pool_manager.get_all_gpu_info()

            # Batch için bir GPU seç
            # Batch'in ilk görevini kullanarak GPU seç
            selected_gpu = strategy.select_gpu(batch_tasks[0], available_gpus, gpu_info)

            if selected_gpu is None:
                # Uygun GPU bulunamazsa, tüm görevleri kuyruğa ekle
                for task in batch_tasks:
                    priority = task.get('priority', 0)
                    prioritized_task = PrioritizedTask(
                        priority=priority,
                        timestamp=time.time(),
                        task=task
                    )
                    self.task_queue.put(prioritized_task)
                    self.task_status[task['id']] = TaskStatus.QUEUED

                logger.info(f"{len(batch_tasks)} görevden oluşan batch kuyruğa eklendi (uygun GPU bulunamadı)")
                return {
                    'status': 'queued',
                    'message': 'Tüm görevler kuyruğa eklendi',
                    'task_ids': [task['id'] for task in batch_tasks]
                }

            # Tüm görevleri seçilen GPU'ya gönder
            for task in batch_tasks:
                task_id = task['id']

                # GPU'yu rezerve et
                self.gpu_pool_manager.reserve_gpu(selected_gpu, task_id)

                # Görevi GPU'ya gönder
                self._execute_task_on_gpu(task, selected_gpu)

                # Görev durumunu güncelle
                self.task_status[task_id] = TaskStatus.RUNNING
                self.task_gpu_mapping[task_id] = selected_gpu

            logger.info(f"{len(batch_tasks)} görevden oluşan batch GPU {selected_gpu}'ye gönderildi")
            return {
                'status': 'running',
                'message': f'Tüm görevler GPU {selected_gpu}\'ye gönderildi',
                'gpu_id': selected_gpu,
                'task_ids': [task['id'] for task in batch_tasks]
            }
        else:
            # Batch'i böl ve farklı GPU'lara dağıt
            results = {
                'status': 'mixed',
                'distributed': [],
                'queued': []
            }

            # Her görev için ayrı ayrı dağıtım yap
            for task in batch_tasks:
                selected_gpu = self.distribute_task(task)

                if selected_gpu is not None:
                    # Görev bir GPU'ya dağıtıldı
                    results['distributed'].append({
                        'task_id': task['id'],
                        'gpu_id': selected_gpu
                    })
                else:
                    # Görev kuyruğa eklendi
                    results['queued'].append(task['id'])

            if not results['queued']:
                results['status'] = 'all_distributed'
            elif not results['distributed']:
                results['status'] = 'all_queued'

            logger.info(f"Batch dağıtıldı: {len(results['distributed'])} görev dağıtıldı, "
                       f"{len(results['queued'])} görev kuyruğa eklendi")
            return results

    def cancel_task(self, task_id: str) -> bool:
        """
        Belirli bir görevi iptal eder.

        Args:
            task_id: Görev ID'si

        Returns:
            İşlemin başarılı olup olmadığı
        """
        with self.lock:
            # Görev durumunu kontrol et
            if task_id not in self.task_status:
                logger.warning(f"Görev {task_id} bulunamadı")
                return False

            status = self.task_status[task_id]

            if status == TaskStatus.COMPLETED or status == TaskStatus.FAILED:
                logger.warning(f"Görev {task_id} zaten tamamlandı veya başarısız oldu: {status.value}")
                return False

            if status == TaskStatus.CANCELED:
                logger.warning(f"Görev {task_id} zaten iptal edildi")
                return False

            if status == TaskStatus.QUEUED:
                # Görevi kuyruktan çıkar
                # Not: PriorityQueue'dan belirli bir öğeyi çıkarmak kolay değil
                # Bu nedenle, görevi kuyrukta bırakıp durumunu CANCELED olarak işaretliyoruz
                # Kuyruk işleyici, CANCELED durumundaki görevleri atlayacak
                self.task_status[task_id] = TaskStatus.CANCELED
                logger.info(f"Kuyruktaki görev {task_id} iptal edildi")
                return True

            if status == TaskStatus.RUNNING:
                # Çalışan görevi iptal et
                # Gerçek uygulamada, burada görevin çalıştığı thread'i veya süreci sonlandırma mantığı olacak
                # Bu örnekte, sadece durumu güncelliyoruz
                self.task_status[task_id] = TaskStatus.CANCELED

                # GPU'yu serbest bırak
                if task_id in self.task_gpu_mapping:
                    gpu_id = self.task_gpu_mapping[task_id]
                    try:
                        self.gpu_pool_manager.release_gpu(gpu_id, task_id)
                    except Exception as e:
                        logger.error(f"GPU {gpu_id} serbest bırakılırken hata: {e}")

                    # Görev-GPU eşleştirmesini kaldır
                    del self.task_gpu_mapping[task_id]

                logger.info(f"Çalışan görev {task_id} iptal edildi")
                return True

            # Diğer durumlar
            logger.warning(f"Görev {task_id} iptal edilemedi: Beklenmeyen durum: {status.value}")
            return False

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Belirli bir görevin durumunu döndürür.

        Args:
            task_id: Görev ID'si

        Returns:
            Görev durumu bilgilerini içeren sözlük veya görev bulunamazsa None
        """
        with self.lock:
            if task_id not in self.task_status:
                return None

            status = self.task_status[task_id]
            result = {
                'id': task_id,
                'status': status.value
            }

            # GPU bilgisini ekle
            if task_id in self.task_gpu_mapping:
                result['gpu_id'] = self.task_gpu_mapping[task_id]

            # Sonuç bilgisini ekle
            if task_id in self.task_results:
                result['result'] = self.task_results[task_id]

            return result

    def get_all_task_statuses(self) -> Dict[str, Dict[str, Any]]:
        """
        Tüm görevlerin durumlarını döndürür.

        Returns:
            Görev ID'lerini anahtar, görev durumu bilgilerini değer olarak içeren sözlük
        """
        with self.lock:
            result = {}
            for task_id in self.task_status:
                result[task_id] = self.get_task_status(task_id)
            return result

    def get_queue_status(self) -> Dict[str, Any]:
        """
        Kuyruk durumunu döndürür.

        Returns:
            Kuyruk durumu bilgilerini içeren sözlük
        """
        with self.lock:
            return {
                'queue_size': self.task_queue.qsize(),
                'running_tasks': len(self.task_gpu_mapping),
                'gpu_utilization': {
                    gpu_id: len([t for t, g in self.task_gpu_mapping.items() if g == gpu_id])
                    for gpu_id in set(self.task_gpu_mapping.values())
                }
            }


if __name__ == "__main__":
    # Örnek kullanım
    # Not: Bu örnek, gerçek GPU Havuzu Yöneticisi ve Strateji Seçici olmadan çalışmaz
    # Sadece kod yapısını göstermek için verilmiştir

    class MockGPUPoolManager:
        def __init__(self):
            self.gpus = {0: {}, 1: {}}

        def get_available_gpus(self):
            return list(self.gpus.keys())

        def get_all_gpu_info(self):
            return {
                0: type('GPUInfo', (), {'id': 0, 'utilization': 30, 'memory_used': 4000, 'memory_total': 16000}),
                1: type('GPUInfo', (), {'id': 1, 'utilization': 70, 'memory_used': 8000, 'memory_total': 16000})
            }

        def reserve_gpu(self, gpu_id, task_id):
            print(f"GPU {gpu_id} reserved for task {task_id}")
            return True

        def release_gpu(self, gpu_id, task_id):
            print(f"GPU {gpu_id} released from task {task_id}")
            return True

    class MockStrategySelector:
        def get_strategy(self, strategy_name):
            return type('Strategy', (), {
                'select_gpu': lambda task, available_gpus, gpu_info: available_gpus[0] if available_gpus else None
            })

        def get_default_strategy(self):
            return self.get_strategy('default')

    # Yapılandırma
    config = {
        'default_strategy': 'least_loaded',
        'queue_processing_interval': 1.0,
        'max_concurrent_tasks_per_gpu': 4
    }

    # Mock nesneleri oluştur
    gpu_manager = MockGPUPoolManager()
    strategy_selector = MockStrategySelector()

    # İş Yükü Dağıtıcıyı oluştur
    distributor = WorkloadDistributor(gpu_manager, strategy_selector, config)

    # Örnek görevler
    tasks = [
        {'id': 'task-1', 'type': 'image_segmentation', 'execution_time': 2.0},
        {'id': 'task-2', 'type': 'text_generation', 'execution_time': 1.5},
        {'id': 'task-3', 'type': 'object_detection', 'execution_time': 3.0}
    ]

    # Görevleri dağıt
    for task in tasks:
        gpu_id = distributor.distribute_task(task)
        print(f"Task {task['id']} distributed to GPU {gpu_id}")

    # Kuyruk durumunu kontrol et
    print("\nQueue status:")
    print(distributor.get_queue_status())

    # Görev durumlarını kontrol et
    time.sleep(1.0)
    print("\nTask statuses after 1 second:")
    for task_id, status in distributor.get_all_task_statuses().items():
        print(f"Task {task_id}: {status['status']}")

    # Bir görevi iptal et
    distributor.cancel_task('task-3')

    # Tüm görevlerin tamamlanmasını bekle
    time.sleep(3.0)

    # Final durumları kontrol et
    print("\nFinal task statuses:")
    for task_id, status in distributor.get_all_task_statuses().items():
        print(f"Task {task_id}: {status['status']}")
        if 'result' in status:
            print(f"  Result: {status['result']}")

    # Batch dağıtımı örneği
    batch_tasks = [
        {'id': 'batch-1', 'type': 'image_segmentation', 'execution_time': 1.0},
        {'id': 'batch-2', 'type': 'image_segmentation', 'execution_time': 1.0},
        {'id': 'batch-3', 'type': 'image_segmentation', 'execution_time': 1.0}
    ]

    print("\nDistributing batch tasks...")
    result = distributor.distribute_batch(batch_tasks, split_batch=True)
    print(f"Batch distribution result: {result}")

    # Temizlik
    distributor.stop_queue_processor()
