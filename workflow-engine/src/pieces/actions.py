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


from typing import Dict, Any
import asyncio
import httpx # Using httpx for async requests
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

class HttpRequest(Piece):
    """Makes an HTTP request to a specified URL."""

    def __init__(self, node: Node):
        super().__init__(node)
        self.url = self.config.get("url")
        self.method = self.config.get("method", "GET").upper()
        self.headers = self.config.get("headers", {})
        self.params = self.config.get("params", {})
        self.data = self.config.get("data", None) # For POST/PUT/PATCH etc.
        self.timeout = self.config.get("timeout", 30)

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Performs the HTTP request using httpx."""
        print(f"Executing HttpRequest for node {self.node.id} to {self.url}")

        if not self.url:
            return {"error": "URL is required."}

        # Allow overriding config with input data (optional, based on design choice)
        # url = input_data.get("url", self.url)
        # ... etc.

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=self.method,
                    url=self.url,
                    headers=self.headers,
                    params=self.params,
                    json=self.data if isinstance(self.data, (dict, list)) else None,
                    data=self.data if isinstance(self.data, (str, bytes)) else None
                )

                response.raise_for_status() # Raise exception for 4xx/5xx status codes

                try:
                    response_data = response.json()
                except Exception:
                    response_data = response.text

                return {
                    "status_code": response.status_code,
                    "headers": dict(response.headers),
                    "body": response_data
                }

        except httpx.RequestError as e:
            print(f"HTTP Request failed for node {self.node.id}: {e}")
            return {"error": f"Request failed: {e}"}
        except Exception as e:
            print(f"Error during HTTP request for node {self.node.id}: {e}")
            return {"error": f"An unexpected error occurred: {e}"}

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "url": {"type": "string", "title": "URL", "format": "uri"},
                "method": {
                    "type": "string",
                    "title": "Method",
                    "enum": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
                    "default": "GET"
                },
                "headers": {
                    "type": "object",
                    "title": "Headers",
                    "additionalProperties": {"type": "string"}
                },
                "params": {
                    "type": "object",
                    "title": "Query Parameters",
                    "additionalProperties": {"type": "string"}
                },
                "data": {
                    "type": ["object", "string", "null"],
                    "title": "Request Body (JSON/Text)",
                    "description": "JSON object or raw text for the request body."
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "default": 30
                }
            },
            "required": ["url", "method"]
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        # Input schema could allow overriding config parameters
        return {
            "type": "object",
            "title": "Input Data (Optional Overrides)",
            "properties": {
                "url": {"type": "string", "title": "URL Override"},
                "method": {"type": "string", "title": "Method Override"},
                "headers": {"type": "object", "title": "Headers Override"},
                "params": {"type": "object", "title": "Params Override"},
                "data": {"type": ["object", "string", "null"], "title": "Data Override"}
            }
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "title": "HTTP Response",
            "properties": {
                "status_code": {"type": "integer", "title": "Status Code"},
                "headers": {"type": "object", "title": "Response Headers"},
                "body": {"type": ["object", "string"], "title": "Response Body (JSON/Text)"},
                "error": {"type": "string", "title": "Error Message"}
            }
        }

class Delay(Piece):
    """Pauses the workflow execution for a specified duration."""

    def __init__(self, node: Node):
        super().__init__(node)
        self.duration_seconds = self.config.get("duration_seconds", 0)

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sleeps for the specified duration."""
        print(f"Executing Delay for node {self.node.id} for {self.duration_seconds} seconds")
        if self.duration_seconds > 0:
            await asyncio.sleep(self.duration_seconds)
        return input_data # Pass through input data

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "duration_seconds": {
                    "type": "number",
                    "title": "Duration (seconds)",
                    "description": "The number of seconds to pause execution.",
                    "default": 0
                }
            },
            "required": ["duration_seconds"]
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        # Delay node typically passes through data
        return {
            "type": "object",
            "title": "Input Data",
            "description": "Data passed from the previous node."
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        # Delay node typically passes through data
        return {
            "type": "object",
            "title": "Output Data",
            "description": "Data passed through from the input."
        }

