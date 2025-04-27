#!/usr/bin/env python3
"""
Regex Optimization Module for Segmentation Service

This module provides optimized regex operations for the Segmentation Service.
It includes functions for regex caching, compilation, and efficient pattern matching.
"""

import re
import time
import logging
import functools
from typing import Any, Callable, Dict, List, Pattern, Match, Optional, Union, Tuple
import threading

# Setup logging
logger = logging.getLogger(__name__)

class RegexOptimizer:
    """
    Regex optimizer for improving performance of regular expression operations
    
    Features:
    - Regex pattern caching
    - Optimized pattern compilation
    - Efficient pattern matching
    - Pattern statistics and monitoring
    """
    
    def __init__(self, max_cache_size: int = 100):
        """
        Initialize regex optimizer
        
        Args:
            max_cache_size: Maximum number of compiled patterns to cache
        """
        self.max_cache_size = max_cache_size
        self._pattern_cache = {}
        self._pattern_stats = {}
        self._lock = threading.RLock()
        
        logger.info(f"Regex optimizer initialized with max cache size: {max_cache_size}")
    
    def compile(self, pattern: str, flags: int = 0) -> Pattern:
        """
        Compile regex pattern with caching
        
        Args:
            pattern: Regex pattern string
            flags: Regex flags
            
        Returns:
            Compiled regex pattern
        """
        # Create cache key
        cache_key = (pattern, flags)
        
        with self._lock:
            # Check if pattern is in cache
            if cache_key in self._pattern_cache:
                # Update stats
                if cache_key in self._pattern_stats:
                    self._pattern_stats[cache_key]["hits"] += 1
                
                return self._pattern_cache[cache_key]
            
            # Compile pattern
            start_time = time.time()
            compiled_pattern = re.compile(pattern, flags)
            compile_time = time.time() - start_time
            
            # Add to cache
            self._pattern_cache[cache_key] = compiled_pattern
            
            # Add to stats
            self._pattern_stats[cache_key] = {
                "pattern": pattern,
                "flags": flags,
                "hits": 0,
                "compile_time": compile_time,
                "created_at": time.time()
            }
            
            # Check if cache is full
            if len(self._pattern_cache) > self.max_cache_size:
                self._evict_cache_item()
            
            return compiled_pattern
    
    def match(self, pattern: str, string: str, flags: int = 0) -> Optional[Match]:
        """
        Match string against pattern
        
        Args:
            pattern: Regex pattern string
            string: String to match
            flags: Regex flags
            
        Returns:
            Match object or None
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.match(string)
    
    def search(self, pattern: str, string: str, flags: int = 0) -> Optional[Match]:
        """
        Search string for pattern
        
        Args:
            pattern: Regex pattern string
            string: String to search
            flags: Regex flags
            
        Returns:
            Match object or None
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.search(string)
    
    def findall(self, pattern: str, string: str, flags: int = 0) -> List[str]:
        """
        Find all occurrences of pattern in string
        
        Args:
            pattern: Regex pattern string
            string: String to search
            flags: Regex flags
            
        Returns:
            List of matched strings
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.findall(string)
    
    def finditer(self, pattern: str, string: str, flags: int = 0):
        """
        Find all occurrences of pattern in string as iterator
        
        Args:
            pattern: Regex pattern string
            string: String to search
            flags: Regex flags
            
        Returns:
            Iterator of match objects
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.finditer(string)
    
    def split(self, pattern: str, string: str, maxsplit: int = 0, flags: int = 0) -> List[str]:
        """
        Split string by pattern
        
        Args:
            pattern: Regex pattern string
            string: String to split
            maxsplit: Maximum number of splits
            flags: Regex flags
            
        Returns:
            List of split strings
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.split(string, maxsplit)
    
    def sub(self, pattern: str, repl: Union[str, Callable], string: str, count: int = 0, flags: int = 0) -> str:
        """
        Substitute pattern with replacement
        
        Args:
            pattern: Regex pattern string
            repl: Replacement string or function
            string: String to modify
            count: Maximum number of substitutions
            flags: Regex flags
            
        Returns:
            Modified string
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.sub(repl, string, count)
    
    def subn(self, pattern: str, repl: Union[str, Callable], string: str, count: int = 0, flags: int = 0) -> Tuple[str, int]:
        """
        Substitute pattern with replacement and return count
        
        Args:
            pattern: Regex pattern string
            repl: Replacement string or function
            string: String to modify
            count: Maximum number of substitutions
            flags: Regex flags
            
        Returns:
            Tuple of (modified string, number of substitutions)
        """
        compiled_pattern = self.compile(pattern, flags)
        return compiled_pattern.subn(repl, string, count)
    
    def optimize_pattern(self, pattern: str) -> str:
        """
        Optimize regex pattern for better performance
        
        Args:
            pattern: Regex pattern string
            
        Returns:
            Optimized pattern string
        """
        # Apply various optimizations to the pattern
        
        # 1. Add atomic grouping where possible
        # Convert (x|y|z) to (?>x|y|z) where appropriate
        pattern = re.sub(r'\(([^?].*?)\)', r'(>\1)', pattern)
        
        # 2. Use possessive quantifiers where possible
        # Convert a+ to a++ where appropriate
        pattern = pattern.replace('+', '++')
        pattern = pattern.replace('*', '*+')
        
        # 3. Optimize character classes
        # Convert [0-9] to \d
        pattern = pattern.replace('[0-9]', r'\d')
        
        # 4. Add anchors where appropriate
        if not pattern.startswith('^') and not pattern.startswith('.*'):
            pattern = '^' + pattern
        
        if not pattern.endswith('$') and not pattern.endswith('.*'):
            pattern = pattern + '$'
        
        return pattern
    
    def get_pattern_stats(self) -> Dict[Tuple[str, int], Dict[str, Any]]:
        """
        Get statistics for cached patterns
        
        Returns:
            Dictionary with pattern statistics
        """
        with self._lock:
            return self._pattern_stats.copy()
    
    def clear_cache(self):
        """Clear pattern cache"""
        with self._lock:
            self._pattern_cache.clear()
            self._pattern_stats.clear()
            
            # Call re.purge() to clear internal cache
            re.purge()
            
            logger.info("Regex pattern cache cleared")
    
    def _evict_cache_item(self):
        """Evict least used pattern from cache"""
        with self._lock:
            if not self._pattern_cache:
                return
            
            # Find least used pattern
            least_used_key = None
            least_hits = float('inf')
            
            for key, stats in self._pattern_stats.items():
                if stats["hits"] < least_hits:
                    least_hits = stats["hits"]
                    least_used_key = key
            
            # Remove from cache
            if least_used_key in self._pattern_cache:
                del self._pattern_cache[least_used_key]
                del self._pattern_stats[least_used_key]

# Create a global instance
regex_optimizer = RegexOptimizer()

# Function to get the regex optimizer instance
def get_regex_optimizer() -> RegexOptimizer:
    """
    Get the regex optimizer instance
    
    Returns:
        Regex optimizer instance
    """
    return regex_optimizer

# Optimized regex functions
def regex_match(pattern: str, string: str, flags: int = 0) -> Optional[Match]:
    """
    Optimized regex match function
    
    Args:
        pattern: Regex pattern string
        string: String to match
        flags: Regex flags
        
    Returns:
        Match object or None
    """
    return regex_optimizer.match(pattern, string, flags)

def regex_search(pattern: str, string: str, flags: int = 0) -> Optional[Match]:
    """
    Optimized regex search function
    
    Args:
        pattern: Regex pattern string
        string: String to search
        flags: Regex flags
        
    Returns:
        Match object or None
    """
    return regex_optimizer.search(pattern, string, flags)

def regex_findall(pattern: str, string: str, flags: int = 0) -> List[str]:
    """
    Optimized regex findall function
    
    Args:
        pattern: Regex pattern string
        string: String to search
        flags: Regex flags
        
    Returns:
        List of matched strings
    """
    return regex_optimizer.findall(pattern, string, flags)

def regex_sub(pattern: str, repl: Union[str, Callable], string: str, count: int = 0, flags: int = 0) -> str:
    """
    Optimized regex substitution function
    
    Args:
        pattern: Regex pattern string
        repl: Replacement string or function
        string: String to modify
        count: Maximum number of substitutions
        flags: Regex flags
        
    Returns:
        Modified string
    """
    return regex_optimizer.sub(pattern, repl, string, count, flags)

# Decorator for optimizing regex in functions
def optimize_regex(func: Callable) -> Callable:
    """
    Decorator to optimize regex operations in a function
    
    Args:
        func: Function to optimize
        
    Returns:
        Optimized function
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Patch regex functions in the re module
        original_compile = re.compile
        original_match = re.match
        original_search = re.search
        original_findall = re.findall
        original_sub = re.sub
        
        try:
            # Replace with optimized versions
            re.compile = regex_optimizer.compile
            re.match = regex_match
            re.search = regex_search
            re.findall = regex_findall
            re.sub = regex_sub
            
            # Call original function
            return func(*args, **kwargs)
        finally:
            # Restore original functions
            re.compile = original_compile
            re.match = original_match
            re.search = original_search
            re.findall = original_findall
            re.sub = original_sub
    
    return wrapper

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a regex optimizer
    optimizer = RegexOptimizer()
    
    # Test pattern compilation
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    
    # Compile pattern first time
    logger.info("Compiling pattern first time...")
    start_time = time.time()
    compiled_pattern = optimizer.compile(pattern)
    first_time = time.time() - start_time
    
    # Compile pattern second time (should be cached)
    logger.info("Compiling pattern second time (should be cached)...")
    start_time = time.time()
    compiled_pattern = optimizer.compile(pattern)
    second_time = time.time() - start_time
    
    logger.info(f"First compilation: {first_time:.6f} seconds")
    logger.info(f"Second compilation (cached): {second_time:.6f} seconds")
    logger.info(f"Speedup: {first_time/second_time:.2f}x")
    
    # Test pattern matching
    test_strings = [
        "test@example.com",
        "invalid-email",
        "another.test@example.co.uk",
        "not an email"
    ]
    
    for test_string in test_strings:
        match = optimizer.match(pattern, test_string)
        logger.info(f"Match '{test_string}': {match is not None}")
    
    # Test optimized pattern
    original_pattern = r'[a-zA-Z0-9]+'
    optimized_pattern = optimizer.optimize_pattern(original_pattern)
    logger.info(f"Original pattern: {original_pattern}")
    logger.info(f"Optimized pattern: {optimized_pattern}")
    
    # Test decorator
    @optimize_regex
    def extract_emails(text):
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return re.findall(email_pattern, text)
    
    test_text = "Contact us at info@example.com or support@example.org for assistance."
    emails = extract_emails(test_text)
    logger.info(f"Extracted emails: {emails}")
    
    # Get pattern stats
    stats = optimizer.get_pattern_stats()
    logger.info(f"Pattern stats: {stats}")
    
    # Clear cache
    optimizer.clear_cache()
    logger.info("Cache cleared")
