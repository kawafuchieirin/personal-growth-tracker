"""Pytest configuration for Goals API tests."""

import sys
from pathlib import Path

# Add the goals module directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))
