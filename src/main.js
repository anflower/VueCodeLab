let watcher = null

function Vue(option) {
  const data = this._data = option.data
  observe(data)
  // The variable in data points to this
  for (let key in data) {
    Object.defineProperty(this, key, {
      get() {
        return this._data[key]
      },
      set(newValue) {
        this._data[key] = newValue
      }
    })
  }
  new Compiler(option.el, this)
}

// binding responsive
function observe(data) {
  const dep = new Dep()
  for (let key in data) {
    let val = data[key]
    if (typeof val === 'object') observe(val)
    Object.defineProperty(data, key, {
      get() {
        watcher && dep.addSub(watcher)
        return val
      },
      set(newVal) {
        val = newVal
        if (typeof val === 'object') observe(val)
        dep.notify()
      }
    })
  }
}

function Compiler(el, vm) {
  vm.$el = document.querySelector(el)
  const fragment = document.createDocumentFragment()
  while (child = vm.$el.firstChild) {
    fragment.appendChild(child)
  }
  replace(fragment, vm)
  vm.$el.appendChild(fragment)
}

function replace(fragment, vm) {
  // traverse all nodes
  [].forEach.call(fragment.childNodes, node => {
    const text = node.textContent
    let reg = /\{\{(.*)\}\}/
    // if nodeType === 3, it is text
    if (node.nodeType === 3 && reg.test(text)) {
      const val = getValue(vm, RegExp.$1)
      node.textContent = text.replace(reg, val)
      new Watcher(vm, RegExp.$1, function (newVal) {
        node.textContent = text.replace(reg, newVal)
      })
    }
    // if nodeType === 1, it is element
    if (node.nodeType === 1) {
      let attrs = node.attributes;
      [].forEach.call(attrs, attr => {
        let name = attr.name
        let exp = attr.value
        if (name.indexOf('v-') == -1) return
        node.value = getValue(vm, exp)
        node.addEventListener('input', function (e) {
          setValue(vm, exp, e.target.value)
        })
        new Watcher(vm, exp, function (newVal) {
          node.value = newVal
        })
      })
    }
    if (node.childNodes) {
      replace(node, vm)
    }
  })
}

//
function Dep() {
  this.subs = []
}

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub)
}

Dep.prototype.notify = function () {
  this.subs.forEach(sub => sub.update())
}

function Watcher(vm, exp, fn) {
  this.vm = vm
  this.exp = exp
  this.fn = fn
  watcher = this
  // access key trigger get within Object.defineProperty place watcher in subs
  getValue(vm, exp)
  watcher = null
}

Watcher.prototype.update = function () {
  this.fn(getValue(this.vm, this.exp))
}

// accessing getValue a to trigger get within Object.defineProperty
function getValue(vm, exp) {
  let val = vm
  let arr = exp.split('.')
  arr.forEach(k => {
    val = val[k]
  })
  return val
}

// accessing getValue a to trigger set within Object.defineProperty
function setValue(vm, exp, value) {
  let val = vm
  let arr = exp.split('.')
  arr.forEach((k, i) => {
    if (i == arr.length - 1) {
      val[k] = value
    } else {
      val = val[k]
    }
  })
}
