from http.server import *
from textwrap import dedent
import os

PORT = 8001

class Server(BaseHTTPRequestHandler):
     def do_GET(self):
        self.send_response(200)

        if self.path == "/restart":
	        restart_hctcg()
	        self.wfile.write('ok'.encode())

def restart_hctcg():
	print("Restarting server")


	os.subprocess(dedent"""
	docker compose pull
	docker compose restart
	""")

port = HTTPServer(('', PORT), Server)
port.serve_forever()
