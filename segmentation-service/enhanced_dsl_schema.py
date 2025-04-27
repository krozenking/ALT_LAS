"""
Enhanced DSL (Domain Specific Language) Schema for ALT_LAS Segmentation Service

This module extends the DSL schema with advanced features including:
- Conditional expressions
- Loops and iterations
- Variable definitions and usage
- Function definitions and calls

These advanced features enable more complex command processing and task automation.
"""

from typing import Dict, List, Any, Optional, Union, Callable
from pydantic import BaseModel, Field, validator, root_validator
import yaml
import json
import uuid
import datetime
import re
from enum import Enum

class VariableType(str, Enum):
    """Enumeration of variable types"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    ANY = "any"

class ConditionOperator(str, Enum):
    """Enumeration of condition operators"""
    EQUAL = "eq"
    NOT_EQUAL = "neq"
    GREATER_THAN = "gt"
    LESS_THAN = "lt"
    GREATER_EQUAL = "gte"
    LESS_EQUAL = "lte"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    AND = "and"
    OR = "or"
    NOT = "not"

class LoopType(str, Enum):
    """Enumeration of loop types"""
    FOR_EACH = "for_each"
    FOR_RANGE = "for_range"
    WHILE = "while"

class TaskParameter(BaseModel):
    """Model for task parameters"""
    name: str = Field(..., description="Parameter name")
    value: Any = Field(..., description="Parameter value")
    type: str = Field("string", description="Parameter type (string, number, boolean, array, object)")
    required: bool = Field(False, description="Whether the parameter is required")
    description: Optional[str] = Field(None, description="Parameter description")

class Variable(BaseModel):
    """Model for variables"""
    name: str = Field(..., description="Variable name")
    type: VariableType = Field(VariableType.STRING, description="Variable type")
    value: Any = Field(None, description="Variable value")
    description: Optional[str] = Field(None, description="Variable description")

    @validator('name')
    def validate_name(cls, v):
        """Validate variable name"""
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', v):
            raise ValueError("Variable name must start with a letter or underscore and contain only letters, numbers, and underscores")
        return v

    @validator('value')
    def validate_value(cls, v, values):
        """Validate variable value based on type"""
        if 'type' in values:
            var_type = values['type']
            if var_type == VariableType.STRING and v is not None and not isinstance(v, str):
                raise ValueError("Value must be a string for string type variables")
            elif var_type == VariableType.NUMBER and v is not None and not isinstance(v, (int, float)):
                raise ValueError("Value must be a number for number type variables")
            elif var_type == VariableType.BOOLEAN and v is not None and not isinstance(v, bool):
                raise ValueError("Value must be a boolean for boolean type variables")
            elif var_type == VariableType.ARRAY and v is not None and not isinstance(v, list):
                raise ValueError("Value must be an array for array type variables")
            elif var_type == VariableType.OBJECT and v is not None and not isinstance(v, dict):
                raise ValueError("Value must be an object for object type variables")
        return v

class Condition(BaseModel):
    """Model for conditions"""
    operator: ConditionOperator = Field(..., description="Condition operator")
    left: Union[str, 'Condition'] = Field(..., description="Left operand (variable name or nested condition)")
    right: Optional[Union[str, Any, 'Condition']] = Field(None, description="Right operand (variable name, value, or nested condition)")

    @root_validator
    def validate_condition(cls, values):
        """Validate condition based on operator"""
        operator = values.get('operator')
        right = values.get('right')
        
        # Unary operators don't need a right operand
        if operator == ConditionOperator.NOT and right is not None:
            raise ValueError("NOT operator should only have a left operand")
            
        # Binary operators need both operands
        if operator != ConditionOperator.NOT and right is None:
            raise ValueError(f"Operator {operator} requires both left and right operands")
            
        # Logical operators (AND, OR) need nested conditions
        if operator in [ConditionOperator.AND, ConditionOperator.OR]:
            left = values.get('left')
            if not isinstance(left, Condition):
                raise ValueError(f"Left operand for {operator} must be a condition")
            if not isinstance(right, Condition):
                raise ValueError(f"Right operand for {operator} must be a condition")
                
        return values

class Loop(BaseModel):
    """Model for loops"""
    type: LoopType = Field(..., description="Loop type")
    variable: str = Field(..., description="Loop variable name")
    iterable: Optional[str] = Field(None, description="Iterable variable name for for_each loops")
    start: Optional[int] = Field(None, description="Start value for for_range loops")
    end: Optional[int] = Field(None, description="End value for for_range loops")
    step: Optional[int] = Field(1, description="Step value for for_range loops")
    condition: Optional[Condition] = Field(None, description="Condition for while loops")
    body: List[str] = Field(..., description="IDs of segments in the loop body")

    @root_validator
    def validate_loop(cls, values):
        """Validate loop based on type"""
        loop_type = values.get('type')
        iterable = values.get('iterable')
        start = values.get('start')
        end = values.get('end')
        condition = values.get('condition')
        
        if loop_type == LoopType.FOR_EACH and iterable is None:
            raise ValueError("FOR_EACH loops require an iterable")
            
        if loop_type == LoopType.FOR_RANGE and (start is None or end is None):
            raise ValueError("FOR_RANGE loops require start and end values")
            
        if loop_type == LoopType.WHILE and condition is None:
            raise ValueError("WHILE loops require a condition")
            
        return values

class FunctionParameter(BaseModel):
    """Model for function parameters"""
    name: str = Field(..., description="Parameter name")
    type: VariableType = Field(VariableType.ANY, description="Parameter type")
    default_value: Optional[Any] = Field(None, description="Default value")
    required: bool = Field(True, description="Whether the parameter is required")
    description: Optional[str] = Field(None, description="Parameter description")

class Function(BaseModel):
    """Model for functions"""
    name: str = Field(..., description="Function name")
    parameters: List[FunctionParameter] = Field(default_factory=list, description="Function parameters")
    return_type: VariableType = Field(VariableType.ANY, description="Return type")
    body: List[str] = Field(..., description="IDs of segments in the function body")
    description: Optional[str] = Field(None, description="Function description")

    @validator('name')
    def validate_name(cls, v):
        """Validate function name"""
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', v):
            raise ValueError("Function name must start with a letter or underscore and contain only letters, numbers, and underscores")
        return v

class FunctionCall(BaseModel):
    """Model for function calls"""
    function_name: str = Field(..., description="Function name")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Function arguments")
    result_variable: Optional[str] = Field(None, description="Variable to store the result")

class ConditionalBranch(BaseModel):
    """Model for conditional branches (if/else)"""
    condition: Condition = Field(..., description="Branch condition")
    if_body: List[str] = Field(..., description="IDs of segments in the if body")
    else_body: Optional[List[str]] = Field(None, description="IDs of segments in the else body")

class TaskSegment(BaseModel):
    """Enhanced model for task segments with advanced features"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the segment")
    task_type: str = Field(..., description="Type of task (search, create, analyze, etc.)")
    content: str = Field(..., description="Original content of the segment")
    parameters: List[TaskParameter] = Field(default_factory=list, description="Parameters for the task")
    dependencies: List[str] = Field(default_factory=list, description="IDs of segments this segment depends on")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata for the segment")
    
    # Advanced features
    variables: List[Variable] = Field(default_factory=list, description="Variables defined in this segment")
    condition: Optional[ConditionalBranch] = Field(None, description="Conditional branch for this segment")
    loop: Optional[Loop] = Field(None, description="Loop for this segment")
    function_def: Optional[Function] = Field(None, description="Function definition")
    function_call: Optional[FunctionCall] = Field(None, description="Function call")

    @root_validator
    def validate_segment(cls, values):
        """Validate segment based on advanced features"""
        # Only one advanced feature can be used per segment
        advanced_features = [
            values.get('condition'),
            values.get('loop'),
            values.get('function_def'),
            values.get('function_call')
        ]
        
        if sum(1 for feature in advanced_features if feature is not None) > 1:
            raise ValueError("Only one advanced feature (condition, loop, function_def, function_call) can be used per segment")
            
        return values

class AltFile(BaseModel):
    """Enhanced model for ALT file format with advanced features"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the ALT file")
    version: str = Field("2.0", description="ALT file format version")
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now().isoformat(), description="Creation timestamp")
    command: str = Field(..., description="Original command")
    language: str = Field(..., description="Detected language of the command")
    mode: str = Field("Normal", description="Processing mode (Normal, Dream, Explore, Chaos)")
    persona: str = Field("technical_expert", description="Persona to use for processing")
    chaos_level: Optional[int] = Field(None, description="Chaos level (1-10) for Chaos mode")
    segments: List[TaskSegment] = Field(..., description="Task segments")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    # Global definitions
    global_variables: List[Variable] = Field(default_factory=list, description="Global variables")
    functions: List[Function] = Field(default_factory=list, description="Function definitions")

    @validator('mode')
    def validate_mode(cls, v):
        """Validate mode value"""
        valid_modes = ["Normal", "Dream", "Explore", "Chaos"]
        if v not in valid_modes:
            raise ValueError(f"Mode must be one of {valid_modes}")
        return v
    
    @validator('chaos_level')
    def validate_chaos_level(cls, v, values):
        """Validate chaos_level based on mode"""
        if values.get('mode') == "Chaos" and (v is None or not 1 <= v <= 10):
            raise ValueError("Chaos level must be between 1 and 10 when mode is Chaos")
        if values.get('mode') != "Chaos" and v is not None:
            raise ValueError("Chaos level should only be set when mode is Chaos")
        return v
    
    @validator('version')
    def validate_version(cls, v):
        """Validate version"""
        if v != "2.0":
            raise ValueError("Version must be 2.0 for enhanced DSL schema")
        return v

def alt_to_yaml(alt_file: AltFile) -> str:
    """
    Convert ALT file to YAML format
    
    Args:
        alt_file: ALT file object
        
    Returns:
        YAML string representation
    """
    return yaml.dump(alt_file.dict(), sort_keys=False, default_flow_style=False)

def alt_to_json(alt_file: AltFile) -> str:
    """
    Convert ALT file to JSON format
    
    Args:
        alt_file: ALT file object
        
    Returns:
        JSON string representation
    """
    return json.dumps(alt_file.dict(), indent=2)

def yaml_to_alt(yaml_str: str) -> AltFile:
    """
    Convert YAML string to ALT file object
    
    Args:
        yaml_str: YAML string
        
    Returns:
        ALT file object
    """
    data = yaml.safe_load(yaml_str)
    return AltFile(**data)

def json_to_alt(json_str: str) -> AltFile:
    """
    Convert JSON string to ALT file object
    
    Args:
        json_str: JSON string
        
    Returns:
        ALT file object
    """
    data = json.loads(json_str)
    return AltFile(**data)

def save_alt_file(alt_file: AltFile, file_path: str, format: str = "yaml") -> None:
    """
    Save ALT file to disk
    
    Args:
        alt_file: ALT file object
        file_path: Path to save the file
        format: Format to save the file in (yaml or json)
    """
    if format.lower() == "yaml":
        content = alt_to_yaml(alt_file)
    elif format.lower() == "json":
        content = alt_to_json(alt_file)
    else:
        raise ValueError("Format must be either 'yaml' or 'json'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def load_alt_file(file_path: str) -> AltFile:
    """
    Load ALT file from disk
    
    Args:
        file_path: Path to the file
        
    Returns:
        ALT file object
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if file_path.endswith('.yaml') or file_path.endswith('.yml'):
        return yaml_to_alt(content)
    elif file_path.endswith('.json'):
        return json_to_alt(content)
    else:
        # Try to determine format from content
        try:
            return json_to_alt(content)
        except:
            try:
                return yaml_to_alt(content)
            except:
                raise ValueError("Could not determine file format. Use .yaml or .json extension.")

def evaluate_condition(condition: Condition, variables: Dict[str, Any]) -> bool:
    """
    Evaluate a condition with given variables
    
    Args:
        condition: Condition to evaluate
        variables: Dictionary of variables
        
    Returns:
        Boolean result of condition evaluation
    """
    op = condition.operator
    
    # Handle unary operators
    if op == ConditionOperator.NOT:
        if isinstance(condition.left, Condition):
            return not evaluate_condition(condition.left, variables)
        else:
            left_val = variables.get(condition.left, False)
            return not left_val
    
    # Handle binary operators
    left = condition.left
    right = condition.right
    
    # Handle nested conditions
    if op in [ConditionOperator.AND, ConditionOperator.OR]:
        left_result = evaluate_condition(left, variables)
        right_result = evaluate_condition(right, variables)
        
        if op == ConditionOperator.AND:
            return left_result and right_result
        else:  # OR
            return left_result or right_result
    
    # Get values for comparison
    if isinstance(left, Condition):
        left_val = evaluate_condition(left, variables)
    elif isinstance(left, str) and left in variables:
        left_val = variables[left]
    else:
        left_val = left
        
    if isinstance(right, Condition):
        right_val = evaluate_condition(right, variables)
    elif isinstance(right, str) and right in variables:
        right_val = variables[right]
    else:
        right_val = right
    
    # Compare values
    if op == ConditionOperator.EQUAL:
        return left_val == right_val
    elif op == ConditionOperator.NOT_EQUAL:
        return left_val != right_val
    elif op == ConditionOperator.GREATER_THAN:
        return left_val > right_val
    elif op == ConditionOperator.LESS_THAN:
        return left_val < right_val
    elif op == ConditionOperator.GREATER_EQUAL:
        return left_val >= right_val
    elif op == ConditionOperator.LESS_EQUAL:
        return left_val <= right_val
    elif op == ConditionOperator.CONTAINS:
        return right_val in left_val
    elif op == ConditionOperator.NOT_CONTAINS:
        return right_val not in left_val
    elif op == ConditionOperator.STARTS_WITH:
        return left_val.startswith(right_val)
    elif op == ConditionOperator.ENDS_WITH:
        return left_val.endswith(right_val)
    
    raise ValueError(f"Unsupported operator: {op}")

# Example usage
if __name__ == "__main__":
    # Create global variables
    global_var1 = Variable(name="max_results", type=VariableType.NUMBER, value=10)
    global_var2 = Variable(name="search_engine", type=VariableType.STRING, value="google")
    
    # Create a function
    func_param1 = FunctionParameter(name="query", type=VariableType.STRING, required=True)
    func_param2 = FunctionParameter(name="limit", type=VariableType.NUMBER, default_value=5, required=False)
    
    # Function body segments will be defined later
    function = Function(
        name="perform_search",
        parameters=[func_param1, func_param2],
        return_type=VariableType.ARRAY,
        body=["segment3", "segment4"],
        description="Perform a search with the given query"
    )
    
    # Create a condition
    condition = Condition(
        operator=ConditionOperator.GREATER_THAN,
        left="result_count",
        right=0
    )
    
    conditional_branch = ConditionalBranch(
        condition=condition,
        if_body=["segment5"],
        else_body=["segment6"]
    )
    
    # Create a loop
    loop = Loop(
        type=LoopType.FOR_EACH,
        variable="result",
        iterable="search_results",
        body=["segment7"]
    )
    
    # Create task segments
    task1 = TaskSegment(
        id="segment1",
        task_type="variable_definition",
        content="Define search parameters",
        variables=[
            Variable(name="query", type=VariableType.STRING, value="AI advancements"),
            Variable(name="result_count", type=VariableType.NUMBER, value=0)
        ]
    )
    
    task2 = TaskSegment(
        id="segment2",
        task_type="function_call",
        content="Call search function",
        function_call=FunctionCall(
            function_name="perform_search",
            arguments={"query": "AI advancements", "limit": 10},
            result_variable="search_results"
        )
    )
    
    task3 = TaskSegment(
        id="segment3",
        task_type="search",
        content="Search for information",
        parameters=[
            TaskParameter(name="query", value="AI advancements", type="string", required=True)
        ]
    )
    
    task4 = TaskSegment(
        id="segment4",
        task_type="process",
        content="Process search results",
        dependencies=["segment3"]
    )
    
    task5 = TaskSegment(
        id="segment5",
        task_type="create",
        content="Create report with results",
        condition=conditional_branch
    )
    
    task6 = TaskSegment(
        id="segment6",
        task_type="notify",
        content="Notify no results found",
        condition=conditional_branch
    )
    
    task7 = TaskSegment(
        id="segment7",
        task_type="analyze",
        content="Analyze each result",
        loop=loop
    )
    
    # Create ALT file
    alt_file = AltFile(
        command="Search for AI advancements and create a report",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[task1, task2, task3, task4, task5, task6, task7],
        global_variables=[global_var1, global_var2],
        functions=[function],
        metadata={"source": "user_input", "priority": "high"}
    )
    
    # Convert to YAML and print
    yaml_str = alt_to_yaml(alt_file)
    print("YAML representation:")
    print(yaml_str)
    
    # Save to file
    save_alt_file(alt_file, "example_enhanced.alt.yaml")
