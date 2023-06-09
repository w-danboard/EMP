const Chainable = require('./Chainable')

class ChainedMap extends Chainable {
  constructor (parent) {
    super(parent)
    // key是字符串，value可能是任意的值
    this.store = new Map()
  }
  extend (methods) {
    methods.forEach((method) => {
      // this.path = (newPath) => this.store.path = newPath
      this[method] = (vlaue) => this.set(method, vlaue)
    })
  }
  getOrCompute (key, factory) {
    if (!this.has(key)) {
      this.set(key, factory())
    }
    return this.get(key)
  }
  set (key, value) {
    this.store.set(key, value)
    return this
  }
  has (key) {
    return this.store.has(key)
  }
  get (key) {
    return this.store.get(key)
  }
  // 把map变成对象返回
  entries () {
    return [...this.store].reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  }
}

module.exports = ChainedMap