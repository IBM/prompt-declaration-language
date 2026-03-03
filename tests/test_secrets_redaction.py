"""Tests for secrets redaction in write_trace function."""

import json
import tempfile
from pathlib import Path

from src.pdl.pdl_ast import TextBlock
from src.pdl.pdl_utils import redact_secrets, write_trace


class TestRedactSecrets:
    """Test the redact_secrets helper function."""

    def test_redact_simple_string(self):
        """Test redacting a secret from a simple string."""
        data = "My password is secret123"
        result = redact_secrets(data, ["secret123"])
        assert result == "My password is [REDACTED]"

    def test_redact_multiple_secrets(self):
        """Test redacting multiple secrets from a string."""
        data = "password: secret123, token: abc456"
        result = redact_secrets(data, ["secret123", "abc456"])
        assert result == "password: [REDACTED], token: [REDACTED]"

    def test_redact_nested_dict(self):
        """Test redacting secrets from nested dictionaries."""
        data = {
            "user": "john",
            "password": "secret123",
            "nested": {"token": "secret123", "public": "data"},
        }
        result = redact_secrets(data, ["secret123"])
        assert result["password"] == "[REDACTED]"
        assert result["nested"]["token"] == "[REDACTED]"
        assert result["nested"]["public"] == "data"
        assert result["user"] == "john"

    def test_redact_list(self):
        """Test redacting secrets from lists."""
        data = ["public", "secret123", "data", "secret123"]
        result = redact_secrets(data, ["secret123"])
        assert result == ["public", "[REDACTED]", "data", "[REDACTED]"]

    def test_redact_mixed_structure(self):
        """Test redacting secrets from mixed data structures."""
        data = {
            "items": ["public", "secret123"],
            "config": {"key": "secret123", "value": 42},
            "text": "Contains secret123 here",
        }
        result = redact_secrets(data, ["secret123"])
        assert result["items"] == ["public", "[REDACTED]"]
        assert result["config"]["key"] == "[REDACTED]"
        assert result["config"]["value"] == 42
        assert result["text"] == "Contains [REDACTED] here"

    def test_empty_secrets_list(self):
        """Test that empty secrets list returns data unchanged."""
        data = "secret123"
        result = redact_secrets(data, [])
        assert result == "secret123"

    def test_no_matching_secrets(self):
        """Test that non-matching secrets leave data unchanged."""
        data = "public data"
        result = redact_secrets(data, ["secret123"])
        assert result == "public data"

    def test_case_sensitive(self):
        """Test that redaction is case-sensitive."""
        data = "Secret123 and secret123"
        result = redact_secrets(data, ["secret123"])
        assert result == "Secret123 and [REDACTED]"

    def test_primitives_unchanged(self):
        """Test that primitive types pass through unchanged."""
        assert redact_secrets(42, ["secret"]) == 42
        assert redact_secrets(3.14, ["secret"]) == 3.14
        assert redact_secrets(True, ["secret"]) is True
        assert redact_secrets(None, ["secret"]) is None

    def test_partial_match_in_string(self):
        """Test that secrets are replaced even when part of larger strings."""
        data = "prefix_secret123_suffix"
        result = redact_secrets(data, ["secret123"])
        assert result == "prefix_[REDACTED]_suffix"

    def test_multiple_occurrences(self):
        """Test redacting multiple occurrences of the same secret."""
        data = "secret123 and secret123 again"
        result = redact_secrets(data, ["secret123"])
        assert result == "[REDACTED] and [REDACTED] again"


class TestWriteTrace:
    """Test the write_trace function with secrets redaction."""

    def test_write_trace_without_secrets(self):
        """Test writing trace without secrets redaction."""
        trace = TextBlock(text="API key is sk-1234567890")

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as f:
            temp_file = Path(f.name)

        try:
            write_trace(temp_file, trace)
            with open(temp_file, "r") as f:
                data = json.load(f)

            content = json.dumps(data)
            assert "sk-1234567890" in content
        finally:
            temp_file.unlink()

    def test_write_trace_with_secrets(self):
        """Test writing trace with secrets redaction."""
        trace = TextBlock(text="API key is sk-1234567890 and password is mySecret123")

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as f:
            temp_file = Path(f.name)

        try:
            write_trace(temp_file, trace, secrets=["sk-1234567890", "mySecret123"])
            with open(temp_file, "r") as f:
                data = json.load(f)

            content = json.dumps(data)
            assert "sk-1234567890" not in content
            assert "mySecret123" not in content
            assert "[REDACTED]" in content
        finally:
            temp_file.unlink()

    def test_write_trace_backward_compatibility(self):
        """Test that write_trace works without secrets parameter (backward compatibility)."""
        trace = TextBlock(text="Some trace data")

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as f:
            temp_file = Path(f.name)

        try:
            # Should work without errors
            write_trace(temp_file, trace)
            assert temp_file.exists()
        finally:
            temp_file.unlink()

    def test_write_trace_with_empty_secrets(self):
        """Test writing trace with empty secrets list."""
        trace = TextBlock(text="API key is sk-1234567890")

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as f:
            temp_file = Path(f.name)

        try:
            write_trace(temp_file, trace, secrets=[])
            with open(temp_file, "r") as f:
                data = json.load(f)

            content = json.dumps(data)
            # Empty secrets list should not redact anything
            assert "sk-1234567890" in content
        finally:
            temp_file.unlink()

    def test_write_trace_with_none_secrets(self):
        """Test writing trace with None secrets parameter."""
        trace = TextBlock(text="API key is sk-1234567890")

        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as f:
            temp_file = Path(f.name)

        try:
            write_trace(temp_file, trace, secrets=None)
            with open(temp_file, "r") as f:
                data = json.load(f)

            content = json.dumps(data)
            # None secrets should not redact anything
            assert "sk-1234567890" in content
        finally:
            temp_file.unlink()
