#!/usr/bin/env python3
"""Simple HTTP server with proper Content-Type headers."""
import http.server
import os

class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        base = super().guess_type(path)
        if base == 'text/html':
            return 'text/html; charset=utf-8'
        return base

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    game_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(game_dir)
    server = http.server.HTTPServer(('0.0.0.0', 8888), Handler)
    print(f"Serving {game_dir} at http://localhost:8888")
    server.serve_forever()