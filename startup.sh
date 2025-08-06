#!/bin/bash

# Installer poetry si ce n’est pas déjà présent
pip install poetry

# Installer les dépendances définies dans pyproject.toml
poetry install

# Démarrer l’application (adapter à votre cas, ex: uvicorn)
poetry run python app.py
