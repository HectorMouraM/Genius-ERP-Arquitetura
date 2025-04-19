from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json
import sqlite3
import datetime
from werkzeug.utils import secure_filename

# Configuração de caminhos
app_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(app_dir, 'database', 'genius_erp.db')
static_dir = os.path.join(app_dir, 'static')
templates_dir = os.path.join(app_dir, 'templates')
uploads_dir = os.path.join(static_dir, 'uploads')

# Garante que o diretório de uploads existe
os.makedirs(uploads_dir, exist_ok=True)

# Inicialização do Flask
app = Flask(__name__, 
            static_folder=static_dir,
            template_folder=templates_dir)

# Funções auxiliares para o banco de dados
def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# Rotas da API
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = get_db_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT p.*, 
               COUNT(s.id) as stage_count,
               SUM(CASE WHEN s.status = 'concluida' THEN 1 ELSE 0 END) as completed_stages
        FROM projects p
        LEFT JOIN stages s ON p.id = s.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ''')
    projects = cursor.fetchall()
    
    # Adiciona as etapas a cada projeto
    for project in projects:
        cursor.execute('SELECT * FROM stages WHERE project_id = ?', (project['id'],))
        project['stages'] = cursor.fetchall()
    
    conn.close()
    return jsonify(projects)

@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO projects (client_name, description, project_type, project_subtype, hourly_rate, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['client_name'],
        data.get('description', ''),
        data['project_type'],
        data.get('project_subtype', ''),
        data['hourly_rate'],
        datetime.datetime.now().isoformat()
    ))
    
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': project_id, 'message': 'Projeto criado com sucesso'})

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    conn = get_db_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
    project = cursor.fetchone()
    
    if not project:
        conn.close()
        return jsonify({'error': 'Projeto não encontrado'}), 404
    
    cursor.execute('SELECT * FROM stages WHERE project_id = ? ORDER BY id', (project_id,))
    project['stages'] = cursor.fetchall()
    
    conn.close()
    return jsonify(project)

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE projects
        SET client_name = ?, description = ?, project_type = ?, project_subtype = ?, hourly_rate = ?
        WHERE id = ?
    ''', (
        data['client_name'],
        data.get('description', ''),
        data['project_type'],
        data.get('project_subtype', ''),
        data['hourly_rate'],
        project_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Projeto atualizado com sucesso'})

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Primeiro, exclui todas as etapas associadas
    cursor.execute('DELETE FROM stages WHERE project_id = ?', (project_id,))
    
    # Em seguida, exclui o projeto
    cursor.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Projeto excluído com sucesso'})

@app.route('/api/projects/<int:project_id>/stages', methods=['POST'])
def create_stage(project_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO stages (project_id, name, description, deadline, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        project_id,
        data['name'],
        data.get('description', ''),
        data.get('deadline', None),
        'pendente',  # Status inicial
        datetime.datetime.now().isoformat()
    ))
    
    stage_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': stage_id, 'message': 'Etapa criada com sucesso'})

@app.route('/api/stages/<int:stage_id>', methods=['GET'])
def get_stage(stage_id):
    conn = get_db_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM stages WHERE id = ?', (stage_id,))
    stage = cursor.fetchone()
    
    if not stage:
        conn.close()
        return jsonify({'error': 'Etapa não encontrada'}), 404
    
    cursor.execute('SELECT * FROM time_records WHERE stage_id = ? ORDER BY start_time DESC', (stage_id,))
    stage['time_records'] = cursor.fetchall()
    
    cursor.execute('SELECT * FROM photos WHERE stage_id = ? ORDER BY id DESC', (stage_id,))
    stage['photos'] = cursor.fetchall()
    
    conn.close()
    return jsonify(stage)

@app.route('/api/stages/<int:stage_id>', methods=['PUT'])
def update_stage(stage_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Construir a consulta SQL dinamicamente com base nos campos fornecidos
    update_fields = []
    params = []
    
    if 'name' in data:
        update_fields.append('name = ?')
        params.append(data['name'])
    
    if 'description' in data:
        update_fields.append('description = ?')
        params.append(data['description'])
    
    if 'deadline' in data:
        update_fields.append('deadline = ?')
        params.append(data['deadline'])
    
    if 'status' in data:
        update_fields.append('status = ?')
        params.append(data['status'])
    
    if not update_fields:
        conn.close()
        return jsonify({'error': 'Nenhum campo para atualizar'}), 400
    
    query = f"UPDATE stages SET {', '.join(update_fields)} WHERE id = ?"
    params.append(stage_id)
    
    cursor.execute(query, params)
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Etapa atualizada com sucesso'})

@app.route('/api/stages/<int:stage_id>/time', methods=['POST'])
def start_time_record(stage_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifica se já existe um registro de tempo em aberto para esta etapa
    cursor.execute('SELECT id FROM time_records WHERE stage_id = ? AND end_time IS NULL', (stage_id,))
    existing_record = cursor.fetchone()
    
    if existing_record:
        conn.close()
        return jsonify({'error': 'Já existe um timer em andamento para esta etapa'}), 400
    
    # Atualiza o status da etapa para "em_andamento"
    cursor.execute('UPDATE stages SET status = ? WHERE id = ?', ('em_andamento', stage_id))
    
    # Cria um novo registro de tempo
    start_time = datetime.datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO time_records (stage_id, start_time, notes)
        VALUES (?, ?, ?)
    ''', (
        stage_id,
        start_time,
        data.get('notes', '')
    ))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': record_id,
        'start_time': start_time,
        'message': 'Timer iniciado com sucesso'
    })

@app.route('/api/time/<int:record_id>/stop', methods=['PUT'])
def stop_time_record(record_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verifica se o registro existe e está em aberto
    cursor.execute('SELECT * FROM time_records WHERE id = ?', (record_id,))
    record = cursor.fetchone()
    
    if not record:
        conn.close()
        return jsonify({'error': 'Registro de tempo não encontrado'}), 404
    
    if record[3]:  # end_time já está definido
        conn.close()
        return jsonify({'error': 'Este timer já foi finalizado'}), 400
    
    # Calcula a duração em segundos
    start_time = datetime.datetime.fromisoformat(record[2])
    end_time = datetime.datetime.now()
    duration = int((end_time - start_time).total_seconds())
    
    # Atualiza o registro de tempo
    cursor.execute('''
        UPDATE time_records
        SET end_time = ?, duration = ?, notes = ?
        WHERE id = ?
    ''', (
        end_time.isoformat(),
        duration,
        data.get('notes', record[5]),
        record_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'end_time': end_time.isoformat(),
        'duration': duration,
        'message': 'Timer finalizado com sucesso'
    })

@app.route('/api/stages/<int:stage_id>/photos', methods=['POST'])
def upload_photo(stage_id):
    if 'photo' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    photo = request.files['photo']
    
    if photo.filename == '':
        return jsonify({'error': 'Nome de arquivo inválido'}), 400
    
    # Garante um nome de arquivo seguro e único
    filename = secure_filename(f"{stage_id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{photo.filename}")
    file_path = os.path.join(uploads_dir, filename)
    
    # Salva o arquivo
    photo.save(file_path)
    
    # Salva os metadados no banco de dados
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO photos (stage_id, file_path, description, uploaded_at)
        VALUES (?, ?, ?, ?)
    ''', (
        stage_id,
        f"uploads/{filename}",
        request.form.get('description', ''),
        datetime.datetime.now().isoformat()
    ))
    
    photo_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': photo_id,
        'file_path': f"uploads/{filename}",
        'message': 'Foto enviada com sucesso'
    })

@app.route('/api/projects/<int:project_id>/report', methods=['GET'])
def generate_report(project_id):
    conn = get_db_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    # Obtém os dados do projeto
    cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
    project = cursor.fetchone()
    
    if not project:
        conn.close()
        return jsonify({'error': 'Projeto não encontrado'}), 404
    
    # Obtém as etapas do projeto
    cursor.execute('SELECT * FROM stages WHERE project_id = ? ORDER BY id', (project_id,))
    stages = cursor.fetchall()
    
    # Para cada etapa, obtém os registros de tempo e fotos
    for stage in stages:
        cursor.execute('SELECT * FROM time_records WHERE stage_id = ? ORDER BY start_time', (stage['id'],))
        stage['time_records'] = cursor.fetchall()
        
        cursor.execute('SELECT * FROM photos WHERE stage_id = ? ORDER BY uploaded_at', (stage['id'],))
        stage['photos'] = cursor.fetchall()
        
        # Calcula o tempo total da etapa
        total_time = 0
        for record in stage['time_records']:
            if record['duration']:
                total_time += record['duration']
        stage['total_time'] = total_time
    
    # Calcula o tempo total do projeto
    total_project_time = sum(stage['total_time'] for stage in stages)
    
    # Calcula o custo total do projeto
    total_cost = (total_project_time / 3600) * project['hourly_rate']
    
    report = {
        'project': project,
        'stages': stages,
        'total_time': total_project_time,
        'total_cost': total_cost
    }
    
    conn.close()
    return jsonify({'report': report})

# Inicialização da aplicação
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
