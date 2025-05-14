"""
Prioritization Visualizer Module

This module provides visualization utilities for task prioritization results.
It generates various visualization formats for prioritized task segments.
"""

import json
import matplotlib.pyplot as plt
import networkx as nx
from typing import Dict, List, Any, Optional
import os
import base64
from io import BytesIO
import logging
from dsl_schema import AltFile, TaskSegment

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("prioritization-visualizer")

class PrioritizationVisualizer:
    """
    Visualizer for task prioritization results
    """
    
    def __init__(self):
        """
        Initialize the prioritization visualizer
        """
        self.output_dir = os.path.join(os.getcwd(), "visualizations")
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_dependency_graph(self, alt_file: AltFile, output_format: str = "png") -> Dict[str, Any]:
        """
        Generate a dependency graph visualization for a prioritized ALT file
        
        Args:
            alt_file: Prioritized ALT file
            output_format: Output format (png, svg, json)
            
        Returns:
            Visualization data
        """
        try:
            # Create a directed graph
            G = nx.DiGraph()
            
            # Add nodes
            for segment in alt_file.segments:
                priority_score = segment.metadata.get("priority_score", 0)
                execution_order = segment.metadata.get("execution_order", 0)
                
                # Add node with attributes
                G.add_node(
                    segment.id,
                    task_type=segment.task_type,
                    content=segment.content,
                    priority_score=priority_score,
                    execution_order=execution_order
                )
            
            # Add edges (dependencies)
            for segment in alt_file.segments:
                for dependency in segment.dependencies:
                    G.add_edge(dependency, segment.id)
            
            # Generate visualization based on format
            if output_format in ["png", "svg"]:
                return self._generate_graph_image(G, alt_file.id, output_format)
            elif output_format == "json":
                return self._generate_graph_json(G, alt_file.id)
            else:
                raise ValueError(f"Unsupported output format: {output_format}")
        except Exception as e:
            logger.error(f"Error generating dependency graph: {str(e)}")
            raise
    
    def _generate_graph_image(self, G: nx.DiGraph, alt_file_id: str, output_format: str) -> Dict[str, Any]:
        """
        Generate a graph image visualization
        
        Args:
            G: NetworkX graph
            alt_file_id: ALT file ID
            output_format: Output format (png, svg)
            
        Returns:
            Visualization data
        """
        try:
            # Create figure
            plt.figure(figsize=(12, 8))
            
            # Get node attributes
            node_colors = []
            node_sizes = []
            labels = {}
            
            for node in G.nodes():
                # Set node color based on task type
                task_type = G.nodes[node].get("task_type", "unknown")
                if task_type == "search":
                    node_colors.append("skyblue")
                elif task_type == "create":
                    node_colors.append("lightgreen")
                elif task_type == "analyze":
                    node_colors.append("salmon")
                else:
                    node_colors.append("lightgray")
                
                # Set node size based on priority score
                priority_score = G.nodes[node].get("priority_score", 0)
                node_sizes.append(300 + (priority_score * 500))
                
                # Set node label
                content = G.nodes[node].get("content", "")
                if len(content) > 20:
                    content = content[:17] + "..."
                execution_order = G.nodes[node].get("execution_order", 0)
                labels[node] = f"{node}\n{content}\n(Order: {execution_order})"
            
            # Create layout
            pos = nx.spring_layout(G, seed=42)
            
            # Draw graph
            nx.draw(
                G,
                pos,
                with_labels=False,
                node_color=node_colors,
                node_size=node_sizes,
                arrows=True,
                arrowsize=20,
                width=2,
                edge_color="gray",
                alpha=0.8
            )
            
            # Draw labels
            nx.draw_networkx_labels(
                G,
                pos,
                labels=labels,
                font_size=8,
                font_family="sans-serif",
                font_weight="bold"
            )
            
            # Add title
            plt.title(f"Task Dependency Graph for {alt_file_id}")
            
            # Save to buffer
            buffer = BytesIO()
            plt.savefig(buffer, format=output_format, dpi=300, bbox_inches="tight")
            plt.close()
            
            # Convert to base64
            buffer.seek(0)
            image_data = base64.b64encode(buffer.read()).decode("utf-8")
            
            # Save to file
            filename = f"{alt_file_id}_dependency_graph.{output_format}"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, "wb") as f:
                buffer.seek(0)
                f.write(buffer.read())
            
            return {
                "format": output_format,
                "data": image_data,
                "filename": filename,
                "filepath": filepath
            }
        except Exception as e:
            logger.error(f"Error generating graph image: {str(e)}")
            raise
    
    def _generate_graph_json(self, G: nx.DiGraph, alt_file_id: str) -> Dict[str, Any]:
        """
        Generate a graph JSON visualization
        
        Args:
            G: NetworkX graph
            alt_file_id: ALT file ID
            
        Returns:
            Visualization data
        """
        try:
            # Create nodes and links data
            nodes = []
            for node in G.nodes():
                nodes.append({
                    "id": node,
                    "task_type": G.nodes[node].get("task_type", "unknown"),
                    "content": G.nodes[node].get("content", ""),
                    "priority_score": G.nodes[node].get("priority_score", 0),
                    "execution_order": G.nodes[node].get("execution_order", 0)
                })
            
            links = []
            for source, target in G.edges():
                links.append({
                    "source": source,
                    "target": target
                })
            
            # Create JSON data
            json_data = {
                "nodes": nodes,
                "links": links
            }
            
            # Save to file
            filename = f"{alt_file_id}_dependency_graph.json"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, "w") as f:
                json.dump(json_data, f, indent=2)
            
            return {
                "format": "json",
                "data": json_data,
                "filename": filename,
                "filepath": filepath
            }
        except Exception as e:
            logger.error(f"Error generating graph JSON: {str(e)}")
            raise
    
    def generate_priority_chart(self, alt_file: AltFile, output_format: str = "png") -> Dict[str, Any]:
        """
        Generate a priority chart visualization for a prioritized ALT file
        
        Args:
            alt_file: Prioritized ALT file
            output_format: Output format (png, svg)
            
        Returns:
            Visualization data
        """
        try:
            # Extract priority scores
            segment_ids = []
            priority_scores = []
            task_types = []
            
            for segment in alt_file.segments:
                segment_ids.append(segment.id)
                priority_scores.append(segment.metadata.get("priority_score", 0))
                task_types.append(segment.task_type)
            
            # Sort by priority score
            sorted_indices = sorted(range(len(priority_scores)), key=lambda i: priority_scores[i], reverse=True)
            segment_ids = [segment_ids[i] for i in sorted_indices]
            priority_scores = [priority_scores[i] for i in sorted_indices]
            task_types = [task_types[i] for i in sorted_indices]
            
            # Create figure
            plt.figure(figsize=(10, 6))
            
            # Set bar colors based on task type
            colors = []
            for task_type in task_types:
                if task_type == "search":
                    colors.append("skyblue")
                elif task_type == "create":
                    colors.append("lightgreen")
                elif task_type == "analyze":
                    colors.append("salmon")
                else:
                    colors.append("lightgray")
            
            # Create horizontal bar chart
            bars = plt.barh(segment_ids, priority_scores, color=colors, alpha=0.8)
            
            # Add task type as text on bars
            for i, bar in enumerate(bars):
                plt.text(
                    bar.get_width() + 0.01,
                    bar.get_y() + bar.get_height()/2,
                    task_types[i],
                    va="center",
                    fontsize=8
                )
            
            # Add labels and title
            plt.xlabel("Priority Score")
            plt.ylabel("Task ID")
            plt.title(f"Task Priority Scores for {alt_file.id}")
            
            # Add grid
            plt.grid(axis="x", linestyle="--", alpha=0.7)
            
            # Adjust layout
            plt.tight_layout()
            
            # Save to buffer
            buffer = BytesIO()
            plt.savefig(buffer, format=output_format, dpi=300, bbox_inches="tight")
            plt.close()
            
            # Convert to base64
            buffer.seek(0)
            image_data = base64.b64encode(buffer.read()).decode("utf-8")
            
            # Save to file
            filename = f"{alt_file.id}_priority_chart.{output_format}"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, "wb") as f:
                buffer.seek(0)
                f.write(buffer.read())
            
            return {
                "format": output_format,
                "data": image_data,
                "filename": filename,
                "filepath": filepath
            }
        except Exception as e:
            logger.error(f"Error generating priority chart: {str(e)}")
            raise
    
    def generate_execution_timeline(self, alt_file: AltFile, output_format: str = "png") -> Dict[str, Any]:
        """
        Generate an execution timeline visualization for a prioritized ALT file
        
        Args:
            alt_file: Prioritized ALT file
            output_format: Output format (png, svg)
            
        Returns:
            Visualization data
        """
        try:
            # Extract execution orders
            segment_ids = []
            execution_orders = []
            task_types = []
            
            for segment in alt_file.segments:
                segment_ids.append(segment.id)
                execution_orders.append(segment.metadata.get("execution_order", 0))
                task_types.append(segment.task_type)
            
            # Sort by execution order
            sorted_indices = sorted(range(len(execution_orders)), key=lambda i: execution_orders[i])
            segment_ids = [segment_ids[i] for i in sorted_indices]
            execution_orders = [execution_orders[i] for i in sorted_indices]
            task_types = [task_types[i] for i in sorted_indices]
            
            # Create figure
            plt.figure(figsize=(12, 6))
            
            # Set marker colors based on task type
            colors = []
            for task_type in task_types:
                if task_type == "search":
                    colors.append("skyblue")
                elif task_type == "create":
                    colors.append("lightgreen")
                elif task_type == "analyze":
                    colors.append("salmon")
                else:
                    colors.append("lightgray")
            
            # Create timeline
            plt.scatter(execution_orders, range(len(segment_ids)), c=colors, s=100, alpha=0.8)
            
            # Add task IDs as labels
            for i, txt in enumerate(segment_ids):
                plt.annotate(
                    txt,
                    (execution_orders[i], i),
                    xytext=(5, 0),
                    textcoords="offset points",
                    va="center",
                    fontsize=8
                )
            
            # Add labels and title
            plt.xlabel("Execution Order")
            plt.yticks([])  # Hide y-axis ticks
            plt.title(f"Task Execution Timeline for {alt_file.id}")
            
            # Add grid
            plt.grid(axis="x", linestyle="--", alpha=0.7)
            
            # Adjust layout
            plt.tight_layout()
            
            # Save to buffer
            buffer = BytesIO()
            plt.savefig(buffer, format=output_format, dpi=300, bbox_inches="tight")
            plt.close()
            
            # Convert to base64
            buffer.seek(0)
            image_data = base64.b64encode(buffer.read()).decode("utf-8")
            
            # Save to file
            filename = f"{alt_file.id}_execution_timeline.{output_format}"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, "wb") as f:
                buffer.seek(0)
                f.write(buffer.read())
            
            return {
                "format": output_format,
                "data": image_data,
                "filename": filename,
                "filepath": filepath
            }
        except Exception as e:
            logger.error(f"Error generating execution timeline: {str(e)}")
            raise
    
    def generate_all_visualizations(self, alt_file: AltFile, output_format: str = "png") -> Dict[str, Any]:
        """
        Generate all visualizations for a prioritized ALT file
        
        Args:
            alt_file: Prioritized ALT file
            output_format: Output format (png, svg)
            
        Returns:
            Visualization data
        """
        try:
            # Generate all visualizations
            dependency_graph = self.generate_dependency_graph(alt_file, output_format)
            priority_chart = self.generate_priority_chart(alt_file, output_format)
            execution_timeline = self.generate_execution_timeline(alt_file, output_format)
            
            # Create JSON data
            json_data = self.generate_dependency_graph(alt_file, "json")
            
            return {
                "dependency_graph": dependency_graph,
                "priority_chart": priority_chart,
                "execution_timeline": execution_timeline,
                "json_data": json_data
            }
        except Exception as e:
            logger.error(f"Error generating all visualizations: {str(e)}")
            raise

# Create a global instance
prioritization_visualizer = PrioritizationVisualizer()

# Function to get the prioritization visualizer instance
def get_prioritization_visualizer() -> PrioritizationVisualizer:
    """
    Get the prioritization visualizer instance
    
    Returns:
        Prioritization visualizer instance
    """
    return prioritization_visualizer

# Main function for testing
if __name__ == "__main__":
    # Test the prioritization visualizer
    from dsl_schema import AltFile, TaskSegment, TaskParameter
    
    # Create a sample ALT file
    param1 = TaskParameter(
        name="query",
        value="information about AI",
        type="string",
        required=True
    )
    
    param2 = TaskParameter(
        name="format",
        value="pdf",
        type="string",
        required=True
    )
    
    param3 = TaskParameter(
        name="subject",
        value="AI research papers",
        type="string",
        required=True
    )
    
    segment1 = TaskSegment(
        id="task1",
        task_type="search",
        content="Search for information about AI",
        parameters=[param1],
        metadata={"priority_score": 0.8, "execution_order": 1}
    )
    
    segment2 = TaskSegment(
        id="task2",
        task_type="create",
        content="Create a report",
        parameters=[param2],
        dependencies=["task1"],
        metadata={"priority_score": 0.6, "execution_order": 3}
    )
    
    segment3 = TaskSegment(
        id="task3",
        task_type="analyze",
        content="Analyze AI research papers",
        parameters=[param3],
        dependencies=["task1"],
        metadata={"priority_score": 0.7, "execution_order": 2}
    )
    
    alt_file = AltFile(
        id="test_alt_file",
        command="Search for information about AI, analyze research papers, and create a report",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[segment1, segment2, segment3],
        metadata={"source": "user_input"}
    )
    
    # Generate visualizations
    visualizer = PrioritizationVisualizer()
    visualizations = visualizer.generate_all_visualizations(alt_file)
    
    # Print results
    print(f"Generated visualizations:")
    for viz_type, viz_data in visualizations.items():
        if viz_type != "json_data":
            print(f"- {viz_type}: {viz_data['filepath']}")
        else:
            print(f"- {viz_type}: {viz_data['filepath']}")
