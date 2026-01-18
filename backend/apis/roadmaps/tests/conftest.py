"""Pytest configuration for Roadmaps API tests."""

import sys
from pathlib import Path

# Add the roadmaps module directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))
