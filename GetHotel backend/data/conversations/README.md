# Conversation Datasets Directory

Place your conversation dataset files (JSON or text) in this folder:
`GetHotel backend/data/conversations/`

### Format Supported:
You can drop any `.json` file containing an array of conversation turns:
```json
[
  {
    "query": "Delhi me sasta hotel batao",
    "reply": "Delhi me Paharganj aur Karol Bagh me kaafi acche budget hotels hain ₹1500 ke andar!"
  },
  {
    "query": "Kya unmarried couples ko room mil jayega?",
    "reply": "Haanji, humare partner hotels couple-friendly hain. Bas original Govt ID proof hona zaroori hai."
  }
]
```

The In-House Travel Brain automatically reads and indexes all files in this folder upon startup in under 5ms without needing any external AI API or heavy GPUs.
