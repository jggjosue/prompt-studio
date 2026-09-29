import os
import re

target_dirs = ['src', 'public', 'docs']
email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

def scrub_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return False
        
    original = content
    content = email_regex.sub('help@prompstudio.com', content)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

files_modified = 0
for d in target_dirs:
    for root, _, files in os.walk(d):
        if 'node_modules' in root or '.git' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith(('.json', '.ts', '.tsx', '.html', '.css', '.md')):
                path = os.path.join(root, file)
                if scrub_file(path):
                    files_modified += 1
                    print(f"Scrubbed: {path}")

print(f"Scrubbed {files_modified} files.")
