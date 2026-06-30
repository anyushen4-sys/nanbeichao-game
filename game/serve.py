#!/usr/bin/env python3
import http.server
import os

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Content-Type', self.guess_type(self.path) + '; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('0.0.0.0', 8889), CORSHTTPRequestHandler)
    print(f"Serving on http://localhost:8889")
    server.serve_forever()
