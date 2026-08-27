let _collectedHead: any = null
let _collectionEnabled = false

export function enableCollection() {
  _collectedHead = null
  _collectionEnabled = true
}

export function disableCollection() {
  _collectionEnabled = false
}

export function collectHead(data: any) {
  if (_collectionEnabled) {
    _collectedHead = data
  }
}

export function getCollectedHead() {
  return _collectedHead
}

export function resetCollectedHead() {
  _collectedHead = null
}
