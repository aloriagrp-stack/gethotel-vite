import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

payload = json.dumps({'messages': [{'role': 'user', 'content': 'how are you dude'}]}).encode('utf-8')
req = urllib.request.Request(
    'http://127.0.0.1:5000/api/ai/chat/stream',
    data=payload,
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req, timeout=10)
    print("=== STREAM START ===")
    tokens = []
    current_event = None
    for line in res:
        line_str = line.decode('utf-8').strip()
        if line_str.startswith('event: '):
            current_event = line_str[7:].strip()
        elif line_str.startswith('data: '):
            data_content = line_str[6:].strip()
            if current_event == 'token':
                parsed = json.loads(data_content)
                tokens.append(parsed.get('token', ''))
            elif current_event == 'done':
                print("Event: done received!")
    full_text = "".join(tokens)
    print("Accumulated streamed tokens:", full_text)
except Exception as e:
    print("Streaming error:", e)
