from app import db
from datetime import datetime

class Comunicacao(db.Model):
    __tablename__ = 'comunicacoes'

    id = db.Column(db.Integer, primary_key=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('projetos.id'))
    tipo = db.Column(db.String(20))  # reuniao, email, anotacao
    conteudo = db.Column(db.Text)
    data = db.Column(db.DateTime, default=datetime.utcnow)
