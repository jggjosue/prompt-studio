import os
import re

email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'temp' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md', '.txt', '.dm')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    emails = email_regex.findall(content)
                    emails = [e for e in emails if not e.endswith('@example.com')]
                    if emails:
                        print(f"{path}: {emails[0]}")
            except Exception as e:
                pass
