#!/usr/bin/env python3
"""
Test Coverage Report Generator

This script runs tests with coverage analysis and generates a detailed coverage report.
"""

import os
import sys
import subprocess
import json
import datetime
from pathlib import Path

def run_coverage_analysis():
    """
    Run test coverage analysis and generate reports
    
    Returns:
        dict: Coverage statistics
    """
    print("Running test coverage analysis...")
    
    # Create reports directory if it doesn't exist
    reports_dir = Path("./reports")
    reports_dir.mkdir(exist_ok=True)
    
    # Run pytest with coverage
    cmd = [
        "python", "-m", "pytest",
        "--cov=.",
        "--cov-report=term",
        "--cov-report=html:./reports/coverage_html",
        "--cov-report=xml:./reports/coverage.xml",
        "--cov-report=json:./reports/coverage.json",
        "-v"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("Coverage analysis completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running coverage analysis: {e}")
        return None
    
    # Parse coverage JSON report
    try:
        with open("./reports/coverage.json", "r") as f:
            coverage_data = json.load(f)
        
        # Extract overall statistics
        total_statements = coverage_data["totals"]["statement_coverage"]["num_statements"]
        covered_statements = coverage_data["totals"]["statement_coverage"]["covered_statements"]
        coverage_percent = coverage_data["totals"]["statement_coverage"]["percent_covered"]
        
        # Extract file-specific statistics
        file_stats = {}
        for file_path, file_data in coverage_data["files"].items():
            if file_path.startswith("test_"):
                continue  # Skip test files
                
            file_stats[file_path] = {
                "statements": file_data["statement_coverage"]["num_statements"],
                "covered": file_data["statement_coverage"]["covered_statements"],
                "percent": file_data["statement_coverage"]["percent_covered"],
                "missing_lines": file_data["statement_coverage"]["missing_lines"]
            }
        
        # Generate summary
        summary = {
            "timestamp": datetime.datetime.now().isoformat(),
            "total_statements": total_statements,
            "covered_statements": covered_statements,
            "coverage_percent": coverage_percent,
            "file_stats": file_stats
        }
        
        # Save summary to JSON
        with open("./reports/coverage_summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        # Generate text report
        generate_text_report(summary)
        
        return summary
    except Exception as e:
        print(f"Error parsing coverage data: {e}")
        return None

def generate_text_report(summary):
    """
    Generate a text report from coverage summary
    
    Args:
        summary (dict): Coverage summary
    """
    report_path = "./reports/coverage_report.txt"
    
    with open(report_path, "w") as f:
        f.write("=== Test Coverage Report ===\n")
        f.write(f"Generated: {summary['timestamp']}\n\n")
        
        f.write("Overall Coverage:\n")
        f.write(f"  Statements: {summary['covered_statements']}/{summary['total_statements']}\n")
        f.write(f"  Coverage: {summary['coverage_percent']:.2f}%\n\n")
        
        f.write("File Coverage:\n")
        
        # Sort files by coverage percentage (ascending)
        sorted_files = sorted(
            summary["file_stats"].items(),
            key=lambda x: x[1]["percent"]
        )
        
        for file_path, stats in sorted_files:
            f.write(f"  {file_path}:\n")
            f.write(f"    Statements: {stats['covered']}/{stats['statements']}\n")
            f.write(f"    Coverage: {stats['percent']:.2f}%\n")
            
            if stats["missing_lines"]:
                f.write(f"    Missing Lines: {', '.join(map(str, stats['missing_lines']))}\n")
            
            f.write("\n")
        
        f.write("=== End of Report ===\n")
    
    print(f"Text report generated: {report_path}")

def identify_missing_tests():
    """
    Identify modules that need more test coverage
    
    Returns:
        list: List of modules that need more tests
    """
    try:
        # Load coverage summary
        with open("./reports/coverage_summary.json", "r") as f:
            summary = json.load(f)
        
        # Identify modules with low coverage
        low_coverage_modules = []
        for file_path, stats in summary["file_stats"].items():
            if stats["percent"] < 80:  # Threshold for low coverage
                low_coverage_modules.append({
                    "file": file_path,
                    "coverage": stats["percent"],
                    "missing_lines": stats["missing_lines"]
                })
        
        # Sort by coverage (ascending)
        low_coverage_modules.sort(key=lambda x: x["coverage"])
        
        # Save to file
        with open("./reports/missing_tests.json", "w") as f:
            json.dump(low_coverage_modules, f, indent=2)
        
        # Generate text report
        with open("./reports/missing_tests.txt", "w") as f:
            f.write("=== Modules Needing More Tests ===\n")
            
            for module in low_coverage_modules:
                f.write(f"{module['file']}:\n")
                f.write(f"  Coverage: {module['coverage']:.2f}%\n")
                f.write(f"  Missing Lines: {', '.join(map(str, module['missing_lines']))}\n\n")
        
        return low_coverage_modules
    except Exception as e:
        print(f"Error identifying missing tests: {e}")
        return []

def main():
    """Main function"""
    # Run coverage analysis
    summary = run_coverage_analysis()
    
    if summary:
        print(f"Overall coverage: {summary['coverage_percent']:.2f}%")
        
        # Identify missing tests
        low_coverage_modules = identify_missing_tests()
        
        if low_coverage_modules:
            print("\nModules needing more tests:")
            for module in low_coverage_modules:
                print(f"  {module['file']}: {module['coverage']:.2f}%")
        else:
            print("\nAll modules have good test coverage!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
