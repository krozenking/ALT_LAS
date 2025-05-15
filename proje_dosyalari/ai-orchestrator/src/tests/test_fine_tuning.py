"""
Tests for model fine-tuning functionality.

This module contains tests for the model fine-tuning module,
including data preparation, job creation, and model registration.
"""
import os
import asyncio
import unittest
import pytest
from unittest.mock import patch, MagicMock

from ..core.fine_tuning import (
    ModelFineTuner,
    FineTuningConfig,
    FineTuningMethod,
    DatasetFormat,
    FineTuningResult
)
from ..models.model import ModelInfo, ModelType


class TestModelFineTuner(unittest.TestCase):
    """Test cases for ModelFineTuner."""
    
    def setUp(self):
        """Set up test environment."""
        # Create mock model manager
        self.model_manager = MagicMock()
        
        # Create test model
        self.test_model = ModelInfo(
            model_id="test-model",
            name="Test Model",
            type=ModelType.LLM,
            description="Test model for fine-tuning",
            version="1.0",
            size=1024 * 1024 * 1024,  # 1 GB
            parameters=7 * 1000 * 1000 * 1000,  # 7B
            supports_gpu=True,
            supports_cpu=True
        )
        
        # Set up model manager mock
        self.model_manager.get_model.return_value = asyncio.Future()
        self.model_manager.get_model.return_value.set_result(self.test_model)
        
        # Create fine-tuner
        self.fine_tuner = ModelFineTuner(self.model_manager)
        
        # Create test directories
        os.makedirs("test_data", exist_ok=True)
        os.makedirs("test_output", exist_ok=True)
        
        # Create test dataset
        with open("test_data/test_dataset.jsonl", "w") as f:
            f.write('{"text": "Test data 1"}\n')
            f.write('{"text": "Test data 2"}\n')
    
    def tearDown(self):
        """Clean up test environment."""
        # Remove test files
        if os.path.exists("test_data/test_dataset.jsonl"):
            os.remove("test_data/test_dataset.jsonl")
        
        # Remove test directories
        if os.path.exists("test_data/prepared"):
            import shutil
            shutil.rmtree("test_data/prepared")
    
    @pytest.mark.asyncio
    async def test_prepare_dataset(self):
        """Test preparing a dataset for fine-tuning."""
        # Prepare dataset
        output_path = await self.fine_tuner.prepare_dataset(
            dataset_path="test_data/test_dataset.jsonl",
            dataset_format=DatasetFormat.JSONL,
            output_format=DatasetFormat.JSONL
        )
        
        # Check that output file exists
        self.assertTrue(os.path.exists(output_path))
    
    @pytest.mark.asyncio
    async def test_create_fine_tuning_job(self):
        """Test creating a fine-tuning job."""
        # Create config
        config = FineTuningConfig(
            model_id="test-model",
            method=FineTuningMethod.LORA,
            dataset_path="test_data/test_dataset.jsonl",
            dataset_format=DatasetFormat.JSONL,
            output_dir="test_output"
        )
        
        # Create job
        job_id = await self.fine_tuner.create_fine_tuning_job(config)
        
        # Check that job was created
        self.assertIsNotNone(job_id)
        self.assertTrue(job_id in self.fine_tuner.jobs)
        self.assertEqual(self.fine_tuner.jobs[job_id].model_id, "test-model")
        self.assertEqual(self.fine_tuner.jobs[job_id].status, "created")
    
    @pytest.mark.asyncio
    async def test_get_fine_tuning_job(self):
        """Test getting information about a fine-tuning job."""
        # Create job
        config = FineTuningConfig(
            model_id="test-model",
            method=FineTuningMethod.LORA,
            dataset_path="test_data/test_dataset.jsonl",
            dataset_format=DatasetFormat.JSONL,
            output_dir="test_output"
        )
        job_id = await self.fine_tuner.create_fine_tuning_job(config)
        
        # Get job
        job = await self.fine_tuner.get_fine_tuning_job(job_id)
        
        # Check job info
        self.assertIsNotNone(job)
        self.assertEqual(job.job_id, job_id)
        self.assertEqual(job.model_id, "test-model")
    
    @pytest.mark.asyncio
    async def test_list_fine_tuning_jobs(self):
        """Test listing fine-tuning jobs."""
        # Create jobs
        config1 = FineTuningConfig(
            model_id="test-model",
            method=FineTuningMethod.LORA,
            dataset_path="test_data/test_dataset.jsonl",
            dataset_format=DatasetFormat.JSONL,
            output_dir="test_output"
        )
        config2 = FineTuningConfig(
            model_id="test-model-2",
            method=FineTuningMethod.FULL,
            dataset_path="test_data/test_dataset.jsonl",
            dataset_format=DatasetFormat.JSONL,
            output_dir="test_output"
        )
        
        # Mock second model
        test_model2 = self.test_model.copy()
        test_model2.model_id = "test-model-2"
        
        # Update model manager mock for second model
        original_get_model = self.model_manager.get_model
        
        async def mock_get_model(model_id):
            if model_id == "test-model":
                return self.test_model
            elif model_id == "test-model-2":
                return test_model2
            return None
            
        self.model_manager.get_model = mock_get_model
        
        # Create jobs
        job_id1 = await self.fine_tuner.create_fine_tuning_job(config1)
        job_id2 = await self.fine_tuner.create_fine_tuning_job(config2)
        
        # List all jobs
        jobs = await self.fine_tuner.list_fine_tuning_jobs()
        self.assertEqual(len(jobs), 2)
        
        # List jobs for specific model
        jobs = await self.fine_tuner.list_fine_tuning_jobs(model_id="test-model")
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0].model_id, "test-model")
        
        # Restore original get_model
        self.model_manager.get_model = original_get_model
    
    @pytest.mark.asyncio
    async def test_cancel_fine_tuning_job(self):
        """Test cancelling a fine-tuning job."""
        # Create job
        config = FineTuningConfig(
            model_id="test-model",
            method=FineTuningMethod.LORA,
            dataset_path="test_data/test_dataset.jsonl",
            dataset_format=DatasetFormat.JSONL,
            output_dir="test_output"
        )
        job_id = await self.fine_tuner.create_fine_tuning_job(config)
        
        # Cancel job
        result = await self.fine_tuner.cancel_fine_tuning_job(job_id)
        
        # Check result
        self.assertTrue(result)
        self.assertEqual(self.fine_tuner.jobs[job_id].status, "cancelled")


if __name__ == '__main__':
    unittest.main()
