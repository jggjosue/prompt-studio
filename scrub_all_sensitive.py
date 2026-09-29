import os
import re

email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
phone_regex = re.compile(r'(?<!\d)(?:\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)')
url_creds_regex = re.compile(r'(https?://)[^/:]+:[^/:]+@([^/]+)')

target_dirs = ['src', 'public', 'docs']

def scrub_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            return False
    except Exception:
        return False
        
    original = content
    
    content = url_creds_regex.sub(r'\1\2', content)
    content = email_regex.sub('help@prompstudio.com', content)
    content = phone_regex.sub('555-0198', content)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

files_modified = 0
for d in target_dirs:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        if 'node_modules' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md', '.txt', '.dm')):
                path = os.path.join(root, file)
                if scrub_file(path):
                    files_modified += 1

print(f"Scrubbed {files_modified} files.")
