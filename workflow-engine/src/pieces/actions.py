import asyncio
import subprocess
from typing import Dict, Any
from .base import Piece
from models.workflow import Node

class CodeExecutor(Piece):
    """Executes arbitrary Python or JavaScript code."""

    def __init__(self, node: Node):
        super().__init__(node)
        self.language = self.config.get("language", "python") # Default to python
        self.code = self.config.get("code", "")
        self.timeout = self.config.get("timeout", 60) # Default timeout 60 seconds

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Executes the provided code in a subprocess."""
        print(f"Executing CodeExecutor for node {self.node.id} ({self.language})")

        if not self.code:
            return {"error": "No code provided."}

        cmd = []
        input_str = str(input_data) # Simple serialization for now

        if self.language == "python":
            cmd = ["python3", "-c", self.code]
        elif self.language == "javascript":
            cmd = ["node", "-e", self.code]
        else:
            return {"error": f"Unsupported language: {self.language}"}

        try:
            # Using asyncio.create_subprocess_exec for non-blocking execution
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(input=input_str.encode()),
                timeout=self.timeout
            )

            output = {}
            if stdout:
                output["stdout"] = stdout.decode().strip()
            if stderr:
                output["stderr"] = stderr.decode().strip()
            output["returncode"] = process.returncode

            if process.returncode != 0:
                 print(f"Code execution failed for node {self.node.id} with stderr: {output.get(	stderr	)}")
                 # Optionally raise an error or just return the error info
                 # raise RuntimeError(f"Code execution failed: {output.get(	stderr	)}")

            return output

        except asyncio.TimeoutError:
            print(f"Code execution timed out for node {self.node.id}")
            return {"error": f"Execution timed out after {self.timeout} seconds."}
        except Exception as e:
            print(f"Error running code for node {self.node.id}: {e}")
            return {"error": f"Failed to execute code: {e}"}

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "language": {
                    "type": "string",
                    "title": "Language",
                    "enum": ["python", "javascript"],
                    "default": "python"
                },
                "code": {
                    "type": "string",
                    "title": "Code",
                    "description": "The code to execute. Input data is passed as a string to stdin.",
                    "format": "code"
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "default": 60,
                    "description": "Maximum execution time in seconds."
                }
            },
            "required": ["language", "code"]
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "title": "Input Data",
            "description": "Data passed from previous nodes, serialized as a string to stdin."
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "title": "Execution Result",
            "properties": {
                "stdout": {"type": "string", "title": "Standard Output"},
                "stderr": {"type": "string", "title": "Standard Error"},
                "returncode": {"type": "integer", "title": "Return Code"},
                "error": {"type": "string", "title": "Execution Error"}
            }
        }

