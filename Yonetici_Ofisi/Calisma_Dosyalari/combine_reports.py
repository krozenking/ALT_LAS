"""
Test Sonuçlarını Birleştirme Betiği

Bu betik, farklı test sonuçlarını birleştirerek tek bir HTML raporu oluşturur.
"""

import os
import argparse
import json
import glob
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from bs4 import BeautifulSoup
import logging

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("combine_reports")

def parse_args():
    """Komut satırı argümanlarını ayrıştır."""
    parser = argparse.ArgumentParser(description="Test sonuçlarını birleştir")
    parser.add_argument("--input-dir", required=True, help="Test sonuçlarının bulunduğu dizin")
    parser.add_argument("--output-file", required=True, help="Birleştirilmiş rapor dosyası")
    return parser.parse_args()

def extract_html_reports(input_dir):
    """HTML raporlarını bul ve içeriklerini çıkar."""
    html_files = glob.glob(os.path.join(input_dir, "**/*.html"), recursive=True)
    reports = []
    
    for html_file in html_files:
        try:
            with open(html_file, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Dosya adından rapor türünü çıkar
            report_type = os.path.basename(html_file).replace("_report.html", "")
            
            reports.append({
                "file": html_file,
                "type": report_type,
                "content": content
            })
            
            logger.info(f"HTML raporu çıkarıldı: {html_file}")
        except Exception as e:
            logger.error(f"HTML raporu çıkarılırken hata: {html_file} - {e}")
    
    return reports

def extract_benchmark_results(input_dir):
    """Benchmark sonuçlarını bul ve içeriklerini çıkar."""
    json_files = glob.glob(os.path.join(input_dir, "**/*.json"), recursive=True)
    results = []
    
    for json_file in json_files:
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            # Dosya adından benchmark türünü çıkar
            benchmark_type = os.path.basename(json_file).replace("_benchmark.json", "")
            
            results.append({
                "file": json_file,
                "type": benchmark_type,
                "data": data
            })
            
            logger.info(f"Benchmark sonucu çıkarıldı: {json_file}")
        except Exception as e:
            logger.error(f"Benchmark sonucu çıkarılırken hata: {json_file} - {e}")
    
    return results

def generate_performance_charts(benchmark_results, output_dir):
    """Performans grafiklerini oluştur."""
    charts = []
    
    # Çıkarım hızı grafikleri
    inference_speed_results = [r for r in benchmark_results if "inference_speed" in r["type"]]
    if inference_speed_results:
        try:
            # Veri çerçevesi oluştur
            data = []
            for result in inference_speed_results:
                for benchmark in result["data"]["benchmarks"]:
                    data.append({
                        "model": benchmark.get("params", {}).get("model_config_name", "unknown"),
                        "framework": benchmark.get("params", {}).get("framework", "unknown"),
                        "batch_size": benchmark.get("params", {}).get("batch_size", 1),
                        "tokens_per_second": benchmark.get("stats", {}).get("mean", 0)
                    })
            
            df = pd.DataFrame(data)
            
            # Çıkarım hızı grafiği
            plt.figure(figsize=(12, 8))
            sns.barplot(x="model", y="tokens_per_second", hue="framework", data=df)
            plt.title("Model ve Framework Bazında Çıkarım Hızı")
            plt.xlabel("Model")
            plt.ylabel("Tokens/Second")
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            # Grafiği kaydet
            chart_file = os.path.join(output_dir, "inference_speed_chart.png")
            plt.savefig(chart_file)
            plt.close()
            
            charts.append({
                "title": "Çıkarım Hızı",
                "file": chart_file,
                "description": "Farklı model ve framework'ler için çıkarım hızı karşılaştırması"
            })
            
            logger.info(f"Çıkarım hızı grafiği oluşturuldu: {chart_file}")
        except Exception as e:
            logger.error(f"Çıkarım hızı grafiği oluşturulurken hata: {e}")
    
    # Bellek kullanımı grafikleri
    memory_usage_results = [r for r in benchmark_results if "memory_usage" in r["type"]]
    if memory_usage_results:
        try:
            # Veri çerçevesi oluştur
            data = []
            for result in memory_usage_results:
                for benchmark in result["data"]["benchmarks"]:
                    data.append({
                        "model": benchmark.get("params", {}).get("model_config_name", "unknown"),
                        "framework": benchmark.get("params", {}).get("framework", "unknown"),
                        "batch_size": benchmark.get("params", {}).get("batch_size", 1),
                        "memory_usage_mb": benchmark.get("stats", {}).get("mean", 0)
                    })
            
            df = pd.DataFrame(data)
            
            # Bellek kullanımı grafiği
            plt.figure(figsize=(12, 8))
            sns.barplot(x="model", y="memory_usage_mb", hue="framework", data=df)
            plt.title("Model ve Framework Bazında Bellek Kullanımı")
            plt.xlabel("Model")
            plt.ylabel("Bellek Kullanımı (MB)")
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            # Grafiği kaydet
            chart_file = os.path.join(output_dir, "memory_usage_chart.png")
            plt.savefig(chart_file)
            plt.close()
            
            charts.append({
                "title": "Bellek Kullanımı",
                "file": chart_file,
                "description": "Farklı model ve framework'ler için bellek kullanımı karşılaştırması"
            })
            
            logger.info(f"Bellek kullanımı grafiği oluşturuldu: {chart_file}")
        except Exception as e:
            logger.error(f"Bellek kullanımı grafiği oluşturulurken hata: {e}")
    
    return charts

def create_combined_report(html_reports, benchmark_results, charts, output_file):
    """Birleştirilmiş raporu oluştur."""
    # HTML şablonu
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GPU Mimarileri Uyumluluk Test Sonuçları</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            h1, h2, h3 {
                color: #2c3e50;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .section {
                margin-bottom: 30px;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .chart {
                margin: 20px 0;
                text-align: center;
            }
            .chart img {
                max-width: 100%;
                height: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                padding: 12px 15px;
                border: 1px solid #ddd;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .summary {
                background-color: #e8f4f8;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .report-section {
                margin-top: 30px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>GPU Mimarileri Uyumluluk Test Sonuçları</h1>
            
            <div class="section summary">
                <h2>Özet</h2>
                <p>Bu rapor, ALT_LAS projesinin farklı GPU mimarileri üzerindeki uyumluluğunu test etmek için yapılan testlerin sonuçlarını içermektedir.</p>
                <p>Test Tarihi: {test_date}</p>
            </div>
            
            <div class="section">
                <h2>Performans Grafikleri</h2>
                {charts_html}
            </div>
            
            <div class="section">
                <h2>Test Sonuçları</h2>
                {reports_html}
            </div>
        </div>
    </body>
    </html>
    """
    
    # Grafikleri HTML'e dönüştür
    charts_html = ""
    for chart in charts:
        charts_html += f"""
        <div class="chart">
            <h3>{chart['title']}</h3>
            <img src="{os.path.basename(chart['file'])}" alt="{chart['title']}">
            <p>{chart['description']}</p>
        </div>
        """
    
    # Raporları HTML'e dönüştür
    reports_html = ""
    for report_type in ["functional", "performance", "compatibility"]:
        reports_of_type = [r for r in html_reports if report_type in r["type"]]
        if reports_of_type:
            reports_html += f"""
            <div class="report-section">
                <h3>{report_type.capitalize()} Test Sonuçları</h3>
            """
            
            for report in reports_of_type:
                # BeautifulSoup ile HTML içeriğini ayrıştır
                soup = BeautifulSoup(report["content"], "html.parser")
                
                # Başlık ve özet bilgilerini çıkar
                title = soup.find("h1")
                title_text = title.text if title else os.path.basename(report["file"])
                
                # Sonuç tablosunu çıkar
                results_table = soup.find("table", {"id": "results-table"})
                table_html = str(results_table) if results_table else "<p>Sonuç tablosu bulunamadı.</p>"
                
                reports_html += f"""
                <h4>{title_text}</h4>
                {table_html}
                <p><a href="{os.path.basename(report['file'])}" target="_blank">Detaylı raporu görüntüle</a></p>
                """
            
            reports_html += "</div>"
    
    # HTML şablonunu doldur
    from datetime import datetime
    html_content = html_template.format(
        test_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        charts_html=charts_html,
        reports_html=reports_html
    )
    
    # Raporu kaydet
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    logger.info(f"Birleştirilmiş rapor oluşturuldu: {output_file}")
    
    # Grafikleri ve orijinal raporları kopyala
    output_dir = os.path.dirname(output_file)
    for chart in charts:
        os.system(f"cp {chart['file']} {output_dir}/")
    
    for report in html_reports:
        os.system(f"cp {report['file']} {output_dir}/")
    
    logger.info(f"Grafikler ve orijinal raporlar kopyalandı: {output_dir}")

def main():
    """Ana fonksiyon."""
    args = parse_args()
    
    # Giriş dizinini kontrol et
    if not os.path.isdir(args.input_dir):
        logger.error(f"Giriş dizini bulunamadı: {args.input_dir}")
        return 1
    
    # Çıkış dizinini oluştur
    output_dir = os.path.dirname(args.output_file)
    os.makedirs(output_dir, exist_ok=True)
    
    # HTML raporlarını çıkar
    html_reports = extract_html_reports(args.input_dir)
    logger.info(f"{len(html_reports)} HTML raporu bulundu")
    
    # Benchmark sonuçlarını çıkar
    benchmark_results = extract_benchmark_results(args.input_dir)
    logger.info(f"{len(benchmark_results)} benchmark sonucu bulundu")
    
    # Performans grafiklerini oluştur
    charts = generate_performance_charts(benchmark_results, output_dir)
    logger.info(f"{len(charts)} performans grafiği oluşturuldu")
    
    # Birleştirilmiş raporu oluştur
    create_combined_report(html_reports, benchmark_results, charts, args.output_file)
    
    return 0

if __name__ == "__main__":
    exit(main())
