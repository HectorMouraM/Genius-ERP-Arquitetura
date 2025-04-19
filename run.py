#!/usr/bin/env python3
"""
Script de inicialização do aplicativo Genius ERP Arquitetura.
Este script inicia o servidor Flask.
"""

import os
import sys

# Adiciona o diretório raiz ao path para importar módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importa o aplicativo Flask
from app import app

def main():
    """Função principal para inicializar o aplicativo."""
    print("Iniciando o servidor Flask...")
    # Inicia o servidor Flask
    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == "__main__":
    main()
