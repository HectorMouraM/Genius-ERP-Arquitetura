"""
Esquema do banco de dados para o Genius ERP Arquitetura.
Este módulo define a estrutura do banco de dados SQLite para o sistema.
"""

import sqlite3
import os
from datetime import datetime

class Database:
    """Classe para gerenciar o banco de dados SQLite do Genius ERP Arquitetura."""
    
    def __init__(self, db_path):
        """
        Inicializa a conexão com o banco de dados.
        
        Args:
            db_path (str): Caminho para o arquivo do banco de dados SQLite.
        """
        self.db_path = db_path
        self.connection = None
        self.cursor = None
        
    def connect(self):
        """Estabelece conexão com o banco de dados."""
        try:
            self.connection = sqlite3.connect(self.db_path)
            self.connection.row_factory = sqlite3.Row
            self.cursor = self.connection.cursor()
            return True
        except sqlite3.Error as e:
            print(f"Erro ao conectar ao banco de dados: {e}")
            return False
            
    def close(self):
        """Fecha a conexão com o banco de dados."""
        if self.connection:
            self.connection.close()
            
    def commit(self):
        """Confirma as alterações no banco de dados."""
        if self.connection:
            self.connection.commit()
            
    def create_tables(self):
        """Cria as tabelas do banco de dados se não existirem."""
        try:
            # Tabela de Projetos
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                description TEXT,
                project_type TEXT NOT NULL,  -- comercial ou residencial
                project_subtype TEXT,        -- interiores, planta, etc.
                hourly_rate REAL NOT NULL,   -- valor da hora de trabalho
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # Tabela de Etapas
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS stages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                deadline TIMESTAMP,
                status TEXT DEFAULT 'pendente',  -- pendente, em_andamento, concluida
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
            )
            ''')
            
            # Tabela de Controle de Tempo
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS time_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stage_id INTEGER NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                duration INTEGER,  -- duração em segundos
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
            )
            ''')
            
            # Tabela de Fotos
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stage_id INTEGER NOT NULL,
                file_path TEXT NOT NULL,
                description TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
            )
            ''')
            
            # Tabela de Relatórios
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
            )
            ''')
            
            self.commit()
            return True
        except sqlite3.Error as e:
            print(f"Erro ao criar tabelas: {e}")
            return False
            
    def initialize_database(self):
        """Inicializa o banco de dados, criando-o se não existir."""
        db_dir = os.path.dirname(self.db_path)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
            
        if self.connect():
            success = self.create_tables()
            self.close()
            return success
        return False


def init_db(db_path):
    """
    Inicializa o banco de dados do Genius ERP Arquitetura.
    
    Args:
        db_path (str): Caminho para o arquivo do banco de dados SQLite.
        
    Returns:
        bool: True se a inicialização for bem-sucedida, False caso contrário.
    """
    db = Database(db_path)
    return db.initialize_database()


if __name__ == "__main__":
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          "database", "genius_erp.db")
    
    # Inicializa o banco de dados
    if init_db(db_path):
        print("Banco de dados inicializado com sucesso!")
    else:
        print("Falha ao inicializar o banco de dados.")
