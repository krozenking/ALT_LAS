# workload_distributor.py
import time
import threading
import queue
import logging
import uuid

# Logger oluştur
logger = logging.getLogger('workload_distributor')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

class Task:
    """Görev sınıfı."""

    def __init__(self, task_id, task_type, params, priority="normal", batch_id=None):
        """Görevi başlat."""
        self.id = task_id
        self.type = task_type
        self.params = params
        self.priority = priority
        self.batch_id = batch_id
        self.status = "QUEUED"
        self.gpu_id = None
        self.created_at = time.time()
        self.started_at = None
        self.completed_at = None
        self.result = None
        self.error = None
        self.retry_count = 0

    def to_dict(self):
        """Görevi sözlük olarak döndür."""
        return {
            'id': self.id,
            'type': self.type,
            'params': self.params,
            'priority': self.priority,
            'batch_id': self.batch_id,
            'status': self.status,
            'gpu_id': self.gpu_id,
            'created_at': self.created_at,
            'started_at': self.started_at,
            'completed_at': self.completed_at,
            'result': self.result,
            'error': self.error,
            'retry_count': self.retry_count
        }

class WorkloadDistributor:
    """İş yükü dağıtıcı sınıf."""

    def __init__(self, gpu_pool_manager, strategy_selector, config):
        """İş Yükü Dağıtıcı'yı başlat."""
        self.gpu_pool_manager = gpu_pool_manager
        self.strategy_selector = strategy_selector
        self.config = config
        self.tasks = {}
        self.batches = {}
        self.task_queue = queue.PriorityQueue()
        self.running = False
        self.thread = None

        # Kuyruk işleme thread'ini başlat
        self.start_queue_processing()

        logger.info("İş Yükü Dağıtıcı başlatıldı")

    def __del__(self):
        """İş Yükü Dağıtıcı'yı temizle."""
        self.stop_queue_processing()

    def create_task(self, task_type, params, priority="normal", batch_id=None):
        """Yeni bir görev oluştur."""
        # Görev ID'si oluştur
        task_id = str(uuid.uuid4())

        # Görevi oluştur
        task = Task(task_id, task_type, params, priority, batch_id)

        # Görevi kaydet
        self.tasks[task_id] = task

        # Görevi kuyruğa ekle
        self._enqueue_task(task)

        logger.info(f"Görev {task_id} oluşturuldu (Tür: {task_type}, Öncelik: {priority})")

        return task_id

    def create_batch(self, task_type, params_list, priority="normal"):
        """Yeni bir batch oluştur."""
        # Batch ID'si oluştur
        batch_id = str(uuid.uuid4())

        # Batch'i oluştur
        batch = {
            'id': batch_id,
            'status': "QUEUED",
            'task_ids': [],
            'created_at': time.time(),
            'completed_at': None
        }

        # Batch'i kaydet
        self.batches[batch_id] = batch

        # Görevleri oluştur
        for params in params_list:
            task_id = self.create_task(task_type, params, priority, batch_id)
            batch['task_ids'].append(task_id)

        logger.info(f"Batch {batch_id} oluşturuldu ({len(params_list)} görev)")

        return batch_id

    def distribute_task(self, task_id, strategy_name=None):
        """Görevi dağıt."""
        if task_id not in self.tasks:
            logger.error(f"Görev {task_id} bulunamadı")
            raise ValueError(f"Görev {task_id} bulunamadı")

        task = self.tasks[task_id]

        # Görev zaten çalışıyorsa veya tamamlanmışsa, hata döndür
        if task.status not in ["QUEUED", "FAILED"]:
            logger.warning(f"Görev {task_id} zaten {task.status} durumunda")
            return task.gpu_id

        # Kullanılabilir GPU'ları al
        available_gpus = self.gpu_pool_manager.get_available_gpus()

        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None

        # Her GPU için çalışan görev sayısını kontrol et
        max_concurrent_tasks = self.config['workload'].get('max_concurrent_tasks_per_gpu', 4)
        valid_gpus = []

        for gpu_id in available_gpus:
            # GPU'da çalışan görev sayısını say
            running_tasks = 0
            for t in self.tasks.values():
                if t.gpu_id == gpu_id and t.status == "RUNNING":
                    running_tasks += 1

            # Eğer GPU'da çalışan görev sayısı maksimum değerden azsa, geçerli GPU'lara ekle
            if running_tasks < max_concurrent_tasks:
                valid_gpus.append(gpu_id)

        if not valid_gpus:
            logger.warning("Kullanılabilir GPU yok (Tüm GPU'lar maksimum görev sayısına ulaştı)")
            return None

        # GPU seç
        gpu_id = self.strategy_selector.select_gpu(valid_gpus, task, self.gpu_pool_manager, strategy_name)

        if gpu_id is None:
            logger.warning(f"Görev {task_id} için GPU seçilemedi")
            return None

        # GPU'yu rezerve et
        if not self.gpu_pool_manager.reserve_gpu(gpu_id, task_id):
            logger.warning(f"GPU {gpu_id} rezerve edilemedi")
            return None

        # Görevi güncelle
        task.status = "RUNNING"
        task.gpu_id = gpu_id
        task.started_at = time.time()

        logger.info(f"Görev {task_id} GPU {gpu_id}'ye dağıtıldı")

        # Görevi çalıştır
        self._run_task(task)

        return gpu_id

    def get_task_status(self, task_id):
        """Görev durumunu al."""
        if task_id not in self.tasks:
            logger.warning(f"Görev {task_id} bulunamadı")
            return None

        return self.tasks[task_id].to_dict()

    def get_batch_status(self, batch_id):
        """Batch durumunu al."""
        if batch_id not in self.batches:
            logger.warning(f"Batch {batch_id} bulunamadı")
            return None

        batch = self.batches[batch_id].copy()

        # Görev durumlarını kontrol et
        all_completed = True
        any_failed = False

        for task_id in batch['task_ids']:
            if task_id in self.tasks:
                task = self.tasks[task_id]

                if task.status != "COMPLETED":
                    all_completed = False

                if task.status == "FAILED":
                    any_failed = True

        # Batch durumunu güncelle
        if all_completed:
            batch['status'] = "COMPLETED"
            batch['completed_at'] = time.time()
        elif any_failed:
            batch['status'] = "FAILED"

        return batch

    def cancel_task(self, task_id):
        """Görevi iptal et."""
        if task_id not in self.tasks:
            logger.warning(f"Görev {task_id} bulunamadı")
            return False

        task = self.tasks[task_id]

        # Görev zaten tamamlanmışsa, iptal edilemez
        if task.status in ["COMPLETED", "FAILED", "CANCELLED"]:
            logger.warning(f"Görev {task_id} zaten {task.status} durumunda")
            return False

        # GPU'yu serbest bırak
        if task.gpu_id is not None:
            try:
                self.gpu_pool_manager.release_gpu(task.gpu_id, task_id)
                logger.info(f"GPU {task.gpu_id} serbest bırakıldı")
            except Exception as e:
                logger.error(f"GPU {task.gpu_id} serbest bırakılamadı: {str(e)}")

        # Görevi güncelle
        task.status = "CANCELLED"

        logger.info(f"Görev {task_id} iptal edildi")

        return True

    def cancel_batch(self, batch_id):
        """Batch'i iptal et."""
        if batch_id not in self.batches:
            logger.warning(f"Batch {batch_id} bulunamadı")
            return False

        batch = self.batches[batch_id]

        # Tüm görevleri iptal et
        for task_id in batch['task_ids']:
            self.cancel_task(task_id)

        logger.info(f"Batch {batch_id} iptal edildi")

        return True

    def get_all_tasks(self):
        """Tüm görevleri döndür."""
        return [task.to_dict() for task in self.tasks.values()]

    def get_all_batches(self):
        """Tüm batch'leri döndür."""
        return list(self.batches.values())

    def start_queue_processing(self):
        """Kuyruk işleme thread'ini başlat."""
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(target=self._queue_processing_loop)
        self.thread.daemon = True
        self.thread.start()

        logger.info("Kuyruk işleme başlatıldı")

    def stop_queue_processing(self):
        """Kuyruk işleme thread'ini durdur."""
        self.running = False

        if self.thread:
            self.thread.join()
            self.thread = None

        logger.info("Kuyruk işleme durduruldu")

    def _enqueue_task(self, task):
        """Görevi kuyruğa ekle."""
        # Öncelik değerini belirle
        priority = 2  # Normal

        if task.priority == "high":
            priority = 1  # Yüksek
        elif task.priority == "low":
            priority = 3  # Düşük

        # Görevi kuyruğa ekle
        self.task_queue.put((priority, task.id))

        logger.debug(f"Görev {task.id} kuyruğa eklendi (Öncelik: {priority})")

    def _queue_processing_loop(self):
        """Kuyruk işleme döngüsü."""
        interval = self.config['workload'].get('queue_processing_interval', 0.1)
        max_concurrent_tasks = self.config['workload'].get('max_concurrent_tasks_per_gpu', 4)

        while self.running:
            try:
                # Kullanılabilir GPU'ları al
                available_gpus = self.gpu_pool_manager.get_available_gpus()

                if not available_gpus:
                    # Kullanılabilir GPU yok, beklemeye devam et
                    time.sleep(interval)
                    continue

                # Her GPU için çalışan görev sayısını kontrol et
                gpu_task_counts = {}
                for gpu_id in available_gpus:
                    gpu_task_counts[gpu_id] = 0

                for task in self.tasks.values():
                    if task.status == "RUNNING" and task.gpu_id in gpu_task_counts:
                        gpu_task_counts[task.gpu_id] += 1

                # Görev çalıştırılabilecek GPU'ları bul
                valid_gpus = [gpu_id for gpu_id, count in gpu_task_counts.items() if count < max_concurrent_tasks]

                if not valid_gpus:
                    # Tüm GPU'lar maksimum görev sayısına ulaştı, beklemeye devam et
                    time.sleep(interval)
                    continue

                # Kuyruktan görev al
                try:
                    priority, task_id = self.task_queue.get(block=False)
                except queue.Empty:
                    # Kuyruk boş, beklemeye devam et
                    time.sleep(interval)
                    continue

                # Görevi kontrol et
                if task_id not in self.tasks:
                    logger.warning(f"Görev {task_id} bulunamadı")
                    self.task_queue.task_done()
                    continue

                task = self.tasks[task_id]

                # Görev zaten çalışıyorsa veya tamamlanmışsa, atla
                if task.status not in ["QUEUED", "FAILED"]:
                    logger.debug(f"Görev {task_id} zaten {task.status} durumunda")
                    self.task_queue.task_done()
                    continue

                # GPU seç
                gpu_id = self.strategy_selector.select_gpu(valid_gpus, task, self.gpu_pool_manager)

                if gpu_id is None:
                    # GPU seçilemedi, görevi tekrar kuyruğa ekle
                    self.task_queue.put((priority, task_id))
                    self.task_queue.task_done()
                    time.sleep(interval)
                    continue

                # GPU'yu rezerve et
                if not self.gpu_pool_manager.reserve_gpu(gpu_id, task_id):
                    # GPU rezerve edilemedi, görevi tekrar kuyruğa ekle
                    self.task_queue.put((priority, task_id))
                    self.task_queue.task_done()
                    time.sleep(interval)
                    continue

                # Görevi güncelle
                task.status = "RUNNING"
                task.gpu_id = gpu_id
                task.started_at = time.time()

                logger.info(f"Görev {task_id} GPU {gpu_id}'ye dağıtıldı")

                # Görevi çalıştır
                self._run_task(task)

                # Görevi tamamlandı olarak işaretle
                self.task_queue.task_done()
            except Exception as e:
                logger.error(f"Kuyruk işleme hatası: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                time.sleep(interval)

    def _run_task(self, task):
        """Görevi çalıştır."""
        # Gerçek bir görev çalıştırma işlemi burada yapılır
        # Bu test için, görevi simüle ediyoruz

        def simulate_task():
            try:
                # Görev süresini simüle et
                duration = task.params.get('duration', 1.0)
                time.sleep(duration)

                # Görevi tamamla
                task.status = "COMPLETED"
                task.completed_at = time.time()
                task.result = {
                    'output': f"Görev {task.id} tamamlandı",
                    'execution_time': task.completed_at - task.started_at
                }

                logger.info(f"Görev {task.id} tamamlandı (Süre: {task.completed_at - task.started_at:.2f}s)")

                # GPU'yu serbest bırak
                if task.gpu_id is not None:
                    try:
                        self.gpu_pool_manager.release_gpu(task.gpu_id, task.id)
                        logger.info(f"GPU {task.gpu_id} serbest bırakıldı")
                    except Exception as e:
                        logger.error(f"GPU {task.gpu_id} serbest bırakılamadı: {str(e)}")

                # Batch durumunu güncelle
                if task.batch_id is not None and task.batch_id in self.batches:
                    self._update_batch_status(task.batch_id)
            except Exception as e:
                # Görev başarısız oldu
                task.status = "FAILED"
                task.error = str(e)

                logger.error(f"Görev {task.id} başarısız oldu: {str(e)}")

                # GPU'yu serbest bırak
                if task.gpu_id is not None:
                    try:
                        self.gpu_pool_manager.release_gpu(task.gpu_id, task.id)
                        logger.info(f"GPU {task.gpu_id} serbest bırakıldı")
                    except Exception as e:
                        logger.error(f"GPU {task.gpu_id} serbest bırakılamadı: {str(e)}")

                # Yeniden deneme
                max_retry_count = self.config['workload'].get('retry_count', 3)

                if task.retry_count < max_retry_count:
                    task.retry_count += 1
                    task.status = "QUEUED"
                    task.gpu_id = None
                    task.started_at = None

                    logger.info(f"Görev {task.id} yeniden deneniyor (Deneme: {task.retry_count}/{max_retry_count})")

                    # Görevi kuyruğa ekle
                    self._enqueue_task(task)

        # Görevi ayrı bir thread'de çalıştır
        thread = threading.Thread(target=simulate_task)
        thread.daemon = True
        thread.start()

    def _update_batch_status(self, batch_id):
        """Batch durumunu güncelle."""
        if batch_id not in self.batches:
            logger.warning(f"Batch {batch_id} bulunamadı")
            return

        batch = self.batches[batch_id]

        # Görev durumlarını kontrol et
        all_completed = True
        any_failed = False

        for task_id in batch['task_ids']:
            if task_id in self.tasks:
                task = self.tasks[task_id]

                if task.status != "COMPLETED":
                    all_completed = False

                if task.status == "FAILED":
                    any_failed = True

        # Batch durumunu güncelle
        if all_completed:
            batch['status'] = "COMPLETED"
            batch['completed_at'] = time.time()

            logger.info(f"Batch {batch_id} tamamlandı")
        elif any_failed:
            batch['status'] = "FAILED"

            logger.warning(f"Batch {batch_id} başarısız oldu")

    def distribute_task_to_gpu(self, task_id, gpu_id):
        """Görevi belirli bir GPU'ya dağıt."""
        if task_id not in self.tasks:
            logger.error(f"Görev {task_id} bulunamadı")
            raise ValueError(f"Görev {task_id} bulunamadı")

        task = self.tasks[task_id]

        # Görev zaten çalışıyorsa veya tamamlanmışsa, hata döndür
        if task.status not in ["QUEUED", "FAILED"]:
            logger.warning(f"Görev {task_id} zaten {task.status} durumunda")
            return task.gpu_id

        # GPU'yu kontrol et
        if gpu_id not in self.gpu_pool_manager.gpus:
            logger.error(f"GPU {gpu_id} bulunamadı")
            raise ValueError(f"GPU {gpu_id} bulunamadı")

        # GPU'da çalışan görev sayısını kontrol et
        max_concurrent_tasks = self.config['workload'].get('max_concurrent_tasks_per_gpu', 4)
        running_tasks = 0

        for t in self.tasks.values():
            if t.gpu_id == gpu_id and t.status == "RUNNING":
                running_tasks += 1

        if running_tasks >= max_concurrent_tasks:
            logger.warning(f"GPU {gpu_id} maksimum görev sayısına ulaştı ({running_tasks}/{max_concurrent_tasks})")
            raise ValueError(f"GPU {gpu_id} maksimum görev sayısına ulaştı ({running_tasks}/{max_concurrent_tasks})")

        # GPU'yu rezerve et
        if not self.gpu_pool_manager.reserve_gpu(gpu_id, task_id):
            logger.warning(f"GPU {gpu_id} rezerve edilemedi")
            raise ValueError(f"GPU {gpu_id} rezerve edilemedi")

        # Görevi güncelle
        task.status = "RUNNING"
        task.gpu_id = gpu_id
        task.started_at = time.time()

        logger.info(f"Görev {task_id} GPU {gpu_id}'ye dağıtıldı")

        # Görevi çalıştır
        self._run_task(task)

        return gpu_id
