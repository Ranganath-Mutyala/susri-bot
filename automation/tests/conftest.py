import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


@pytest.fixture
def cfg(tmp_path):
    from ops.config import load
    text = (ROOT / "config.example.yaml").read_text()
    p = tmp_path / "config.yaml"
    p.write_text(text)
    return load(p)
