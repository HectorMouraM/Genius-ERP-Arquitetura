from flask import Blueprint, render_template, request, redirect, url_for
from app import db
from app.models.projeto import Projeto

project_bp = Blueprint("project_bp", __name__)

@project_bp.route("/")
def index():
    projetos = Projeto.query.all()
    return render_template("index.html", projetos=projetos)

@project_bp.route("/projeto/novo", methods=["POST"])
def criar_projeto():
    nome = request.form["cliente_nome"]
    descricao = request.form.get("descricao")
    tipo = request.form.get("tipo")
    subtipo = request.form.get("subtipo")
    valor_hora = float(request.form.get("valor_hora", 0))

    projeto = Projeto(
        cliente_nome=nome,
        descricao=descricao,
        tipo=tipo,
        subtipo=subtipo,
        valor_hora=valor_hora
    )
    db.session.add(projeto)
    db.session.commit()
    return redirect(url_for("project_bp.index"))

@project_bp.route("/projeto/deletar/<int:id>", methods=["POST"])
def deletar_projeto(id):
    projeto = Projeto.query.get_or_404(id)
    db.session.delete(projeto)
    db.session.commit()
    return redirect(url_for("project_bp.index"))
