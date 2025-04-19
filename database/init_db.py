#!/usr/bin/env python3
"""
Script de inicialização do banco de dados para o Genius ERP Arquitetura.
Este script cria o banco de dados SQLite e as tabelas necessárias.
"""

import os
import sys

# Adiciona o diretório raiz ao path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importa o módulo de banco de dados
from database.schema import init_db

def main():
    """Função principal para inicializar o banco de dados."""
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          "database", "genius_erp.db")
    
    print(f"Inicializando banco de dados em: {db_path}")
    
    # Inicializa o banco de dados
    if init_db(db_path):
        print("Banco de dados inicializado com sucesso!")
    else:
        print("Falha ao inicializar o banco de dados.")
        sys.exit(1)

if __name__ == "__main__":
    main()
