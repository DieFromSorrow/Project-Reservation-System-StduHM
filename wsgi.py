from source import create_app, socketio
from source.settings import DevelopmentConfig

app = create_app(config=DevelopmentConfig)

if __name__ == '__main__':
    with app.app_context():
        socketio.run(app, host='0.0.0.0', port=80)
