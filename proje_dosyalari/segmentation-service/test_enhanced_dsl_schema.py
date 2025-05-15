"""
Tests for the enhanced DSL schema module.

This module contains tests for the enhanced DSL schema with advanced features including:
- Conditional expressions
- Loops and iterations
- Variable definitions and usage
- Function definitions and calls
"""

import pytest
import json
import yaml
from enhanced_dsl_schema import (
    AltFile, TaskSegment, Variable, VariableType, Condition, ConditionOperator,
    Loop, LoopType, Function, FunctionParameter, FunctionCall, ConditionalBranch,
    TaskParameter, alt_to_yaml, alt_to_json, yaml_to_alt, json_to_alt,
    evaluate_condition
)

def test_variable_creation():
    """Test variable creation and validation"""
    # Valid variable
    var = Variable(name="test_var", type=VariableType.STRING, value="test value")
    assert var.name == "test_var"
    assert var.type == VariableType.STRING
    assert var.value == "test value"
    
    # Invalid variable name
    with pytest.raises(ValueError):
        Variable(name="123invalid", type=VariableType.STRING, value="test")
    
    # Type mismatch
    with pytest.raises(ValueError):
        Variable(name="test_var", type=VariableType.NUMBER, value="not a number")

def test_condition_creation():
    """Test condition creation and validation"""
    # Simple condition
    cond = Condition(
        operator=ConditionOperator.EQUAL,
        left="var1",
        right="var2"
    )
    assert cond.operator == ConditionOperator.EQUAL
    assert cond.left == "var1"
    assert cond.right == "var2"
    
    # Nested condition
    nested_cond = Condition(
        operator=ConditionOperator.AND,
        left=Condition(
            operator=ConditionOperator.GREATER_THAN,
            left="count",
            right=10
        ),
        right=Condition(
            operator=ConditionOperator.LESS_THAN,
            left="count",
            right=20
        )
    )
    assert nested_cond.operator == ConditionOperator.AND
    assert isinstance(nested_cond.left, Condition)
    assert isinstance(nested_cond.right, Condition)
    
    # Unary operator
    not_cond = Condition(
        operator=ConditionOperator.NOT,
        left=Condition(
            operator=ConditionOperator.EQUAL,
            left="status",
            right="error"
        )
    )
    assert not_cond.operator == ConditionOperator.NOT
    assert not_cond.right is None
    
    # Invalid unary operator
    with pytest.raises(ValueError):
        Condition(
            operator=ConditionOperator.NOT,
            left="var1",
            right="var2"
        )
    
    # Invalid binary operator
    with pytest.raises(ValueError):
        Condition(
            operator=ConditionOperator.EQUAL,
            left="var1",
            right=None
        )
    
    # Invalid logical operator
    with pytest.raises(ValueError):
        Condition(
            operator=ConditionOperator.AND,
            left="var1",
            right="var2"
        )

def test_loop_creation():
    """Test loop creation and validation"""
    # For each loop
    for_each = Loop(
        type=LoopType.FOR_EACH,
        variable="item",
        iterable="items",
        body=["segment1", "segment2"]
    )
    assert for_each.type == LoopType.FOR_EACH
    assert for_each.variable == "item"
    assert for_each.iterable == "items"
    assert for_each.body == ["segment1", "segment2"]
    
    # For range loop
    for_range = Loop(
        type=LoopType.FOR_RANGE,
        variable="i",
        start=0,
        end=10,
        step=2,
        body=["segment1"]
    )
    assert for_range.type == LoopType.FOR_RANGE
    assert for_range.variable == "i"
    assert for_range.start == 0
    assert for_range.end == 10
    assert for_range.step == 2
    
    # While loop
    while_loop = Loop(
        type=LoopType.WHILE,
        variable="status",
        condition=Condition(
            operator=ConditionOperator.EQUAL,
            left="status",
            right="running"
        ),
        body=["segment1"]
    )
    assert while_loop.type == LoopType.WHILE
    assert while_loop.variable == "status"
    assert while_loop.condition.operator == ConditionOperator.EQUAL
    
    # Invalid for_each loop
    with pytest.raises(ValueError):
        Loop(
            type=LoopType.FOR_EACH,
            variable="item",
            iterable=None,
            body=["segment1"]
        )
    
    # Invalid for_range loop
    with pytest.raises(ValueError):
        Loop(
            type=LoopType.FOR_RANGE,
            variable="i",
            start=None,
            end=10,
            body=["segment1"]
        )
    
    # Invalid while loop
    with pytest.raises(ValueError):
        Loop(
            type=LoopType.WHILE,
            variable="status",
            condition=None,
            body=["segment1"]
        )

def test_function_creation():
    """Test function creation and validation"""
    # Valid function
    func = Function(
        name="test_function",
        parameters=[
            FunctionParameter(name="param1", type=VariableType.STRING, required=True),
            FunctionParameter(name="param2", type=VariableType.NUMBER, default_value=10, required=False)
        ],
        return_type=VariableType.BOOLEAN,
        body=["segment1", "segment2"],
        description="Test function"
    )
    assert func.name == "test_function"
    assert len(func.parameters) == 2
    assert func.return_type == VariableType.BOOLEAN
    assert func.body == ["segment1", "segment2"]
    
    # Invalid function name
    with pytest.raises(ValueError):
        Function(
            name="123invalid",
            parameters=[],
            return_type=VariableType.ANY,
            body=["segment1"]
        )

def test_task_segment_creation():
    """Test task segment creation with advanced features"""
    # Basic segment
    segment = TaskSegment(
        task_type="search",
        content="Search for information",
        parameters=[
            TaskParameter(name="query", value="test query", type="string", required=True)
        ]
    )
    assert segment.task_type == "search"
    assert segment.content == "Search for information"
    assert len(segment.parameters) == 1
    
    # Segment with variables
    var_segment = TaskSegment(
        task_type="variable_definition",
        content="Define variables",
        variables=[
            Variable(name="var1", type=VariableType.STRING, value="value1"),
            Variable(name="var2", type=VariableType.NUMBER, value=42)
        ]
    )
    assert var_segment.task_type == "variable_definition"
    assert len(var_segment.variables) == 2
    
    # Segment with condition
    cond_segment = TaskSegment(
        task_type="conditional",
        content="Conditional task",
        condition=ConditionalBranch(
            condition=Condition(
                operator=ConditionOperator.EQUAL,
                left="status",
                right="success"
            ),
            if_body=["segment1"],
            else_body=["segment2"]
        )
    )
    assert cond_segment.task_type == "conditional"
    assert cond_segment.condition.condition.operator == ConditionOperator.EQUAL
    
    # Segment with loop
    loop_segment = TaskSegment(
        task_type="loop",
        content="Loop task",
        loop=Loop(
            type=LoopType.FOR_EACH,
            variable="item",
            iterable="items",
            body=["segment1"]
        )
    )
    assert loop_segment.task_type == "loop"
    assert loop_segment.loop.type == LoopType.FOR_EACH
    
    # Segment with function definition
    func_def_segment = TaskSegment(
        task_type="function_definition",
        content="Define function",
        function_def=Function(
            name="test_func",
            parameters=[
                FunctionParameter(name="param1", type=VariableType.STRING)
            ],
            return_type=VariableType.BOOLEAN,
            body=["segment1"]
        )
    )
    assert func_def_segment.task_type == "function_definition"
    assert func_def_segment.function_def.name == "test_func"
    
    # Segment with function call
    func_call_segment = TaskSegment(
        task_type="function_call",
        content="Call function",
        function_call=FunctionCall(
            function_name="test_func",
            arguments={"param1": "value1"},
            result_variable="result"
        )
    )
    assert func_call_segment.task_type == "function_call"
    assert func_call_segment.function_call.function_name == "test_func"
    
    # Invalid segment with multiple advanced features
    with pytest.raises(ValueError):
        TaskSegment(
            task_type="invalid",
            content="Invalid task",
            condition=ConditionalBranch(
                condition=Condition(
                    operator=ConditionOperator.EQUAL,
                    left="status",
                    right="success"
                ),
                if_body=["segment1"]
            ),
            loop=Loop(
                type=LoopType.FOR_EACH,
                variable="item",
                iterable="items",
                body=["segment1"]
            )
        )

def test_alt_file_creation():
    """Test ALT file creation with advanced features"""
    # Create global variables
    global_var1 = Variable(name="max_results", type=VariableType.NUMBER, value=10)
    global_var2 = Variable(name="search_engine", type=VariableType.STRING, value="google")
    
    # Create a function
    function = Function(
        name="perform_search",
        parameters=[
            FunctionParameter(name="query", type=VariableType.STRING, required=True),
            FunctionParameter(name="limit", type=VariableType.NUMBER, default_value=5, required=False)
        ],
        return_type=VariableType.ARRAY,
        body=["segment3", "segment4"],
        description="Perform a search with the given query"
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
    
    # Create ALT file
    alt_file = AltFile(
        command="Search for AI advancements and create a report",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[task1, task2],
        global_variables=[global_var1, global_var2],
        functions=[function],
        metadata={"source": "user_input", "priority": "high"}
    )
    
    assert alt_file.version == "2.0"
    assert alt_file.language == "en"
    assert alt_file.mode == "Normal"
    assert len(alt_file.segments) == 2
    assert len(alt_file.global_variables) == 2
    assert len(alt_file.functions) == 1
    
    # Invalid mode
    with pytest.raises(ValueError):
        AltFile(
            command="Test command",
            language="en",
            mode="InvalidMode",
            persona="researcher",
            segments=[task1]
        )
    
    # Invalid chaos level
    with pytest.raises(ValueError):
        AltFile(
            command="Test command",
            language="en",
            mode="Chaos",
            chaos_level=20,
            persona="researcher",
            segments=[task1]
        )
    
    # Chaos level with non-Chaos mode
    with pytest.raises(ValueError):
        AltFile(
            command="Test command",
            language="en",
            mode="Normal",
            chaos_level=5,
            persona="researcher",
            segments=[task1]
        )

def test_alt_file_serialization():
    """Test ALT file serialization and deserialization"""
    # Create a simple ALT file
    task = TaskSegment(
        task_type="search",
        content="Search for information",
        parameters=[
            TaskParameter(name="query", value="test query", type="string", required=True)
        ]
    )
    
    alt_file = AltFile(
        command="Search for test query",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[task],
        metadata={"source": "test"}
    )
    
    # Convert to YAML
    yaml_str = alt_to_yaml(alt_file)
    assert "command: Search for test query" in yaml_str
    assert "language: en" in yaml_str
    
    # Convert to JSON
    json_str = alt_to_json(alt_file)
    json_data = json.loads(json_str)
    assert json_data["command"] == "Search for test query"
    assert json_data["language"] == "en"
    
    # Deserialize from YAML
    alt_from_yaml = yaml_to_alt(yaml_str)
    assert alt_from_yaml.command == alt_file.command
    assert alt_from_yaml.language == alt_file.language
    assert len(alt_from_yaml.segments) == len(alt_file.segments)
    
    # Deserialize from JSON
    alt_from_json = json_to_alt(json_str)
    assert alt_from_json.command == alt_file.command
    assert alt_from_json.language == alt_file.language
    assert len(alt_from_json.segments) == len(alt_file.segments)

def test_condition_evaluation():
    """Test condition evaluation"""
    # Setup variables
    variables = {
        "count": 15,
        "status": "success",
        "name": "test",
        "items": ["item1", "item2", "item3"],
        "flag": True
    }
    
    # Simple conditions
    assert evaluate_condition(
        Condition(operator=ConditionOperator.EQUAL, left="count", right=15),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(operator=ConditionOperator.NOT_EQUAL, left="status", right="error"),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(operator=ConditionOperator.GREATER_THAN, left="count", right=10),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(operator=ConditionOperator.LESS_THAN, left="count", right=20),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(operator=ConditionOperator.CONTAINS, left="items", right="item2"),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(operator=ConditionOperator.STARTS_WITH, left="name", right="te"),
        variables
    ) == True
    
    # Compound conditions
    assert evaluate_condition(
        Condition(
            operator=ConditionOperator.AND,
            left=Condition(operator=ConditionOperator.GREATER_THAN, left="count", right=10),
            right=Condition(operator=ConditionOperator.LESS_THAN, left="count", right=20)
        ),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(
            operator=ConditionOperator.OR,
            left=Condition(operator=ConditionOperator.EQUAL, left="status", right="error"),
            right=Condition(operator=ConditionOperator.GREATER_THAN, left="count", right=10)
        ),
        variables
    ) == True
    
    # Negation
    assert evaluate_condition(
        Condition(
            operator=ConditionOperator.NOT,
            left=Condition(operator=ConditionOperator.EQUAL, left="status", right="error")
        ),
        variables
    ) == True
    
    assert evaluate_condition(
        Condition(operator=ConditionOperator.NOT, left="flag"),
        variables
    ) == False
