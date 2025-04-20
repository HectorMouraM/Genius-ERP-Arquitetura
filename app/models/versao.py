from app import db
from datetime import datetime

class Versao(db.Model):
    __tablename__ = 'versoes'

    id = db.Column(db.Integer, primary_key=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('projetos.id'))
    nome_arquivo = db.Column(db.String(100))
    caminho_arquivo = db.Column(db.String(255))
    versao = db.Column(db.String(50))
    data = db.Column(db.DateTime, default=datetime.utcnow)
