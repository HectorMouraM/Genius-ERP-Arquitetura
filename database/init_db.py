import sqlite3

def criar_banco():
    conn = sqlite3.connect("database/genius_erp.db")
    cursor = conn.cursor()

    cursor.executescript("""
    -- PROJETOS
    CREATE TABLE projetos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_nome TEXT NOT NULL,
        descricao TEXT,
        tipo TEXT CHECK(tipo IN ('residencial', 'comercial')),
        subtipo TEXT,
        valor_hora REAL,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ETAPAS
    CREATE TABLE etapas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER,
        nome TEXT NOT NULL,
        prazo DATE,
        inicio DATETIME,
        fim DATETIME,
        tempo_total_segundos INTEGER DEFAULT 0,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    );

    -- FOTOS
    CREATE TABLE fotos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        etapa_id INTEGER,
        caminho_arquivo TEXT,
        data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (etapa_id) REFERENCES etapas(id) ON DELETE CASCADE
    );

    -- DOCUMENTOS
    CREATE TABLE documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER,
        nome TEXT,
        caminho_arquivo TEXT,
        tipo TEXT,
        data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    );

    -- COMUNICAÇÕES
    CREATE TABLE comunicacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER,
        tipo TEXT CHECK(tipo IN ('reuniao', 'email', 'anotacao')),
        conteudo TEXT,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    );

    -- PAGAMENTOS
    CREATE TABLE pagamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER,
        valor REAL,
        data_pagamento DATE,
        metodo TEXT,
        observacao TEXT,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    );

    -- VERSÕES
    CREATE TABLE versoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER,
        nome_arquivo TEXT,
        caminho_arquivo TEXT,
        versao TEXT,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    );

    -- MODELOS DE ETAPAS
    CREATE TABLE modelos_etapas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        etapas TEXT
    );
    """)

    conn.commit()
    conn.close()
    print("✅ Banco de dados criado com sucesso!")

if __name__ == "__main__":
    criar_banco()
