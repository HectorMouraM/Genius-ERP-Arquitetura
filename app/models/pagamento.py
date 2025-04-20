from app import db

class Pagamento(db.Model):
    __tablename__ = 'pagamentos'

    id = db.Column(db.Integer, primary_key=True)
    projeto_id = db.Column(db.Integer, db.ForeignKey('projetos.id'))
    valor = db.Column(db.Float)
    data_pagamento = db.Column(db.Date)
    metodo = db.Column(db.String(50))
    observacao = db.Column(db.Text)
