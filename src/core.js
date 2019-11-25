/*
 * Pillbug (https://github.com/andyhasit/pillbug)
 */

const doc = document;


export class App {
  /* The root object which you mount top level views to */
  constructor() {
    this._nested_ = []
  }
  mount(viewClass, idEl, obj) {
    /* Mounts a top level view and builds it instantly.
     *
     * @param {class} viewClass - The class of the view.
     * @param {idEl} id or element to wrap
     * @param {obj} optional, gets passed to view constructor
     */
    let view = new viewClass(this, obj)
    bindWrapper(idEl, view.root)
    this._nested_.push(view)
  }
  update() {
    /* Propagates the update call to all nested views */
    this._nested_.forEach(v => v.update())
  }
}


export class View {
  constructor(app, obj, seq, parent) {
    let s = this
    s.app = app             // Reference to the containing app
    s.obj = obj             // The object passed to the view
    s.seq = seq             // The key - only for nested views
    s.parent = parent       // The parent view
    s.root = undefined      // This view's root wrapper
    s._nested_ = []         // Nested views
    s._named_ = {}          // Named elements or views
    s._watches_ = {}        // Watches
    s._previous_ = {}       // The previous values for watches to compare against
    
    // The args to pass into methods
    s._args_ = [
      s.app,             // app
      s.box.bind(s),     // box
      s.build.bind(s),   // build
      s.el.bind(s),      // el
      s.h.bind(s),       // h
      s.obj,             // obj
      s.seq,             // seq
      s.watch.bind(s)    // watch
    ]
    s.init(...s._args_)
  }
  as(name) {
    /*  Saves it as 'name'
     */
    this.parent._saveAs_(this, name)
    return this // Keep this because people will use it like on the wrapper.
  }
  build(desc, atts, inner) {
    return this.root = this.h(desc, atts, inner)
  }
  box(viewClass, obj) {
    /*
     * Builds a nested view of the specified class.
     * No caching is used. Use a cache object returned by this.cache() if you need caching.
     */
    let view = new viewClass(this.app, obj, undefined, this)
    this._nested_.push(view)
    return view
  }
  el(name) {
    return this._named_[name]
  }
  h(tag, atts, inner) {
    /*
     *   The bound equivalent of h(). Ensures Wrappers have reference to this view.
     */
    if (und(inner)) {
      inner = atts
      atts = {}
    }
    let el = h(tag, atts, inner, this)
    return el
  }
  update(newObj) {
    /*  
     *   The external call to update the view. 
     *   @newObj -- new object, else it keeps its old (which is fine)
     */
    if (!und(newObj)) {
      this.obj = newObj
    }
    this._update_(this._args_)
  }
  watch(path, callback) {
    /*
    Watch a property and call the callback during update if it has changed.

    @path -- A dotted path to the value

      e.g. 'user.id'
    
    @callback -- a function to be called with (newValue, oldValue)
    
      e.g. (n,o) => alert(`Value changed from ${o} to ${n}`)

    */
    if (!this._watches_.hasOwnProperty(path)) {
      this._watches_[path] = []
    }
    this._watches_[path].push(callback)
    return this // Keep this because people will use it like on the wrapper.
  }
  _saveAs_(item, name){
    this._named_[name] = item
  }
  _update_() {
    this._updateWatches_()
    this._nested_.forEach(n => n.update())
  }
  _updateWatches_() {
    /*
     * Iterates through watches. If the value has changed, call callback.
     */
    let path, newValue, previous
    for (path in this._watches_) {
      newValue = getProp(this, path)
      previous = this._previous_[path]
      if (previous !== newValue) {
        this._watches_[path].forEach(fn => {
          fn(newValue, previous)
        })
      }
      this._previous_[path] = newValue
    }
  }
}


export class Wrapper {
  constructor(element, view) {
    this.e = element
    this._c = null
    this.view = view
  }
  get Value() {
    /* Returns the value of the element */
    return this.e.value
  }
  as(name){
    this.view._saveAs_(this, name)
    return this
  }
  att(name, value) {
    this.e.setAttribute(name, value)
    return this
  }
  atts(atts) {
    for (let name in atts) {
      this.att(name, atts[name])
    }
    return this
  }
  checked(value) {
    this.e.checked = value
    return this
  }
  href(value) {
    return this.att('href', value)
  }
  id(value) {
    return this.att('id', value)
  }
  src(value) {
    return this.att('src', value)
  }
  value(value) {
    return this.att('value', value)
  }
  text(value) {
    this.e.textContent = value
    return this
  }
  child(item) {
    this.e.appendChild(this._ge(item))
    return this
  }
  clear() {
    this.e.innerHTML = ''
    this.e.textContent = ''
    this.e.value = ''
    return this
  }
  cls(style) {
    this.e.className = style
    return this
  }
  clsAdd(style) {
    this.e.classList.add(style)
    return this
  }
  clsAddTrans(style) {
    return this.transition(_ => this.e.classList.add(style))
  }
  clsRemove(style) {
    this.e.classList.remove(style)
    return this
  }
  clsRemoveTrans(style) {
    return this.transition(_ => this.e.classList.remove(style))
  }
  clsToggle(style) {
    this.e.classList.toggle(style)
    return this
  }
  f(desc, callback) {
    /*
     *   Follow a value and do something if it has changed.
     * 
     *   This method has two forms.
     * 
     *   If desc does not contain ":" then the callback is simply called if the value 
     *   changes (during the component's update() call)
     *
     *   The callback parameters are (newVal, oldVal, wrapper) 
     *   E.g.
     *
     *      h('div').f('clickCount', (n,o,w) => w.text(n))
     *
     *   If the desc contains ":" (e.g. "text:clickCount") then we assume what is to 
     *   the left of : to be a method of the wrapper to call if the value has changed.
     *   E.g.
     *
     *       h('div').f('text:clickCount')  // equates to wrapper.text(newValue)
     *   
     *   In this form, a callback may be provided to transform the value before it is
     *   used. Its parameters are (newVal, oldVal) 
     *   
     *    E.g.
     *
     *       h('div').f('text:clickCount', (n,o) => `Click count is ${n}`)
     *   
     */
    let path, func, chunks = desc.split(':')
    if (chunks.length === 1) {
      path = chunks[0]
      func = (n,o) => callback(n,o,this)
    } else {
      let method = chunks[0]
      path = chunks[1]
      func = und(callback) ? n => this[method](n) : (n,o) => this[method](callback(n,o,this)) 
    }
    this.view.watch(path, func)
    return this
  }
  html(html) {
    this.e.innerHTML = html
    return this
  }
  inner(items) {
    /*
    Updates the element's children. 

    Operates differently if the use() method was called on the instance.

    @items (standard mode) -- either:
        A Wrapper.
        A View instance.
        Any other object, in which case we call toString().
        An array containing any combination of the above.

    @items (after calling use()) -- either:
        An object which will be to build() or update() of
        a view created from the viewClass previously passed to use().
        An array of such objects.

    On some browsers this may perform better using a document fragment.
    */
    let fn
    if (!Array.isArray(items)) {items = [items]}
    if (this._c) {
      this._c.reset()
      fn = item => this._c.getEl(item).root.e
    } else {
      fn = this._ge
    }
    return this._si(items, fn)
  }
  on(event, callback) {
    this.e.addEventListener(event, e => callback(e, this))
    return this
  }
  transition(fn) {
    return new Promise(resolve => {
      fn()
      let transitionEnded = e => {
        this.e.removeEventListener('transitionend', transitionEnded)
        resolve()
      }
    this.e.addEventListener('transitionend', transitionEnded)
    })
  }
  use(viewClass, cacheBy) {
    /*
    Modifies the behaviour of inner() to map the objects passed in to views
    of the specified class, using caching.
    See this._iv() and ViewCache.

    @viewClass -- any valid subclass of View
    @cacheBy -- either:
        <undefined> in which case the sequence is used as key*
        A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
        A function called with (item, seq) which must return a key

    */
    this._c = new ViewCache(this.view.app, viewClass, cacheBy, this.view)
    return this
  }
  _si(items, extractFn) {
    this.clear()
    items.forEach(item => {
      this.e.appendChild(extractFn(item))
    })
    return this
  }
  _ge(item) {
    /*
    Returns a native element for attaching
    */
    if (item instanceof Wrapper) {
      return item.e
    } else if (item instanceof View) {
      return item.root.e
    } else if (item instanceof Node) {
      return item
    } else {
      return doc.createTextNode(item.toString())
    }
  }
}


export function transition(el, fn) {
  return new Promise(resolve => {
    fn()
    let transitionEnded = e => {
      el.removeEventListener('transitionend', transitionEnded)
      resolve()
    }
  el.addEventListener('transitionend', transitionEnded)
  })
}



export class ViewCache {
  constructor(app, viewClass, cacheBy, view) {
    /*
    An object which caches and returns views of a same type.
    
    @app -- an instance of App
    @viewClass -- any valid subclass of View
    @cacheBy -- either:
        <undefined> in which case the sequence is used as key*
        A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
        A function called with (obj, seq) which must return a key
    */
    this._a = app
    this._v = view
    this._vc = viewClass
    this._c = {}
    this._k = cacheBy 
    this._seq = 0
    if (und(cacheBy)) {
      this._k = (obj, seq) => seq
    } else if (isStr(cacheBy)) {
      this._k = (obj, seq) => getProp(obj, cacheBy)
    }
  }
  reset() {
    this._seq = 0
  }
  getEl(obj) {
    /*
    Gets a view, potentially from cache
    */
    let view, key = this._k(obj, this._seq)
    if (this._c.hasOwnProperty(key)) {
      view = this._c[key]
    } else {
      view = new this._vc(this._a, obj, this._seq, this._v) // viewClass
      this._c[key] = view
    }
    view.update(obj)
    this._seq += 1
    return view
  }
}


function h(desc, atts, inner, view) {
  /*
   * Returns a new Wrapper around a new DOM element.
   * @param {str} desc -- string representing an element type. e.g. 'div'. Any additional
   * words are used as cls e.g. 'i far fa-bell' becomes <i class="far fa-bell">
   * @param {View} view -- optional the view which the 
  */
  let tag, cls, w
  [tag, ...cls] = desc.trim().split(' ')
  w = new Wrapper(doc.createElement(tag), view)
  cls.forEach(i => i.startsWith('#') ? w.att('id', i.slice(1)) : w.clsAdd(i)) // can supply an array - change?
  w.atts(atts)
  if(!und(inner)){ w.inner(inner)}
  return w
}


export function getNode(elementOrId) {
  // We're assuming it starts with #
  let el = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)): elementOrId
  return el
}


export function bindWrapper(elementOrId, wrapper) {
  let target = getNode(elementOrId)
  target.parentNode.replaceChild(wrapper.e, target)
}


/* This function extracts properties from a target based on a path string
 *
 *   "app.items.length"
 *   "app.items().length"
 *
 * The path may include parentheses calls in which case the member is called.
 * The parentheses may not contain parameters.
 * It doesn't work for square brackets.
 */
const _red = (o,i)=> i.endsWith('()') ? o[i.substr(0, i.length -2)].bind(o)() : o[i]
export function getProp(target, path) {
  return path.split('.').reduce(_red, target)
}


export function und(x) {
  return x === undefined
}

export function isStr(x) {
  return typeof x === 'string'
}