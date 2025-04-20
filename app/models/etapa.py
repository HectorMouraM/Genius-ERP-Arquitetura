from app import db
from datetime import datetime

class Etapa(db.Model):
    __tablename__ = 'etapas'

    id = db.Column(db.Integer, primary_key=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('projetos.id'))
    nome = db.Column(db.String(100), nullable=False)
    prazo = db.Column(db.Date)
    inicio = db.Column(db.DateTime)
    fim = db.Column(db.DateTime)
    tempo_total_segundos = db.Column(db.Integer, default=0)

    fotos = db.relationship('Foto', backref='etapa', cascade="all, delete-orphan")
