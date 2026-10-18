import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

queries = [
    'how are you dude',
    'Monsoon me Srinagar kaisa hai',
    'Badrinath trekking routes',
    'Konark solo travel safe hai'
]

for q in queries:
    payload = json.dumps({'messages': [{'role': 'user', 'content': q}]}).encode('utf-8')
    req = urllib.request.Request(
        'http://127.0.0.1:5000/api/ai/chat',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    try:
        res = urllib.request.urlopen(req, timeout=10)
        out = json.loads(res.read().decode('utf-8'))
        print(f"=== Q: {q} ===")
        print(f"Reply: {out.get('reply')}")
        print(f"Cards: {len(out.get('cards', []))} | Type: {out.get('responseType')}\n")
    except Exception as e:
        print(f"=== Q: {q} FAILED: {e} ===")
