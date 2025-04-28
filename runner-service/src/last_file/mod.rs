pub mod generator;
pub mod models;
pub mod writer;
pub mod processor;

// Keep only used exports if any, or remove all if none are used externally.
// Based on cargo check warnings, these seem unused within the crate.
// pub use models::{LastFile, LastFileStatus, Artifact, ArtifactType, ExecutionGraph, ExecutionNode, ExecutionEdge, DependencyType};
// pub use generator::{generate_last_file, generate_failure_last_file, enhance_last_file_with_ai, extract_artifacts_from_results, generate_execution_graph_visualization};
// pub use writer::{write_last_file, read_last_file, write_last_file_summary, write_compressed_last_file, read_compressed_last_file, create_last_file_archive, export_last_file_to_html};
// pub use processor::{LastFileProcessor, LastFileProcessorConfig};

