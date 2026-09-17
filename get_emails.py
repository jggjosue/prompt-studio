import os
import re
from collections import Counter

email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

emails = []

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'temp' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    emails.extend(email_regex.findall(content))
            except:
                pass

for email, count in Counter(emails).most_common(20):
    print(f"{email}: {count}")
