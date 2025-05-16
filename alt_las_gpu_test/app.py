# app.py
import os
import yaml
import logging
from flask import Flask, jsonify

# Logger oluştur
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('app')

# Flask uygulaması oluştur
app = Flask(__name__)

# Konfigürasyon dosyasını yükle
config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
with open(config_path, 'r') as f:
    config = yaml.safe_load(f)

# GPU API'sini başlat
from api_extensions import init_gpu_api
init_gpu_api(app, config)

@app.route('/', methods=['GET'])
def index():
    """Ana sayfa."""
    return jsonify({
        'name': 'ALT_LAS GPU Test',
        'version': '1.0.0',
        'description': 'ALT_LAS GPU Test API'
    })

@app.route('/health', methods=['GET'])
def health():
    """Sağlık kontrolü."""
    return jsonify({
        'status': 'ok',
        'message': 'API çalışıyor'
    })

if __name__ == '__main__':
    # SSL'i devre dışı bırak
    import os
    os.environ['WERKZEUG_RUN_MAIN'] = 'true'
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    os.environ['FLASK_APP'] = 'app.py'

    # HTTP kullanarak çalıştır
    app.run(host='0.0.0.0', port=8000, debug=True, ssl_context=None)
