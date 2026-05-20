import urllib.request
import json
import os

key = os.environ.get("GEMINI_API_KEY", "dummy")
url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=" + key
data = {
    "prompt": "A cute dog"
}
req = urllib.request.Request(url, json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    response = urllib.request.urlopen(req)
    print(response.read())
except urllib.error.HTTPError as e:
    print(e.read())
