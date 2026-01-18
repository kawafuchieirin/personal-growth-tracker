#!/usr/bin/env python3
"""Generate OpenAPI specification for Skills API."""

import json
from pathlib import Path

import yaml

from main import app


def generate_openapi_spec():
    """Generate OpenAPI specification in JSON and YAML formats."""
    openapi_schema = app.openapi()

    output_dir = Path(__file__).parent / "docs"
    output_dir.mkdir(exist_ok=True)

    # JSON format
    json_path = output_dir / "openapi.json"
    with open(json_path, "w") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)
    print(f"Generated: {json_path}")

    # YAML format
    yaml_path = output_dir / "openapi.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(openapi_schema, f, allow_unicode=True, default_flow_style=False)
    print(f"Generated: {yaml_path}")


if __name__ == "__main__":
    generate_openapi_spec()
