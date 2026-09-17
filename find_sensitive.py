import os
import re

email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
phone_regex = re.compile(r'\+?\d{1,3}[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')

email_count = 0
phone_count = 0

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'temp' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    emails = email_regex.findall(content)
                    phones = phone_regex.findall(content)
                    email_count += len(emails)
                    phone_count += len(phones)
            except:
                pass

print(f"Emails found: {email_count}")
print(f"Phones found: {phone_count}")
