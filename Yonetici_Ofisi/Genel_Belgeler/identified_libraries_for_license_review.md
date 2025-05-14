# Identified Libraries and Modules for License Review

This document lists the libraries, tools, and technologies identified from the CUDA integration plans (`cuda_integration_plan.md` and `cuda_master_integration_plan.md`) that require a license review to ensure compatibility with commercial, closed-source distribution of the ALT_LAS project. The user has specified that all components must use "free" licenses that permit such distribution.

## Core Technologies & SDKs

1.  **NVIDIA CUDA Toolkit:** (Includes cuBLAS, cuFFT, cuDNN, Thrust, etc.) - License: NVIDIA CUDA Toolkit EULA.
2.  **NVIDIA Drivers:** License: NVIDIA Software License Agreement.
3.  **NVIDIA Nsight Suite (Systems, Compute, Graphics):** License: NVIDIA Software License Agreement (typically for development tools).
4.  **NVIDIA TensorRT:** License: NVIDIA TensorRT EULA (for optimizing and deploying models).
5.  **NVIDIA Container Toolkit:** License: NVIDIA related EULA/Apache 2.0 for parts.
6.  **NVIDIA DCGM (Data Center GPU Manager):** License: NVIDIA EULA.

## Programming Languages & Compilers

1.  **Python:** License: Python Software Foundation License (PSF).
2.  **C/C++ Compilers (e.g., GCC, Clang, MSVC):** Licenses: GPL (for GCC with runtime exception), Apache 2.0 (for Clang), Microsoft specific (for MSVC).

## AI/ML Frameworks & Libraries

1.  **TensorFlow:** License: Apache 2.0.
2.  **PyTorch:** License: BSD-style (modified).
3.  **Llama.cpp:** License: MIT License.
4.  **CuPy:** License: MIT License.
5.  **Numba (specifically its CUDA features):** License: BSD 2-Clause.
6.  **RAPIDS (cuML, cuDF):** License: Apache 2.0.

## Development & Testing Tools (Primarily for development, but review if any part is distributed)

1.  **Python cProfile, Py-Spy:** Licenses: Standard library (PSF) or permissive (e.g., MIT for Py-Spy).
2.  **Google Test:** License: BSD 3-Clause.
3.  **PyTest:** License: MIT License.

## Deployment & Orchestration

1.  **Docker:** License: Apache 2.0 (for Docker Engine).
2.  **Kubernetes:** License: Apache 2.0.
3.  **NVIDIA Device Plugin for Kubernetes:** License: Apache 2.0.

## Monitoring & Visualization Tools (Review if distributed or if their client libraries are bundled)

1.  **Prometheus:** License: Apache 2.0.
2.  **Grafana:** License: AGPLv3 for Grafana OSS (problematic for closed-source commercial distribution if Grafana OSS itself is distributed or its UI components are deeply integrated and distributed). Apache 2.0 for Grafana Enterprise (requires commercial license from Grafana Labs). *Self-hosted/internal use of Grafana OSS is generally fine, but distributing it as part of a commercial product is not, due to AGPL.* Client libraries used to send data to Prometheus/Grafana are usually permissively licensed.

## Web Technologies (If client-side GPU acceleration is implemented)

1.  **WebGPU:** This is a web standard. Implementations in browsers (e.g., Dawn in Chrome, wgpu in Firefox) have their own licenses (typically permissive like Apache 2.0 or MPL 2.0). If any specific WebGPU *library* is bundled in a desktop application or similar, its license needs checking.

## Next Steps

The next step is to analyze the EULAs and licenses for each of these components to confirm their compatibility with the project's commercial, closed-source distribution requirements, ensuring they are "free" in the sense of not imposing royalty fees for distribution and allowing proprietary derivative works.

