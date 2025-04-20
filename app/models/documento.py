from app import db
from datetime import datetime

class Documento(db.Model):
    __tablename__ = 'documentos'

    id = db.Column(db.Integer, primary_key=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('projetos.id'))
    nome = db.Column(db.String(100))
    caminho_arquivo = db.Column(db.String(255))
    tipo = db.Column(db.String(50))
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
