let _razorpayPromise: Promise<void> | null = null

export function loadRazorpay(): Promise<void> {
  if ((window as any).Razorpay) return Promise.resolve()
  if (_razorpayPromise) return _razorpayPromise

  _razorpayPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => { _razorpayPromise = null; reject(new Error('Failed to load Razorpay')) }
    document.head.appendChild(script)
  })

  return _razorpayPromise
}
