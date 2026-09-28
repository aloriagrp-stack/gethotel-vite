import json
import re
import math
from collections import defaultdict

with open('travel_ai_10000_QA_dataset.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} Q&A items.")

def normalize(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return [w for w in text.split() if len(w) > 1]

# Inverted index
inverted_index = defaultdict(list)
doc_lengths = []
doc_tokens_list = []

for idx, item in enumerate(data):
    tokens = normalize(item.get('question', ''))
    doc_tokens_list.append(tokens)
    doc_lengths.append(len(tokens))
    for t in set(tokens):
        inverted_index[t].append(idx)

avg_dl = sum(doc_lengths) / len(doc_lengths) if doc_lengths else 1
N = len(data)

def search(query, top_k=3):
    q_tokens = normalize(query)
    scores = defaultdict(float)
    k1 = 1.5
    b = 0.75

    for t in q_tokens:
        if t in inverted_index:
            docs = inverted_index[t]
            df = len(docs)
            idf = math.log((N - df + 0.5) / (df + 0.5) + 1.0)
            for doc_id in docs:
                tf = doc_tokens_list[doc_id].count(t)
                dl = doc_lengths[doc_id]
                score = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avg_dl)))
                scores[doc_id] += score

    # Also boost exact substring / phrase matches
    q_lower = query.lower()
    for doc_id in list(scores.keys()):
        item_q = data[doc_id]['question'].lower()
        if q_lower in item_q or item_q in q_lower:
            scores[doc_id] += 5.0

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    results = []
    for doc_id, score in ranked[:top_k]:
        results.append({
            "score": score,
            "item": data[doc_id]
        })
    return results

test_queries = [
    "how are you dude",
    "Hii kaise ho bhai",
    "Monsoon me Srinagar jaana achha rahega kya?",
    "Badrinath ke paas trekking routes",
    "Los Angeles trip budget for friends",
    "Is Konark safe for solo travel?"
]

for q in test_queries:
    print(f"\n================ QUERY: {q} ================")
    matches = search(q)
    for m in matches:
        item = m['item']
        print(f"[{item['category']}] (score: {m['score']:.2f})")
        print(f"  Q: {item['question']}")
        print(f"  A: {item['answer']}")
