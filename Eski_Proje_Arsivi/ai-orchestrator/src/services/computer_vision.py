"""
Computer Vision Service for AI Orchestrator.

This module provides computer vision capabilities including image processing,
OCR, and object detection using OpenCV and Tesseract.
"""

import os
import logging
import asyncio
import time
from typing import Dict, Any, List, Optional, Union, Tuple
import numpy as np
from datetime import datetime
import base64
import io
import cv2
import pytesseract
from PIL import Image

logger = logging.getLogger("ai_orchestrator.services.computer_vision")

class ComputerVisionService:
    """Computer Vision Service for image processing, OCR, and object detection"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Computer Vision Service.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        self.models = {}
        self.stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "processing_times": [],
            "ocr_requests": 0,
            "object_detection_requests": 0,
            "image_processing_requests": 0
        }
        
        # Set default configurations
        self.ocr_config = self.config.get("ocr", {
            "lang": "eng",
            "config": "--psm 3",  # Page segmentation mode: Fully automatic page segmentation, but no OSD
            "timeout": 30,
            "cache_enabled": True,
            "cache_size": 100
        })
        
        self.object_detection_config = self.config.get("object_detection", {
            "confidence_threshold": 0.5,
            "nms_threshold": 0.4,
            "model": "yolo",
            "cache_enabled": True,
            "cache_size": 50
        })
        
        self.image_processing_config = self.config.get("image_processing", {
            "default_resize": (800, 600),
            "default_format": "JPEG",
            "quality": 90,
            "cache_enabled": True,
            "cache_size": 200
        })
        
        # Initialize caches
        self.ocr_cache = {}
        self.object_detection_cache = {}
        self.image_processing_cache = {}
    
    async def initialize(self) -> bool:
        """
        Initialize the Computer Vision Service.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Initializing Computer Vision Service")
            
            # Check if OpenCV is available
            cv_version = cv2.__version__
            logger.info(f"OpenCV version: {cv_version}")
            
            # Check if Tesseract is available
            try:
                tesseract_version = pytesseract.get_tesseract_version()
                logger.info(f"Tesseract version: {tesseract_version}")
                
                # Set custom Tesseract path if provided in config
                if "tesseract_cmd" in self.ocr_config:
                    pytesseract.pytesseract.tesseract_cmd = self.ocr_config["tesseract_cmd"]
            except Exception as e:
                logger.warning(f"Tesseract not properly configured: {str(e)}")
                logger.warning("OCR functionality may be limited")
            
            # Load object detection models if specified
            if self.object_detection_config.get("preload_models", False):
                await self._load_object_detection_models()
            
            logger.info("Computer Vision Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing Computer Vision Service: {str(e)}")
            return False
    
    async def _load_object_detection_models(self) -> bool:
        """
        Load object detection models.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            model_type = self.object_detection_config.get("model", "yolo")
            
            if model_type == "yolo":
                # Load YOLOv4 model
                weights_path = self.object_detection_config.get("weights_path", "models/yolov4.weights")
                config_path = self.object_detection_config.get("config_path", "models/yolov4.cfg")
                
                if os.path.exists(weights_path) and os.path.exists(config_path):
                    logger.info(f"Loading YOLOv4 model from {weights_path} and {config_path}")
                    self.models["yolo"] = cv2.dnn.readNetFromDarknet(config_path, weights_path)
                    
                    # Load COCO class names
                    coco_names_path = self.object_detection_config.get("coco_names_path", "models/coco.names")
                    if os.path.exists(coco_names_path):
                        with open(coco_names_path, "r") as f:
                            self.models["coco_classes"] = f.read().strip().split("\n")
                    else:
                        logger.warning(f"COCO names file not found at {coco_names_path}")
                        # Use a minimal set of common classes as fallback
                        self.models["coco_classes"] = [
                            "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
                            "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
                            "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
                            "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
                            "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
                            "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
                            "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
                            "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
                            "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
                            "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
                        ]
                else:
                    logger.warning(f"YOLOv4 model files not found at {weights_path} and {config_path}")
                    logger.warning("Using OpenCV's built-in models as fallback")
                    
                    # Use OpenCV's built-in models as fallback
                    self.models["yolo"] = cv2.dnn.readNetFromDarknet(
                        "models/yolov3.cfg", 
                        "models/yolov3.weights"
                    )
            
            elif model_type == "ssd":
                # Load SSD model
                model_path = self.object_detection_config.get("model_path", "models/ssd_mobilenet.pb")
                config_path = self.object_detection_config.get("config_path", "models/ssd_mobilenet.pbtxt")
                
                if os.path.exists(model_path) and os.path.exists(config_path):
                    logger.info(f"Loading SSD model from {model_path} and {config_path}")
                    self.models["ssd"] = cv2.dnn.readNetFromTensorflow(model_path, config_path)
                else:
                    logger.warning(f"SSD model files not found at {model_path} and {config_path}")
            
            else:
                logger.warning(f"Unsupported object detection model type: {model_type}")
            
            logger.info("Object detection models loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading object detection models: {str(e)}")
            return False
    
    async def process_image(
        self, 
        image_data: Union[str, bytes, np.ndarray],
        operation: str = "enhance",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process an image with various operations.
        
        Args:
            image_data: Image data as base64 string, bytes, or numpy array
            operation: Operation to perform (enhance, resize, crop, etc.)
            parameters: Operation-specific parameters
            
        Returns:
            Dictionary with processed image and metadata
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        self.stats["image_processing_requests"] += 1
        
        try:
            # Convert image data to numpy array
            image = await self._load_image(image_data)
            
            # Generate cache key if caching is enabled
            cache_key = None
            if self.image_processing_config.get("cache_enabled", True):
                cache_key = self._generate_cache_key(image, operation, parameters)
                cached_result = self.image_processing_cache.get(cache_key)
                if cached_result:
                    logger.debug(f"Cache hit for image processing operation: {operation}")
                    return cached_result
            
            # Process image based on operation
            parameters = parameters or {}
            result = {}
            
            if operation == "enhance":
                processed_image = await self._enhance_image(
                    image,
                    brightness=parameters.get("brightness", 1.0),
                    contrast=parameters.get("contrast", 1.0),
                    sharpness=parameters.get("sharpness", 1.0)
                )
                result = {
                    "processed_image": self._encode_image(processed_image, parameters.get("format", "JPEG")),
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "resize":
                width = parameters.get("width", self.image_processing_config["default_resize"][0])
                height = parameters.get("height", self.image_processing_config["default_resize"][1])
                processed_image = await self._resize_image(image, width, height)
                result = {
                    "processed_image": self._encode_image(processed_image, parameters.get("format", "JPEG")),
                    "width": width,
                    "height": height,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "crop":
                x = parameters.get("x", 0)
                y = parameters.get("y", 0)
                width = parameters.get("width", image.shape[1] - x)
                height = parameters.get("height", image.shape[0] - y)
                processed_image = await self._crop_image(image, x, y, width, height)
                result = {
                    "processed_image": self._encode_image(processed_image, parameters.get("format", "JPEG")),
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "grayscale":
                processed_image = await self._convert_to_grayscale(image)
                result = {
                    "processed_image": self._encode_image(processed_image, parameters.get("format", "JPEG")),
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "blur":
                kernel_size = parameters.get("kernel_size", 5)
                processed_image = await self._blur_image(image, kernel_size)
                result = {
                    "processed_image": self._encode_image(processed_image, parameters.get("format", "JPEG")),
                    "kernel_size": kernel_size,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            elif operation == "edge_detection":
                threshold1 = parameters.get("threshold1", 100)
                threshold2 = parameters.get("threshold2", 200)
                processed_image = await self._detect_edges(image, threshold1, threshold2)
                result = {
                    "processed_image": self._encode_image(processed_image, parameters.get("format", "JPEG")),
                    "threshold1": threshold1,
                    "threshold2": threshold2,
                    "operation": operation,
                    "parameters": parameters,
                    "success": True
                }
            
            else:
                raise ValueError(f"Unsupported image processing operation: {operation}")
            
            # Update cache if enabled
            if cache_key and self.image_processing_config.get("cache_enabled", True):
                # Manage cache size
                if len(self.image_processing_cache) >= self.image_processing_config.get("cache_size", 200):
                    # Remove oldest entry
                    oldest_key = next(iter(self.image_processing_cache))
                    del self.image_processing_cache[oldest_key]
                
                self.image_processing_cache[cache_key] = result
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["processing_times"].append(processing_time)
            self.stats["successful_requests"] += 1
            
            # Add processing time to result
            result["processing_time"] = processing_time
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            self.stats["failed_requests"] += 1
            
            return {
                "error": str(e),
                "operation": operation,
                "parameters": parameters or {},
                "success": False,
                "processing_time": time.time() - start_time
            }
    
    async def perform_ocr(
        self, 
        image_data: Union[str, bytes, np.ndarray],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform Optical Character Recognition (OCR) on an image.
        
        Args:
            image_data: Image data as base64 string, bytes, or numpy array
            parameters: OCR parameters
            
        Returns:
            Dictionary with OCR results and metadata
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        self.stats["ocr_requests"] += 1
        
        try:
            # Convert image data to numpy array
            image = await self._load_image(image_data)
            
            # Generate cache key if caching is enabled
            cache_key = None
            if self.ocr_config.get("cache_enabled", True):
                cache_key = self._generate_cache_key(image, "ocr", parameters)
                cached_result = self.ocr_cache.get(cache_key)
                if cached_result:
                    logger.debug("Cache hit for OCR operation")
                    return cached_result
            
            # Set OCR parameters
            parameters = parameters or {}
            lang = parameters.get("lang", self.ocr_config.get("lang", "eng"))
            config = parameters.get("config", self.ocr_config.get("config", "--psm 3"))
            
            # Preprocess image for better OCR results
            if parameters.get("preprocess", True):
                # Convert to grayscale
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                
                # Apply thresholding
                if parameters.get("threshold", True):
                    gray = cv2.threshold(
                        gray, 
                        parameters.get("threshold_value", 0), 
                        255, 
                        parameters.get("threshold_type", cv2.THRESH_BINARY | cv2.THRESH_OTSU)
                    )[1]
                
                # Apply noise reduction
                if parameters.get("denoise", True):
                    gray = cv2.medianBlur(gray, parameters.get("denoise_kernel", 3))
                
                # Use preprocessed image for OCR
                image = gray
            
            # Convert numpy array to PIL Image for pytesseract
            pil_image = Image.fromarray(image)
            
            # Perform OCR
            text = pytesseract.image_to_string(pil_image, lang=lang, config=config)
            
            # Get bounding boxes for text regions
            boxes = None
            if parameters.get("get_boxes", False):
                boxes_data = pytesseract.image_to_data(pil_image, lang=lang, config=config, output_type=pytesseract.Output.DICT)
                
                # Filter out empty text
                boxes = []
                for i in range(len(boxes_data["text"])):
                    if boxes_data["text"][i].strip():
                        boxes.append({
                            "text": boxes_data["text"][i],
                            "conf": boxes_data["conf"][i],
                            "x": boxes_data["left"][i],
                            "y": boxes_data["top"][i],
                            "width": boxes_data["width"][i],
                            "height": boxes_data["height"][i],
                            "block_num": boxes_data["block_num"][i],
                            "line_num": boxes_data["line_num"][i],
                            "word_num": boxes_data["word_num"][i]
                        })
            
            # Prepare result
            result = {
                "text": text,
                "lang": lang,
                "config": config,
                "success": True,
                "processing_time": time.time() - start_time
            }
            
            if boxes:
                result["boxes"] = boxes
            
            # Update cache if enabled
            if cache_key and self.ocr_config.get("cache_enabled", True):
                # Manage cache size
                if len(self.ocr_cache) >= self.ocr_config.get("cache_size", 100):
                    # Remove oldest entry
                    oldest_key = next(iter(self.ocr_cache))
                    del self.ocr_cache[oldest_key]
                
                self.ocr_cache[cache_key] = result
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["processing_times"].append(processing_time)
            self.stats["successful_requests"] += 1
            
            return result
            
        except Exception as e:
            logger.error(f"Error performing OCR: {str(e)}")
            self.stats["failed_requests"] += 1
            
            return {
                "error": str(e),
                "success": False,
                "processing_time": time.time() - start_time
            }
    
    async def detect_objects(
        self, 
        image_data: Union[str, bytes, np.ndarray],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect objects in an image.
        
        Args:
            image_data: Image data as base64 string, bytes, or numpy array
            parameters: Object detection parameters
            
        Returns:
            Dictionary with detected objects and metadata
        """
        start_time = time.time()
        self.stats["total_requests"] += 1
        self.stats["object_detection_requests"] += 1
        
        try:
            # Convert image data to numpy array
            image = await self._load_image(image_data)
            
            # Generate cache key if caching is enabled
            cache_key = None
            if self.object_detection_config.get("cache_enabled", True):
                cache_key = self._generate_cache_key(image, "object_detection", parameters)
                cached_result = self.object_detection_cache.get(cache_key)
                if cached_result:
                    logger.debug("Cache hit for object detection operation")
                    return cached_result
            
            # Set object detection parameters
            parameters = parameters or {}
            model_type = parameters.get("model", self.object_detection_config.get("model", "yolo"))
            confidence_threshold = parameters.get(
                "confidence_threshold", 
                self.object_detection_config.get("confidence_threshold", 0.5)
            )
            nms_threshold = parameters.get(
                "nms_threshold", 
                self.object_detection_config.get("nms_threshold", 0.4)
            )
            
            # Load model if not already loaded
            if model_type not in self.models:
                await self._load_object_detection_models()
            
            # Detect objects based on model type
            if model_type == "yolo" and "yolo" in self.models:
                detections = await self._detect_objects_yolo(
                    image, 
                    confidence_threshold, 
                    nms_threshold
                )
            elif model_type == "ssd" and "ssd" in self.models:
                detections = await self._detect_objects_ssd(
                    image, 
                    confidence_threshold, 
                    nms_threshold
                )
            else:
                # Fallback to OpenCV's built-in object detection
                logger.warning(f"Model {model_type} not loaded, using OpenCV's built-in object detection")
                detections = await self._detect_objects_opencv(
                    image, 
                    confidence_threshold
                )
            
            # Draw bounding boxes if requested
            annotated_image = None
            if parameters.get("draw_boxes", False):
                annotated_image = image.copy()
                for obj in detections:
                    x, y, w, h = obj["box"]
                    label = f"{obj['class']}: {obj['confidence']:.2f}"
                    color = (0, 255, 0)  # Green
                    
                    # Draw rectangle
                    cv2.rectangle(annotated_image, (x, y), (x + w, y + h), color, 2)
                    
                    # Draw label
                    cv2.putText(
                        annotated_image, 
                        label, 
                        (x, y - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 
                        0.5, 
                        color, 
                        2
                    )
            
            # Prepare result
            result = {
                "objects": detections,
                "count": len(detections),
                "model": model_type,
                "confidence_threshold": confidence_threshold,
                "success": True,
                "processing_time": time.time() - start_time
            }
            
            if annotated_image is not None:
                result["annotated_image"] = self._encode_image(
                    annotated_image, 
                    parameters.get("format", "JPEG")
                )
            
            # Update cache if enabled
            if cache_key and self.object_detection_config.get("cache_enabled", True):
                # Manage cache size
                if len(self.object_detection_cache) >= self.object_detection_config.get("cache_size", 50):
                    # Remove oldest entry
                    oldest_key = next(iter(self.object_detection_cache))
                    del self.object_detection_cache[oldest_key]
                
                self.object_detection_cache[cache_key] = result
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["processing_times"].append(processing_time)
            self.stats["successful_requests"] += 1
            
            return result
            
        except Exception as e:
            logger.error(f"Error detecting objects: {str(e)}")
            self.stats["failed_requests"] += 1
            
            return {
                "error": str(e),
                "success": False,
                "processing_time": time.time() - start_time
            }
    
    async def _detect_objects_yolo(
        self, 
        image: np.ndarray,
        confidence_threshold: float,
        nms_threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Detect objects using YOLOv4 model.
        
        Args:
            image: Image as numpy array
            confidence_threshold: Minimum confidence threshold
            nms_threshold: Non-maximum suppression threshold
            
        Returns:
            List of detected objects
        """
        # Get image dimensions
        height, width = image.shape[:2]
        
        # Create blob from image
        blob = cv2.dnn.blobFromImage(
            image, 
            1/255.0, 
            (416, 416), 
            swapRB=True, 
            crop=False
        )
        
        # Set input to the network
        self.models["yolo"].setInput(blob)
        
        # Get output layer names
        layer_names = self.models["yolo"].getLayerNames()
        output_layers = [layer_names[i - 1] for i in self.models["yolo"].getUnconnectedOutLayers()]
        
        # Forward pass
        outputs = self.models["yolo"].forward(output_layers)
        
        # Process outputs
        class_ids = []
        confidences = []
        boxes = []
        
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                if confidence > confidence_threshold:
                    # Object detected
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    # Rectangle coordinates
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        # Apply non-maximum suppression
        indices = cv2.dnn.NMSBoxes(boxes, confidences, confidence_threshold, nms_threshold)
        
        # Prepare results
        detections = []
        coco_classes = self.models.get("coco_classes", [])
        
        for i in indices:
            if isinstance(i, list):  # OpenCV 4.5.4 and earlier
                i = i[0]
                
            box = boxes[i]
            confidence = confidences[i]
            class_id = class_ids[i]
            
            # Get class name
            class_name = "unknown"
            if class_id < len(coco_classes):
                class_name = coco_classes[class_id]
            
            detections.append({
                "box": box,
                "confidence": confidence,
                "class_id": int(class_id),
                "class": class_name
            })
        
        return detections
    
    async def _detect_objects_ssd(
        self, 
        image: np.ndarray,
        confidence_threshold: float,
        nms_threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Detect objects using SSD model.
        
        Args:
            image: Image as numpy array
            confidence_threshold: Minimum confidence threshold
            nms_threshold: Non-maximum suppression threshold
            
        Returns:
            List of detected objects
        """
        # Get image dimensions
        height, width = image.shape[:2]
        
        # Create blob from image
        blob = cv2.dnn.blobFromImage(
            image, 
            size=(300, 300), 
            mean=(127.5, 127.5, 127.5), 
            scalefactor=0.007843, 
            swapRB=True
        )
        
        # Set input to the network
        self.models["ssd"].setInput(blob)
        
        # Forward pass
        detections = self.models["ssd"].forward()
        
        # Process outputs
        results = []
        
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            
            if confidence > confidence_threshold:
                # Get class ID
                class_id = int(detections[0, 0, i, 1])
                
                # Get bounding box coordinates
                box = detections[0, 0, i, 3:7] * np.array([width, height, width, height])
                (startX, startY, endX, endY) = box.astype("int")
                
                # Calculate width and height
                w = endX - startX
                h = endY - startY
                
                # Get class name
                class_name = f"class_{class_id}"
                coco_classes = self.models.get("coco_classes", [])
                if class_id < len(coco_classes):
                    class_name = coco_classes[class_id]
                
                results.append({
                    "box": [startX, startY, w, h],
                    "confidence": float(confidence),
                    "class_id": class_id,
                    "class": class_name
                })
        
        return results
    
    async def _detect_objects_opencv(
        self, 
        image: np.ndarray,
        confidence_threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Detect objects using OpenCV's built-in object detection.
        
        Args:
            image: Image as numpy array
            confidence_threshold: Minimum confidence threshold
            
        Returns:
            List of detected objects
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Detect eyes
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        eyes = eye_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Prepare results
        results = []
        
        # Add faces
        for (x, y, w, h) in faces:
            results.append({
                "box": [int(x), int(y), int(w), int(h)],
                "confidence": 1.0,  # Haar cascades don't provide confidence
                "class_id": 0,
                "class": "face"
            })
        
        # Add eyes
        for (x, y, w, h) in eyes:
            results.append({
                "box": [int(x), int(y), int(w), int(h)],
                "confidence": 1.0,  # Haar cascades don't provide confidence
                "class_id": 1,
                "class": "eye"
            })
        
        return results
    
    async def _load_image(self, image_data: Union[str, bytes, np.ndarray]) -> np.ndarray:
        """
        Load image from various formats.
        
        Args:
            image_data: Image data as base64 string, bytes, or numpy array
            
        Returns:
            Image as numpy array
        """
        if isinstance(image_data, np.ndarray):
            return image_data
        
        if isinstance(image_data, str):
            # Check if it's a base64 string
            if image_data.startswith(('data:image/', 'base64:')):
                # Extract base64 data
                if image_data.startswith('data:image/'):
                    image_data = image_data.split(',', 1)[1]
                elif image_data.startswith('base64:'):
                    image_data = image_data[7:]
                
                # Decode base64
                image_data = base64.b64decode(image_data)
            else:
                # Assume it's a file path
                if os.path.exists(image_data):
                    with open(image_data, 'rb') as f:
                        image_data = f.read()
                else:
                    raise FileNotFoundError(f"Image file not found: {image_data}")
        
        # Convert bytes to numpy array
        if isinstance(image_data, bytes):
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("Failed to decode image data")
            return image
        
        raise ValueError("Unsupported image data format")
    
    def _encode_image(self, image: np.ndarray, format: str = "JPEG") -> str:
        """
        Encode image as base64 string.
        
        Args:
            image: Image as numpy array
            format: Output format (JPEG, PNG)
            
        Returns:
            Base64 encoded image string
        """
        # Convert format string to OpenCV format
        if format.upper() == "JPEG":
            ext = ".jpg"
            cv_format = cv2.IMREAD_COLOR
        elif format.upper() == "PNG":
            ext = ".png"
            cv_format = cv2.IMREAD_UNCHANGED
        else:
            ext = ".jpg"
            cv_format = cv2.IMREAD_COLOR
        
        # Encode image
        success, buffer = cv2.imencode(ext, image)
        if not success:
            raise ValueError("Failed to encode image")
        
        # Convert to base64
        encoded = base64.b64encode(buffer).decode('utf-8')
        
        # Return with data URI prefix
        return f"data:image/{ext[1:]};base64,{encoded}"
    
    def _generate_cache_key(
        self, 
        image: np.ndarray,
        operation: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate cache key for image operations.
        
        Args:
            image: Image as numpy array
            operation: Operation name
            parameters: Operation parameters
            
        Returns:
            Cache key string
        """
        # Create a simplified image hash
        # Resize to small dimensions to speed up hashing
        small_img = cv2.resize(image, (32, 32))
        img_hash = hash(small_img.tobytes())
        
        # Create parameters hash
        params_str = json.dumps(parameters or {}, sort_keys=True)
        params_hash = hash(params_str)
        
        # Combine hashes
        return f"{operation}_{img_hash}_{params_hash}"
    
    async def _enhance_image(
        self, 
        image: np.ndarray,
        brightness: float = 1.0,
        contrast: float = 1.0,
        sharpness: float = 1.0
    ) -> np.ndarray:
        """
        Enhance image with brightness, contrast, and sharpness adjustments.
        
        Args:
            image: Image as numpy array
            brightness: Brightness factor (1.0 = original)
            contrast: Contrast factor (1.0 = original)
            sharpness: Sharpness factor (1.0 = original)
            
        Returns:
            Enhanced image
        """
        # Apply brightness adjustment
        if brightness != 1.0:
            if brightness > 1.0:
                # Increase brightness
                image = cv2.convertScaleAbs(image, alpha=brightness, beta=0)
            else:
                # Decrease brightness
                image = cv2.convertScaleAbs(image, alpha=brightness, beta=0)
        
        # Apply contrast adjustment
        if contrast != 1.0:
            # Calculate alpha and beta values for contrast adjustment
            alpha = float(131 * (contrast + 127)) / (127 * (131 - contrast))
            beta = 127 * (1 - alpha)
            
            # Apply contrast adjustment
            image = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
        
        # Apply sharpness adjustment
        if sharpness != 1.0:
            # Create sharpening kernel
            kernel = np.array([[-1, -1, -1],
                              [-1,  9, -1],
                              [-1, -1, -1]]) * sharpness
            
            # Apply kernel
            image = cv2.filter2D(image, -1, kernel)
        
        return image
    
    async def _resize_image(
        self, 
        image: np.ndarray,
        width: int,
        height: int
    ) -> np.ndarray:
        """
        Resize image to specified dimensions.
        
        Args:
            image: Image as numpy array
            width: Target width
            height: Target height
            
        Returns:
            Resized image
        """
        return cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
    
    async def _crop_image(
        self, 
        image: np.ndarray,
        x: int,
        y: int,
        width: int,
        height: int
    ) -> np.ndarray:
        """
        Crop image to specified region.
        
        Args:
            image: Image as numpy array
            x: X coordinate of top-left corner
            y: Y coordinate of top-left corner
            width: Width of crop region
            height: Height of crop region
            
        Returns:
            Cropped image
        """
        # Ensure coordinates are within image bounds
        img_height, img_width = image.shape[:2]
        x = max(0, min(x, img_width - 1))
        y = max(0, min(y, img_height - 1))
        width = max(1, min(width, img_width - x))
        height = max(1, min(height, img_height - y))
        
        return image[y:y+height, x:x+width]
    
    async def _convert_to_grayscale(self, image: np.ndarray) -> np.ndarray:
        """
        Convert image to grayscale.
        
        Args:
            image: Image as numpy array
            
        Returns:
            Grayscale image
        """
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    async def _blur_image(
        self, 
        image: np.ndarray,
        kernel_size: int
    ) -> np.ndarray:
        """
        Apply Gaussian blur to image.
        
        Args:
            image: Image as numpy array
            kernel_size: Blur kernel size
            
        Returns:
            Blurred image
        """
        # Ensure kernel size is odd
        if kernel_size % 2 == 0:
            kernel_size += 1
        
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    async def _detect_edges(
        self, 
        image: np.ndarray,
        threshold1: int,
        threshold2: int
    ) -> np.ndarray:
        """
        Detect edges in image using Canny edge detector.
        
        Args:
            image: Image as numpy array
            threshold1: First threshold for hysteresis procedure
            threshold2: Second threshold for hysteresis procedure
            
        Returns:
            Edge image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply Canny edge detector
        edges = cv2.Canny(gray, threshold1, threshold2)
        
        return edges
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get service statistics.
        
        Returns:
            Dictionary of statistics
        """
        stats = self.stats.copy()
        
        # Calculate average processing time
        if stats["processing_times"]:
            stats["average_processing_time"] = sum(stats["processing_times"]) / len(stats["processing_times"])
        else:
            stats["average_processing_time"] = 0
        
        # Remove raw processing times list to reduce size
        stats.pop("processing_times", None)
        
        return stats
