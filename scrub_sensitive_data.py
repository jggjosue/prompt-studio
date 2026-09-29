import os
import re

# We target src/, public/, and docs/
target_dirs = ['src', 'public', 'docs']

email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
phone_regex = re.compile(r'(?<!\d)(?:\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)')
url_creds_regex = re.compile(r'(https?://)[^/:]+:[^/:]+@([^/]+)')

def scrub_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
        
    original = content
    
    # Scrub URLs with credentials first (e.g. strip userinfo from URIs)
    content = url_creds_regex.sub(r'\1\2', content)
    
    # Scrub emails
    # Replace all emails with "help@prompstudio.com"
    content = email_regex.sub('help@prompstudio.com', content)
    
    # Scrub phone numbers
    # We use a strict regex to avoid replacing random numbers, and we replace with 555-0198 (standard fiction number)
    content = phone_regex.sub('555-0198', content)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

files_modified = 0
for d in target_dirs:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md')):
                path = os.path.join(root, file)
                if scrub_file(path):
                    files_modified += 1

print(f"Scrubbed {files_modified} files.")
