import click
from source import db


def register_initdb(app):
    @app.cli.command()
    @click.option('--drop', is_flag=True, help='Create after drop')
    def initdb(drop):
        """Initialize the database"""
        if drop:
            click.confirm('This operation will delete the database, do you want to continue?', abort=True)
            db.drop_all()
            click.echo('Dropped tables.')
        db.create_all()
        click.echo('Initialized database.')
        pass
