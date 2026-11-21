import os
import urllib.request
import json

url = 'https://api.github.com/repos/aloriagrp-stack/gethotel-vite/actions/runs?per_page=3'
headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/vnd.github.v3+json',
}
token = os.environ.get('GITHUB_TOKEN')
if token:
    headers['Authorization'] = f'token {token}'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        res = json.loads(r.read().decode('utf-8'))
        runs = res.get('workflow_runs', [])
        for run in runs:
            print("Action Run:")
            print("  ID:", run.get('id'))
            print("  Name:", run.get('name'))
            print("  Status:", run.get('status'))
            print("  Conclusion:", run.get('conclusion'))
            print("  Commit:", run.get('head_commit', {}).get('message', '').strip().split('\n')[0])
            print("  HTML URL:", run.get('html_url'))
except Exception as e:
    print('Error:', e)
