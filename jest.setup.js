import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  setBackend: jest.fn().mockResolvedValue(undefined),
  ready: jest.fn().mockResolvedValue(undefined),
  loadGraphModel: jest.fn().mockResolvedValue({
    predict: jest.fn().mockReturnValue({
      dispose: jest.fn(),
      data: jest.fn().mockResolvedValue(new Float32Array(100)),
      shape: [1, 25200, 85]
    }),
    dispose: jest.fn(),
  }),
  browser: {
    fromPixels: jest.fn().mockReturnValue({
      div: jest.fn().mockReturnThis(),
      expandDims: jest.fn().mockReturnThis(),
      dispose: jest.fn(),
      shape: [640, 640, 3]
    })
  },
  image: {
    resizeBilinear: jest.fn().mockReturnValue({
      div: jest.fn().mockReturnThis(),
      expandDims: jest.fn().mockReturnThis(),
      dispose: jest.fn(),
    })
  },
  zeros: jest.fn().mockReturnValue({
    dispose: jest.fn(),
  })
}))

// Mock File API
global.File = class MockFile {
  constructor(parts, filename, properties) {
    this.parts = parts
    this.name = filename
    this.type = properties?.type || 'text/plain'
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.lastModified = Date.now()
  }
}

// Mock FileReader
global.FileReader = class MockFileReader {
  constructor() {
    this.readAsDataURL = jest.fn(() => {
      setTimeout(() => {
        this.onload?.({ target: { result: 'data:image/jpeg;base64,mock' } })
      }, 0)
    })
    this.readAsArrayBuffer = jest.fn()
    this.onload = null
    this.onerror = null
  }
}

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  putImageData: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  filter: 'none'
}))

// Mock Image constructor
global.Image = class MockImage {
  constructor() {
    setTimeout(() => {
      this.onload?.()
    }, 0)
  }
  set src(value) {
    this._src = value
  }
  get src() {
    return this._src
  }
  width = 100
  height = 100
}