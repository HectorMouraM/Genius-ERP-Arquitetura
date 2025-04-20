from app import db
from datetime import datetime

class Foto(db.Model):
    __tablename__ = 'fotos'

    id = db.Column(db.Integer, primary_key=True)
    etapa_id = db.Column(db.Integer, db.ForeignKey('etapas.id'))
    caminho_arquivo = db.Column(db.String(255))
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
