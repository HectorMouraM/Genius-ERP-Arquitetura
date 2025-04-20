from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    db.init_app(app)
    migrate.init_app(app, db)

    # Importa os models
    from app.models import projeto, etapa, foto, documento, comunicacao, pagamento, versao, modelo_etapa

    # Importa e registra os blueprints
    from app.routes.project_routes import project_bp
    from app.routes.stage_routes import stage_bp

    app.register_blueprint(project_bp)
    app.register_blueprint(stage_bp)

    return app
