from app import db

class ModeloEtapa(db.Model):
    __tablename__ = 'modelos_etapas'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    etapas = db.Column(db.Text)  # Etapas salvas como JSON serializado
