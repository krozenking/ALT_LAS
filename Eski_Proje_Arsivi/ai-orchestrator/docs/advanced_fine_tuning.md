# Advanced Model Fine-tuning

This document provides an overview of the advanced model fine-tuning features implemented for the AI Orchestrator component of the ALT_LAS project.

## Overview

The advanced model fine-tuning system allows AI models to be customized for specific use cases, improving their performance on domain-specific tasks. This is achieved through various fine-tuning methods, data preparation techniques, and evaluation metrics.

### Key Components

#### ModelFineTuner

The main class that manages the fine-tuning process. It provides the following functionality:

- **Dataset Preparation**: Prepares datasets for fine-tuning, including preprocessing and format conversion
- **Fine-tuning Job Management**: Creates, monitors, and manages fine-tuning jobs
- **Model Registration**: Registers fine-tuned models with the model manager

#### Fine-tuning Methods

Several fine-tuning methods are supported:

- **FULL**: Traditional full fine-tuning of all model parameters
- **LORA**: Low-Rank Adaptation, which fine-tunes a small number of adapter parameters
- **QLORA**: Quantized Low-Rank Adaptation, which uses quantization to reduce memory requirements
- **PREFIX_TUNING**: Adds trainable prefix tokens to the input
- **PROMPT_TUNING**: Trains continuous prompt embeddings while keeping the model frozen

#### Dataset Formats

The system supports various dataset formats:

- **JSONL**: JSON Lines format, with one example per line
- **CSV**: Comma-separated values
- **TEXT**: Plain text files
- **HUGGINGFACE**: Datasets from the Hugging Face Hub
- **CUSTOM**: Custom formats with user-defined loaders

### Usage Examples

```python
# Get the model fine-tuner
from ai_orchestrator.core.fine_tuning import get_model_fine_tuner, FineTuningConfig, FineTuningMethod, DatasetFormat

fine_tuner = get_model_fine_tuner()

# Prepare a dataset
prepared_dataset = await fine_tuner.prepare_dataset(
    dataset_path="data/raw_dataset.csv",
    dataset_format=DatasetFormat.CSV,
    output_format=DatasetFormat.JSONL,
    preprocessing_steps=[
        {"type": "filter", "condition": "length > 10"},
        {"type": "transform", "operation": "lowercase"}
    ]
)

# Create a fine-tuning configuration
config = FineTuningConfig(
    model_id="llama-7b",
    method=FineTuningMethod.LORA,
    dataset_path=prepared_dataset,
    dataset_format=DatasetFormat.JSONL,
    output_dir="models/fine_tuned",
    epochs=3,
    batch_size=8,
    learning_rate=2e-5,
    lora_rank=8,
    lora_alpha=16
)

# Create and start a fine-tuning job
job_id = await fine_tuner.create_fine_tuning_job(config)

# Monitor job progress
job = await fine_tuner.get_fine_tuning_job(job_id)
print(f"Job status: {job.status}")

# Register the fine-tuned model when complete
if job.status == "completed":
    model_id = await fine_tuner.register_fine_tuned_model(job_id)
    print(f"Registered fine-tuned model: {model_id}")
```

## Fine-tuning Process

### 1. Dataset Preparation

Before fine-tuning, datasets often need to be prepared:

- **Format Conversion**: Converting between different formats
- **Filtering**: Removing examples that don't meet certain criteria
- **Transformation**: Applying operations like lowercasing, tokenization, etc.
- **Augmentation**: Creating additional examples through techniques like back-translation

### 2. Fine-tuning Configuration

The fine-tuning process is controlled by a configuration that specifies:

- **Model**: The base model to fine-tune
- **Method**: The fine-tuning method to use
- **Dataset**: The prepared dataset
- **Hyperparameters**: Learning rate, batch size, epochs, etc.
- **Output**: Where to save the fine-tuned model

### 3. Job Execution

Fine-tuning jobs run asynchronously:

- **Creation**: Jobs are created with a configuration
- **Execution**: Jobs run in the background
- **Monitoring**: Progress can be monitored through the API
- **Completion**: When complete, the fine-tuned model is saved

### 4. Model Registration

After fine-tuning, models can be registered with the model manager:

- **Registration**: The fine-tuned model is registered with a new ID
- **Metadata**: Information about the fine-tuning process is stored
- **Availability**: The model becomes available for inference

## Integration with Existing System

The advanced model fine-tuning system integrates with the existing AI Orchestrator:

- It uses the same model manager for model information
- Fine-tuned models can be used with the existing inference API
- It complements the distributed execution and enhanced model selection systems

## Performance Considerations

### Memory Usage

- **Full Fine-tuning**: Requires significant memory (2-3x model size)
- **Parameter-Efficient Methods**: LORA, QLORA, etc. require much less memory
- **Quantization**: 4-bit and 8-bit quantization further reduce memory requirements

### Training Time

- **Full Fine-tuning**: Slowest but potentially most effective
- **Parameter-Efficient Methods**: Faster training with comparable results
- **Batch Size**: Larger batch sizes can speed up training but require more memory

### Model Quality

- **Dataset Quality**: Better datasets lead to better fine-tuned models
- **Hyperparameters**: Proper tuning of hyperparameters is crucial
- **Evaluation**: Regular evaluation during training helps prevent overfitting

## Future Enhancements

Potential future enhancements include:

- **Distributed Fine-tuning**: Leveraging multiple machines for faster training
- **Automated Hyperparameter Optimization**: Finding optimal hyperparameters automatically
- **More Fine-tuning Methods**: Supporting additional parameter-efficient methods
- **Better Evaluation Metrics**: More comprehensive evaluation of fine-tuned models
- **Model Merging**: Combining multiple fine-tuned models

## Testing

Comprehensive test suite is provided:

- **test_fine_tuning.py**: Tests for dataset preparation, job creation, and model registration

Run the tests using pytest:

```bash
cd ai-orchestrator
python -m pytest src/tests/test_fine_tuning.py -v
```
