# Guia de Implantação do Genius ERP Arquitetura

Este documento fornece instruções detalhadas para implantar o Genius ERP Arquitetura como um site web permanente.

## Requisitos de Servidor

- Sistema operacional: Ubuntu 20.04 LTS ou superior
- Python 3.8 ou superior
- Nginx
- Gunicorn
- Certificado SSL (recomendado Let's Encrypt)
- Domínio registrado (opcional, mas recomendado)

## Etapas de Implantação

### 1. Preparação do Servidor

```bash
# Atualizar o sistema
sudo apt update
sudo apt upgrade -y

# Instalar dependências
sudo apt install -y python3-pip python3-venv nginx

# Criar usuário para a aplicação (opcional)
sudo useradd -m -s /bin/bash genius_erp
```

### 2. Configuração da Aplicação

```bash
# Criar diretório para a aplicação
sudo mkdir -p /var/www/genius_erp_arquitetura

# Copiar os arquivos da aplicação
sudo cp -r /caminho/para/genius_erp_arquitetura/* /var/www/genius_erp_arquitetura/

# Definir permissões
sudo chown -R www-data:www-data /var/www/genius_erp_arquitetura
sudo chmod -R 755 /var/www/genius_erp_arquitetura

# Criar ambiente virtual
cd /var/www/genius_erp_arquitetura
sudo python3 -m venv venv
sudo ./venv/bin/pip install -r requirements.txt
sudo ./venv/bin/pip install gunicorn
```

### 3. Configuração do Gunicorn

Edite o arquivo de serviço systemd:

```bash
sudo nano /etc/systemd/system/genius_erp.service
```

Copie o conteúdo abaixo, substituindo os caminhos conforme necessário:

```ini
[Unit]
Description=Genius ERP Arquitetura
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/genius_erp_arquitetura
ExecStart=/var/www/genius_erp_arquitetura/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8080 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Ative e inicie o serviço:

```bash
sudo systemctl enable genius_erp
sudo systemctl start genius_erp
sudo systemctl status genius_erp
```

### 4. Configuração do Nginx

Crie um arquivo de configuração para o Nginx:

```bash
sudo nano /etc/nginx/sites-available/genius_erp
```

Copie o conteúdo abaixo, substituindo o domínio conforme necessário:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/genius_erp_arquitetura/static;
        expires 30d;
    }
}
```

Ative a configuração e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/genius_erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configuração do SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

### 6. Inicialização do Banco de Dados

```bash
cd /var/www/genius_erp_arquitetura
sudo ./venv/bin/python -m database.init_db
```

## Implantação Usando Serviços de Hospedagem

### Opção 1: Implantação no PythonAnywhere

1. Crie uma conta no PythonAnywhere (www.pythonanywhere.com)
2. Faça upload dos arquivos da aplicação
3. Configure um novo aplicativo web:
   - Framework: Flask
   - Python Version: 3.8 ou superior
   - Caminho para o arquivo WSGI: /home/seuusuario/genius_erp_arquitetura/wsgi.py
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
5. Configure o banco de dados:
   ```bash
   python -m database.init_db
   ```
6. Reinicie o aplicativo web

### Opção 2: Implantação no Heroku

1. Crie uma conta no Heroku (www.heroku.com)
2. Instale o Heroku CLI
3. Crie um arquivo Procfile na raiz do projeto:
   ```
   web: gunicorn wsgi:app
   ```
4. Inicialize um repositório Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
5. Crie um aplicativo Heroku:
   ```bash
   heroku create genius-erp-arquitetura
   git push heroku master
   ```
6. Configure o banco de dados:
   ```bash
   heroku run python -m database.init_db
   ```

### Opção 3: Implantação no Render

1. Crie uma conta no Render (render.com)
2. Crie um novo Web Service
3. Conecte ao repositório Git
4. Configure o serviço:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app`
5. Configure variáveis de ambiente se necessário
6. Implante o serviço

## Manutenção e Monitoramento

### Logs da Aplicação

```bash
# Logs do Gunicorn
sudo journalctl -u genius_erp

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup do Banco de Dados

```bash
# Backup manual
cp /var/www/genius_erp_arquitetura/database/genius_erp.db /backup/genius_erp_$(date +%Y%m%d).db

# Backup automatizado (adicione ao crontab)
# 0 2 * * * cp /var/www/genius_erp_arquitetura/database/genius_erp.db /backup/genius_erp_$(date +%Y%m%d).db
```

### Atualização da Aplicação

```bash
# Parar o serviço
sudo systemctl stop genius_erp

# Fazer backup do banco de dados
cp /var/www/genius_erp_arquitetura/database/genius_erp.db /backup/genius_erp_$(date +%Y%m%d).db

# Atualizar os arquivos
# (copie os novos arquivos para o diretório da aplicação)

# Atualizar dependências se necessário
cd /var/www/genius_erp_arquitetura
sudo ./venv/bin/pip install -r requirements.txt

# Reiniciar o serviço
sudo systemctl start genius_erp
```

## Solução de Problemas

### Aplicação não inicia

1. Verifique os logs do serviço:
   ```bash
   sudo journalctl -u genius_erp
   ```

2. Verifique se o Gunicorn está em execução:
   ```bash
   ps aux | grep gunicorn
   ```

3. Teste a aplicação manualmente:
   ```bash
   cd /var/www/genius_erp_arquitetura
   ./venv/bin/python wsgi.py
   ```

### Problemas com o Nginx

1. Verifique a sintaxe da configuração:
   ```bash
   sudo nginx -t
   ```

2. Verifique os logs do Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Verifique se o Nginx está em execução:
   ```bash
   sudo systemctl status nginx
   ```

### Problemas com o Banco de Dados

1. Verifique as permissões do arquivo de banco de dados:
   ```bash
   ls -la /var/www/genius_erp_arquitetura/database/
   ```

2. Tente reinicializar o banco de dados:
   ```bash
   cd /var/www/genius_erp_arquitetura
   sudo ./venv/bin/python -m database.init_db
   ```

## Conclusão

Seguindo este guia, você terá implantado com sucesso o Genius ERP Arquitetura como um site web permanente. Para qualquer dúvida ou problema adicional, consulte a documentação oficial do Flask, Gunicorn e Nginx, ou entre em contato com o desenvolvedor.
