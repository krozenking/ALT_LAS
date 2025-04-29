# ALT_LAS Segmentation Service DSL Documentation

## Overview

The Segmentation Service utilizes a Domain Specific Language (DSL) defined in `.alt` files to represent the breakdown of user commands into executable task segments. This document outlines the structure and features of the DSL.

## Versions

Two versions of the DSL schema have been identified in the codebase:

1.  **Version 1.0 (`dsl_schema.py`):** A basic schema focusing on defining task segments with parameters and dependencies.
2.  **Version 2.0 (`enhanced_dsl_schema.py`):** An enhanced schema building upon v1.0, adding advanced features like variables, conditional logic, loops, and function definitions/calls.

It appears that `enhanced_dsl_schema.py` is the intended current version, as indicated by the `version: "2.0"` field in its `AltFile` model.

## Core Components (v1.0 & v2.0)

-   **`AltFile`:** The root object representing a segmented command. It includes:
    -   `id`: Unique identifier.
    -   `version`: DSL version (e.g., "1.0" or "2.0").
    -   `timestamp`: Creation timestamp.
    -   `command`: The original user command.
    -   `language`: Detected language of the command.
    -   `mode`: Processing mode ("Normal", "Dream", "Explore", "Chaos").
    -   `persona`: Persona used for processing.
    -   `chaos_level`: Optional integer (1-10) used only in "Chaos" mode.
    -   `segments`: A list of `TaskSegment` objects.
    -   `metadata`: Dictionary for additional metadata.

-   **`TaskSegment`:** Represents a single executable task or a control structure (in v2.0). It includes:
    -   `id`: Unique identifier for the segment.
    -   `task_type`: The type of task (e.g., "search", "create", "analyze").
    -   `content`: Original text content related to the segment.
    -   `parameters`: A list of `TaskParameter` objects required for the task.
    -   `dependencies`: A list of segment IDs that must be completed before this segment can run.
    -   `metadata`: Dictionary for segment-specific metadata (e.g., confidence score, priority).

-   **`TaskParameter`:** Defines a parameter for a task segment.
    -   `name`: Parameter name.
    -   `value`: Parameter value.
    -   `type`: Data type (string, number, boolean, array, object).
    -   `required`: Boolean indicating if the parameter is mandatory.
    -   `description`: Optional description.

## Enhanced Features (v2.0 - `enhanced_dsl_schema.py`)

Version 2.0 introduces control flow and data management capabilities:

-   **Variables (`Variable`)**
    -   Can be defined globally (`AltFile.global_variables`) or within a `TaskSegment` (`TaskSegment.variables`).
    -   Attributes: `name`, `type` (string, number, boolean, array, object, any), `value`, `description`.
    -   Names must follow standard identifier rules.
    -   Values are validated against the specified type.

-   **Conditional Logic (`ConditionalBranch`, `Condition`)**
    -   `ConditionalBranch` allows defining `if`/`else` blocks within a `TaskSegment`.
        -   `condition`: A `Condition` object defining the logic.
        -   `if_body`: List of segment IDs to execute if the condition is true.
        -   `else_body`: Optional list of segment IDs to execute if the condition is false.
    -   `Condition` defines the comparison or logical operation.
        -   `operator`: Comparison (`eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `contains`, etc.) or logical (`and`, `or`, `not`).
        -   `left`: Left operand (variable name or nested `Condition`).
        -   `right`: Right operand (variable name, literal value, or nested `Condition`). Required for binary operators.

-   **Loops (`Loop`)**
    -   Allows defining loops within a `TaskSegment`.
    -   `type`: Loop type (`for_each`, `for_range`, `while`).
    -   `variable`: Name of the loop counter or item variable.
    -   `iterable`: (for `for_each`) Name of the variable to iterate over.
    -   `start`, `end`, `step`: (for `for_range`) Range parameters.
    -   `condition`: (for `while`) A `Condition` object.
    -   `body`: List of segment IDs within the loop.

-   **Functions (`Function`, `FunctionParameter`, `FunctionCall`)**
    -   `Function` defines reusable blocks of segments.
        -   Can be defined globally (`AltFile.functions`) or within a `TaskSegment` (`TaskSegment.function_def`).
        -   Attributes: `name`, `parameters` (list of `FunctionParameter`), `return_type`, `body` (list of segment IDs), `description`.
    -   `FunctionParameter` defines parameters for a function.
    -   `FunctionCall` represents calling a defined function within a `TaskSegment`.
        -   `function_name`: Name of the function to call.
        -   `arguments`: Dictionary of arguments passed to the function.
        -   `result_variable`: Optional variable name to store the function's return value.

**Note:** A `TaskSegment` in v2.0 can represent either a standard task or *one* advanced control structure (condition, loop, function definition, or function call). Standard task attributes like `task_type`, `content`, and `parameters` might be less relevant when a segment represents a control structure.

## Serialization

Both schema files include helper functions (`alt_to_yaml`, `alt_to_json`, `yaml_to_alt`, `json_to_alt`, `save_alt_file`, `load_alt_file`) for converting `AltFile` objects to/from YAML and JSON formats and saving/loading them from disk.

## Evaluation

`enhanced_dsl_schema.py` includes a basic `evaluate_condition` function, suggesting runtime evaluation capabilities are intended.

## Conclusion

The DSL provides a flexible and extensible way to represent segmented commands. Version 2.0 offers powerful features for complex workflow automation within the ALT_LAS platform. Further implementation work will likely involve building the interpreter or execution engine that processes these enhanced DSL features.

