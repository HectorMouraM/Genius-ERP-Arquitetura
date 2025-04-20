import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "dev"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, '../database/genius_erp.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
