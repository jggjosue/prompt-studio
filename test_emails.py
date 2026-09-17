import os
import re
from collections import Counter

email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
phones_regex = re.compile(r'(?<!\d)(?:\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)')

emails = []
phones = []

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'temp' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md', '.txt', '.dm')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    emails.extend(email_regex.findall(content))
                    phones.extend(phones_regex.findall(content))
            except:
                pass

emails = [e for e in emails if not e.endswith('@example.com')]
phones = [p for p in phones if '555-0198' not in p]

print("Remaining non-example emails:")
for email, count in Counter(emails).most_common(10):
    print(f"{email}: {count}")

print("Remaining non-555 phones:")
for phone, count in Counter(phones).most_common(10):
    print(f"{phone}: {count}")
