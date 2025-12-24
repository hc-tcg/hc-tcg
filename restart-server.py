# Restart hermitcraft TCG remotely
# Example:
# curl localhost:8999/restart -H "auth:SECRET_KEY"
# Reds config file "auth.json"

from http.server import *
from textwrap import dedent
import json
import os

PORT = 8999

AUTH = json.load(open("auth.json"))

class Server(BaseHTTPRequestHandler):
     def do_GET(self):
        self.send_response(200)

        if self.path == "/restart":
            if self.headers["auth"] != AUTH["auth"]:
                print("Recieved bad key")
                self.wfile.write('bad auth'.encode())
                return
            restart_hctcg()
            self.wfile.write('ok'.encode())

def restart_hctcg():
    print("Restarting server")

    os.system(dedent("""
    docker compose pull
    docker compose restart
    """))

port = HTTPServer(('', PORT), Server)
port.serve_forever()
