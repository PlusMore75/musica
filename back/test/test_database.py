import importlib
import os
import pytest


def test_database_url_construction(monkeypatch):
    monkeypatch.setenv("DB_HOST", "localhost")
    monkeypatch.setenv("DB_PORT", "3306")
    monkeypatch.setenv("DB_NAME", "testdb")
    monkeypatch.setenv("DB_USER", "user")
    monkeypatch.setenv("DB_PASSWORD", "pass")

    import database
    importlib.reload(database)

    expected_url = "mysql+aiomysql://user:pass@localhost:3306/testdb"

    assert database.DATABASE_URL == expected_url


def test_engine_created(monkeypatch):
    monkeypatch.setenv("DB_HOST", "localhost")
    monkeypatch.setenv("DB_PORT", "3306")
    monkeypatch.setenv("DB_NAME", "testdb")
    monkeypatch.setenv("DB_USER", "user")
    monkeypatch.setenv("DB_PASSWORD", "pass")

    import database
    importlib.reload(database)

    assert database.engine is not None


def test_sessionlocal_configuration(monkeypatch):
    monkeypatch.setenv("DB_HOST", "localhost")
    monkeypatch.setenv("DB_PORT", "3306")
    monkeypatch.setenv("DB_NAME", "testdb")
    monkeypatch.setenv("DB_USER", "user")
    monkeypatch.setenv("DB_PASSWORD", "pass")

    import database
    importlib.reload(database)

    session_factory = database.SessionLocal

    assert session_factory.kw["bind"] == database.engine
    assert session_factory.kw["expire_on_commit"] is False
