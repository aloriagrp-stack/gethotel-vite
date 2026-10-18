import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

test_queries = [
    'tum kaun ho',
    'bhai bore ho raha hu kya karu',
    'taj mahal kis din band rehta hai',
    'kya tum flights bhi book kar sakte ho'
]

for q in test_queries:
    payload = json.dumps({'messages': [{'role': 'user', 'content': q}]}).encode('utf-8')
    req = urllib.request.Request(
        'http://127.0.0.1:5000/api/ai/chat',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    try:
        res = urllib.request.urlopen(req, timeout=15)
        out = json.loads(res.read().decode('utf-8'))
        print(f"=== Q: {q} ===")
        print(f"Reply: {out.get('reply')}\n")
    except Exception as e:
        print(f"=== Q: {q} FAILED: {e} ===")
