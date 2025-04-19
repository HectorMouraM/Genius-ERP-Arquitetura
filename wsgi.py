#!/usr/bin/env python3
"""
Script para preparar o Genius ERP Arquitetura para implantação web.
Este script configura o aplicativo para ser servido por um servidor WSGI.
"""

import os
from app import app

if __name__ == "__main__":
    # Configuração para produção
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
    
    # Porta para o servidor web (pode ser substituída pela variável de ambiente PORT)
    port = int(os.environ.get("PORT", 8080))
    
    # Inicia o servidor
    app.run(host='0.0.0.0', port=port)
