import os
import re
from collections import Counter

phone_regex = re.compile(r'\+?\d{1,3}[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')

phones = []

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'temp' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    phones.extend(phone_regex.findall(content))
            except:
                pass

for phone, count in Counter(phones).most_common(20):
    print(f"{phone}: {count}")
