function Vue(option) {
  const data = this._data = option.data
  observe(data)
}

function observe(data) {
  for (let key in data) {
    let val = data[key]
    if (typeof val === 'object') observe(val)
    Object.defineProperty(data, key, {
      get() {
        return val
      },
      set(newVal) {
        val = newVal
        if (typeof val === 'object') observe(val)
      }
    })
  }
}
