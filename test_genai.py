import urllib.request
import json
import os

key = os.environ.get("GEMINI_API_KEY", "dummy")
url = "https://generativelanguage.googleapis.com/v1alpha/models/imagen-3.0-generate-001:predict?key=" + key
data = {
    "instances": [{"prompt": "A cute dog"}],
    "parameters": {"sampleCount": 1}
}
req = urllib.request.Request(url, json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    response = urllib.request.urlopen(req)
    print("Status:", response.status)
    print(response.read())
except urllib.error.HTTPError as e:
    print("Error Status:", e.status)
    print(e.read())
