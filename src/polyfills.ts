/**
 * Browser polyfills for mobile Safari / WebKit and older browser versions
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface ReadableStream<R = any> {
    [Symbol.asyncIterator](): AsyncIterableIterator<R>
  }
}

// 1. Polyfill Promise.withResolvers (Safari < 17.4)
if (typeof Promise !== 'undefined' && !('withResolvers' in Promise)) {
  Object.defineProperty(Promise, 'withResolvers', {
    configurable: true,
    writable: true,
    value: function withResolvers<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void
      let reject!: (reason?: unknown) => void
      const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
      })
      return { promise, resolve, reject }
    }
  })
}

// 2. Polyfill ReadableStream.prototype[Symbol.asyncIterator]
// Required by pdfjs-dist's getTextContent() which consumes streams using `for await (const chunk of stream)`.
// WebKit / Mobile Safari does not implement [Symbol.asyncIterator] on ReadableStream.prototype in many versions,
// leading to: "TypeError: undefined is not a function (near '...i of e...')"
if (
  typeof ReadableStream !== 'undefined' &&
  typeof Symbol !== 'undefined' &&
  Symbol.asyncIterator &&
  !(Symbol.asyncIterator in ReadableStream.prototype)
) {
  Object.defineProperty(ReadableStream.prototype, Symbol.asyncIterator, {
    configurable: true,
    writable: true,
    value: async function* asyncIterator<R>(this: ReadableStream<R>) {
      const reader = this.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    }
  })
}

export {}
