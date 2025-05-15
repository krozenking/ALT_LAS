import torch
import time
import numpy as np
import cupy as cp

def print_system_info():
    """CUDA ve GPU bilgilerini gösterir."""
    print("=" * 50)
    print("SISTEM BILGILERI")
    print("=" * 50)
    
    # CUDA kullanılabilir mi kontrol et
    if not torch.cuda.is_available():
        print("CUDA kullanılamıyor!")
        return False
    
    # PyTorch ve CUDA bilgileri
    print(f"PyTorch Versiyonu: {torch.__version__}")
    print(f"CUDA Versiyonu: {torch.version.cuda}")
    print(f"cuDNN Versiyonu: {torch.backends.cudnn.version() if torch.backends.cudnn.is_available() else 'Kullanılamıyor'}")
    
    # GPU bilgileri
    print(f"GPU Sayısı: {torch.cuda.device_count()}")
    print(f"Aktif GPU: {torch.cuda.current_device()}")
    print(f"GPU Adı: {torch.cuda.get_device_name(0)}")
    
    # CuPy bilgileri
    try:
        print(f"CuPy Versiyonu: {cp.__version__}")
        print(f"CuPy CUDA Versiyonu: {cp.cuda.runtime.runtimeGetVersion()}")
    except:
        print("CuPy bilgileri alınamadı.")
    
    print("=" * 50)
    return True

def test_matrix_multiplication():
    """Matris çarpımı ile GPU performansını test eder."""
    print("\nMATRIS CARPIMI TESTI")
    print("-" * 50)
    
    # Test parametreleri
    sizes = [1000, 2000, 5000]
    
    for size in sizes:
        print(f"\nMatris Boyutu: {size}x{size}")
        
        # PyTorch ile GPU'da matris çarpımı
        a_gpu = torch.randn(size, size, device='cuda')
        b_gpu = torch.randn(size, size, device='cuda')
        
        # Isınma turu
        _ = torch.matmul(a_gpu, b_gpu)
        torch.cuda.synchronize()
        
        # Zamanlama
        start_time = time.time()
        c_gpu = torch.matmul(a_gpu, b_gpu)
        torch.cuda.synchronize()  # GPU işleminin tamamlanmasını bekle
        gpu_time = time.time() - start_time
        
        # PyTorch ile CPU'da matris çarpımı
        a_cpu = a_gpu.cpu()
        b_cpu = b_gpu.cpu()
        
        # Isınma turu
        _ = torch.matmul(a_cpu, b_cpu)
        
        # Zamanlama
        start_time = time.time()
        c_cpu = torch.matmul(a_cpu, b_cpu)
        cpu_time = time.time() - start_time
        
        # Sonuçları göster
        print(f"GPU Hesaplama Süresi: {gpu_time:.4f} saniye")
        print(f"CPU Hesaplama Süresi: {cpu_time:.4f} saniye")
        print(f"Hızlanma: {cpu_time/gpu_time:.2f}x")
        
        # Sonuçların doğruluğunu kontrol et
        c_cpu_on_gpu = c_cpu.cuda()
        error = torch.abs(c_gpu - c_cpu_on_gpu).max().item()
        print(f"Maksimum Hata: {error:.6e}")

def test_convolution():
    """Evrişim işlemi ile GPU performansını test eder."""
    print("\nEVRISIM TESTI")
    print("-" * 50)
    
    # Test parametreleri
    batch_size = 16
    input_channels = 3
    output_channels = 64
    kernel_size = 3
    image_sizes = [224, 512, 1024]
    
    for size in image_sizes:
        print(f"\nGörüntü Boyutu: {size}x{size}")
        
        # Giriş tensörü ve evrişim katmanı oluştur
        input_tensor = torch.randn(batch_size, input_channels, size, size)
        conv_layer = torch.nn.Conv2d(input_channels, output_channels, kernel_size, padding=1)
        
        # GPU'da evrişim
        input_tensor_gpu = input_tensor.cuda()
        conv_layer_gpu = conv_layer.cuda()
        
        # Isınma turu
        _ = conv_layer_gpu(input_tensor_gpu)
        torch.cuda.synchronize()
        
        # Zamanlama
        start_time = time.time()
        output_gpu = conv_layer_gpu(input_tensor_gpu)
        torch.cuda.synchronize()
        gpu_time = time.time() - start_time
        
        # CPU'da evrişim
        # Isınma turu
        _ = conv_layer(input_tensor)
        
        # Zamanlama
        start_time = time.time()
        output_cpu = conv_layer(input_tensor)
        cpu_time = time.time() - start_time
        
        # Sonuçları göster
        print(f"GPU Hesaplama Süresi: {gpu_time:.4f} saniye")
        print(f"CPU Hesaplama Süresi: {cpu_time:.4f} saniye")
        print(f"Hızlanma: {cpu_time/gpu_time:.2f}x")

def test_cupy():
    """CuPy ile GPU performansını test eder."""
    print("\nCUPY TESTI")
    print("-" * 50)
    
    # Test parametreleri
    sizes = [1000, 2000, 5000]
    
    for size in sizes:
        print(f"\nMatris Boyutu: {size}x{size}")
        
        # CuPy ile GPU'da matris çarpımı
        a_gpu = cp.random.randn(size, size, dtype=cp.float32)
        b_gpu = cp.random.randn(size, size, dtype=cp.float32)
        
        # Isınma turu
        _ = cp.matmul(a_gpu, b_gpu)
        cp.cuda.Stream.null.synchronize()
        
        # Zamanlama
        start_time = time.time()
        c_gpu = cp.matmul(a_gpu, b_gpu)
        cp.cuda.Stream.null.synchronize()
        gpu_time = time.time() - start_time
        
        # NumPy ile CPU'da matris çarpımı
        a_cpu = cp.asnumpy(a_gpu)
        b_cpu = cp.asnumpy(b_gpu)
        
        # Isınma turu
        _ = np.matmul(a_cpu, b_cpu)
        
        # Zamanlama
        start_time = time.time()
        c_cpu = np.matmul(a_cpu, b_cpu)
        cpu_time = time.time() - start_time
        
        # Sonuçları göster
        print(f"GPU Hesaplama Süresi (CuPy): {gpu_time:.4f} saniye")
        print(f"CPU Hesaplama Süresi (NumPy): {cpu_time:.4f} saniye")
        print(f"Hızlanma: {cpu_time/gpu_time:.2f}x")

def test_gpu_memory():
    """GPU bellek kullanımını test eder."""
    print("\nGPU BELLEK TESTI")
    print("-" * 50)
    
    # Başlangıç bellek kullanımı
    torch.cuda.empty_cache()
    start_memory = torch.cuda.memory_allocated() / (1024 ** 2)
    print(f"Başlangıç GPU Bellek Kullanımı: {start_memory:.2f} MB")
    
    # Farklı boyutlarda tensörler oluştur ve bellek kullanımını izle
    sizes = [1000, 2000, 5000, 10000]
    tensors = []
    
    for i, size in enumerate(sizes):
        tensors.append(torch.randn(size, size, device='cuda'))
        current_memory = torch.cuda.memory_allocated() / (1024 ** 2)
        print(f"Tensör {i+1} ({size}x{size}) sonrası GPU Bellek Kullanımı: {current_memory:.2f} MB")
        print(f"Son tensör için kullanılan bellek: {(current_memory - (start_memory if i == 0 else prev_memory)):.2f} MB")
        prev_memory = current_memory
    
    # Belleği temizle
    tensors = None
    torch.cuda.empty_cache()
    end_memory = torch.cuda.memory_allocated() / (1024 ** 2)
    print(f"Temizleme sonrası GPU Bellek Kullanımı: {end_memory:.2f} MB")

def main():
    """Ana test fonksiyonu."""
    if not print_system_info():
        return
    
    # Testleri çalıştır
    test_matrix_multiplication()
    test_convolution()
    test_cupy()
    test_gpu_memory()
    
    print("\nTüm testler başarıyla tamamlandı!")

if __name__ == "__main__":
    main()
