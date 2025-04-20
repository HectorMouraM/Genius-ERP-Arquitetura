from app import db
from datetime import datetime

class Projeto(db.Model):
    __tablename__ = 'projetos'

    id = db.Column(db.Integer, primary_key=True)
    cliente_nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.Text)
    tipo = db.Column(db.String(50))  # comercial ou residencial
    subtipo = db.Column(db.String(50))  # interiores, planta, etc.
    valor_hora = db.Column(db.Float)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    etapas = db.relationship('Etapa', backref='projeto', cascade="all, delete-orphan")
    documentos = db.relationship('Documento', backref='projeto', cascade="all, delete-orphan")
    comunicacoes = db.relationship('Comunicacao', backref='projeto', cascade="all, delete-orphan")
    pagamentos = db.relationship('Pagamento', backref='projeto', cascade="all, delete-orphan")
    versoes = db.relationship('Versao', backref='projeto', cascade="all, delete-orphan")
