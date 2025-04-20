from flask import Blueprint, request, redirect, url_for
from app import db
from app.models.etapa import Etapa

stage_bp = Blueprint("stage_bp", __name__)

@stage_bp.route("/etapa/iniciar/<int:id>", methods=["POST"])
def iniciar_etapa(id):
    etapa = Etapa.query.get_or_404(id)
    etapa.inicio = db.func.current_timestamp()
    db.session.commit()
    return redirect(url_for("project_bp.index"))

@stage_bp.route("/etapa/finalizar/<int:id>", methods=["POST"])
def finalizar_etapa(id):
    etapa = Etapa.query.get_or_404(id)
    etapa.fim = db.func.current_timestamp()

    if etapa.inicio:
        duracao = (etapa.fim - etapa.inicio).total_seconds()
        etapa.tempo_total_segundos += int(duracao)

    db.session.commit()
    return redirect(url_for("project_bp.index"))
