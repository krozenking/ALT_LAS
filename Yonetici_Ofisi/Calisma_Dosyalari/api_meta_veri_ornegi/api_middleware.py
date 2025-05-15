"""
API Meta Veri Middleware

Bu modül, API yanıtlarına GPU kaynak kullanımı ve işlem süresi gibi
performans metriklerini ekleyen middleware bileşenlerini içerir.

Örnek Kullanım:
    from api_middleware import MetadataMiddleware
    
    # FastAPI için
    app = FastAPI()
    app.add_middleware(MetadataMiddleware)
    
    # Flask için
    app = Flask(__name__)
    app.wsgi_app = MetadataMiddleware(app.wsgi_app)
"""

import time
import uuid
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Callable, Optional

from gpu_metadata_collector import collect_gpu_metrics

# Loglama
logger = logging.getLogger(__name__)


class FastAPIMetadataMiddleware:
    """
    FastAPI için meta veri middleware'i.
    """
    
    def __init__(self, app):
        """
        Middleware'i başlatır.
        
        Args:
            app: FastAPI uygulaması
        """
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """
        ASGI middleware çağrısı.
        
        Args:
            scope: ASGI scope
            receive: ASGI receive fonksiyonu
            send: ASGI send fonksiyonu
        """
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Orijinal yanıtı yakalamak için özel bir send fonksiyonu
        async def send_with_metadata(message):
            if message["type"] == "http.response.start":
                # Yanıt başlangıcı, meta verileri hazırla
                pass
            
            if message["type"] == "http.response.body":
                # Yanıt gövdesi, meta verileri ekle
                body = message.get("body", b"")
                if body:
                    try:
                        response_data = json.loads(body.decode())
                        
                        # Meta verileri topla
                        end_time = time.time()
                        processing_time = (end_time - start_time) * 1000  # ms cinsinden
                        gpu_metrics = collect_gpu_metrics()
                        
                        # Meta verileri yanıta ekle
                        response_data["meta"] = {
                            "request_id": request_id,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "processing_time": {
                                "total_ms": processing_time
                            },
                            "gpu_resources": gpu_metrics,
                            "trace_id": request_id,
                            "version": "1.0"
                        }
                        
                        # Güncellenmiş yanıtı gönder
                        message["body"] = json.dumps(response_data).encode()
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        # JSON olmayan yanıtlar için işlem yapma
                        logger.debug("Non-JSON response, skipping metadata addition")
            
            await send(message)
        
        await self.app(scope, receive, send_with_metadata)


class FlaskMetadataMiddleware:
    """
    Flask için meta veri middleware'i.
    """
    
    def __init__(self, app):
        """
        Middleware'i başlatır.
        
        Args:
            app: Flask WSGI uygulaması
        """
        self.app = app
    
    def __call__(self, environ, start_response):
        """
        WSGI middleware çağrısı.
        
        Args:
            environ: WSGI environ
            start_response: WSGI start_response fonksiyonu
            
        Returns:
            WSGI yanıtı
        """
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Orijinal yanıtı yakalamak için özel bir start_response fonksiyonu
        def custom_start_response(status, headers, exc_info=None):
            return start_response(status, headers, exc_info)
        
        # Orijinal uygulamayı çağır
        response_iter = self.app(environ, custom_start_response)
        
        # Yanıtı topla
        response_data = b"".join(response_iter)
        
        try:
            # JSON yanıtı parse et
            json_data = json.loads(response_data.decode())
            
            # Meta verileri topla
            end_time = time.time()
            processing_time = (end_time - start_time) * 1000  # ms cinsinden
            gpu_metrics = collect_gpu_metrics()
            
            # Meta verileri yanıta ekle
            json_data["meta"] = {
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "processing_time": {
                    "total_ms": processing_time
                },
                "gpu_resources": gpu_metrics,
                "trace_id": request_id,
                "version": "1.0"
            }
            
            # Güncellenmiş yanıtı döndür
            return [json.dumps(json_data).encode()]
        except (json.JSONDecodeError, UnicodeDecodeError):
            # JSON olmayan yanıtlar için orijinal yanıtı döndür
            logger.debug("Non-JSON response, skipping metadata addition")
            return [response_data]


class AsyncMiddlewareBase:
    """
    Asenkron middleware için temel sınıf.
    """
    
    def __init__(self, app):
        """
        Middleware'i başlatır.
        
        Args:
            app: ASGI uygulaması
        """
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """
        ASGI middleware çağrısı.
        
        Args:
            scope: ASGI scope
            receive: ASGI receive fonksiyonu
            send: ASGI send fonksiyonu
        """
        raise NotImplementedError("Subclasses must implement __call__")


class MetadataMiddleware(AsyncMiddlewareBase):
    """
    Genel amaçlı meta veri middleware'i.
    
    Bu middleware, FastAPI, Starlette veya diğer ASGI uyumlu
    framework'ler ile kullanılabilir.
    """
    
    async def __call__(self, scope, receive, send):
        """
        ASGI middleware çağrısı.
        
        Args:
            scope: ASGI scope
            receive: ASGI receive fonksiyonu
            send: ASGI send fonksiyonu
        """
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Yanıt verilerini toplamak için buffer
        response_body = []
        response_headers = []
        response_status = 0
        
        # Özel send fonksiyonu
        async def send_with_metadata(message):
            nonlocal response_status
            
            if message["type"] == "http.response.start":
                response_status = message["status"]
                response_headers.extend(message["headers"])
                await send(message)
            
            elif message["type"] == "http.response.body":
                body = message.get("body", b"")
                more_body = message.get("more_body", False)
                
                if body:
                    response_body.append(body)
                
                if not more_body:
                    # Tüm yanıt gövdesi alındı, meta verileri ekle
                    full_body = b"".join(response_body)
                    
                    try:
                        # JSON yanıtı parse et
                        json_data = json.loads(full_body.decode())
                        
                        # Meta verileri topla
                        end_time = time.time()
                        processing_time = (end_time - start_time) * 1000  # ms cinsinden
                        gpu_metrics = collect_gpu_metrics()
                        
                        # Meta verileri yanıta ekle
                        json_data["meta"] = {
                            "request_id": request_id,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "processing_time": {
                                "total_ms": processing_time
                            },
                            "gpu_resources": gpu_metrics,
                            "trace_id": request_id,
                            "version": "1.0"
                        }
                        
                        # Güncellenmiş yanıtı gönder
                        updated_body = json.dumps(json_data).encode()
                        await send({
                            "type": "http.response.body",
                            "body": updated_body,
                            "more_body": False
                        })
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        # JSON olmayan yanıtlar için orijinal yanıtı gönder
                        logger.debug("Non-JSON response, skipping metadata addition")
                        await send(message)
                else:
                    # Daha fazla veri bekleniyor, orijinal mesajı gönder
                    await send(message)
            else:
                # Diğer mesaj türleri için orijinal mesajı gönder
                await send(message)
        
        # Uygulamayı çağır
        await self.app(scope, receive, send_with_metadata)


# Örnek kullanım
if __name__ == "__main__":
    # Loglama yapılandırması
    logging.basicConfig(level=logging.INFO)
    
    # FastAPI örneği
    try:
        from fastapi import FastAPI
        
        app = FastAPI()
        app.add_middleware(MetadataMiddleware)
        
        @app.get("/api/v1/example")
        async def example():
            return {"message": "Hello, World!"}
        
        print("FastAPI example configured with MetadataMiddleware")
    except ImportError:
        print("FastAPI not installed, skipping example")
    
    # Flask örneği
    try:
        from flask import Flask, jsonify
        
        app = Flask(__name__)
        app.wsgi_app = FlaskMetadataMiddleware(app.wsgi_app)
        
        @app.route("/api/v1/example")
        def flask_example():
            return jsonify({"message": "Hello, World!"})
        
        print("Flask example configured with FlaskMetadataMiddleware")
    except ImportError:
        print("Flask not installed, skipping example")
