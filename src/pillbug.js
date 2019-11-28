/*
 * Pillbug (https://github.com/andyhasit/pillbug)
 */

/*
TODO:



Nesting:
  If a wrapper includes a view as a child, it creates a nest on the view.
  Every view in that nest will get updated.
  If the wrapper is cleared, the nest is also cleared.
  If a wrapper is removed from the DOM 

  h('div')
    .child(h('ul').use(SomeView).items(myItems))
    .child(h('div'))

  This will fuck up because the second call to child detaches the <ul> element, 
  but it won't know that, meaning that the views inside ul will be updated. 
*/


const c = console;
const doc = document;


export class App {
  /* The root object which you mount top level views to */
  constructor(props) {
    this._nested_ = []
    Object.assign(this, props)
  }
  mount(viewClass, idEl, obj) {
    /* Mounts a top level view and builds it instantly.
     *
     * @param {class} viewClass - The class of the view.
     * @param {idEl} id or element to wrap
     * @param {obj} optional, gets passed to view constructor
     */
    let view = inst(viewClass, this, this, obj)
    mount(view, idEl)
    this._nested_.push(view)
  }
  update() {
    /* Propagates the update call to all nested views */
    requestAnimationFrame(() => {
      this._nested_.forEach(v => v.update())
    })
  }
}


export class View {
  static html = '<div></div>';
  static _template_ = null;
  static _pathFns_ = {};
  
  _cloneNode_() {
    let ct = this._ct_
    if (!ct._template_) { 
      let throwAway = document.createElement('template')
      // let tidy = raw.replace(/\n/g, "")
      //   .replace(/[\t ]+\</g, "<")
      //   .replace(/\>[\t ]+\</g, "><")
      //   .replace(/\>[\t ]+$/g, ">")
      throwAway.innerHTML = ct.html.trim()
      ct._template_ = throwAway.content.firstChild
    }
    return ct._template_.cloneNode(true)
  }
  
  _createPathFn_(path) {
    let intString = path.replace(/^\D+/g, '')
    let elementType = path.replace(/\d+$/, "")
    let index = intString == ''? 0 : parseInt(intString)
    return rootElement => rootElement.getElementsByTagName(elementType)[index]
  }
  
  _findEl_(path) {
    let paths = this._ct_._pathFns_
    if (!(path in paths)) {
      paths[path] = this._createPathFn_(path)
    }
    let v = paths[path](this.root.e)
    // if (und(v)) {
    //   throw `Component ${this._ct_.name} could not find element at "${path}"`
    // }
    return new Wrapper(v, this)
  }
  
  constructor(app, parent, obj, seq) {
    let s = this
    s._ct_ = s.constructor
    s.app = app             // Reference to the containing app. This is static
    s.parent = parent       // The parent view
    s.o = obj               // The object passed to the view. May be changed
    s.seq = seq             // The sequence - only for nested views
    
    // Create the root node by cloning from the template node
    s.root = new Wrapper(s._cloneNode_(), this)

    // Internal state objects
    s._wrappers_ = {}
    s._nested_ = []         // Array of arrays of nested views
    s._always_ = []         // Callbacks that should always by run during update
    s._watches_ = {}        // Watches
    s._previous_ = {}       // The previous values for watches to compare against

    s._args_ = [
      s.app,             // app
      s.box.bind(s),     // box
      s.bubble.bind(s),  // bubble
      s.build.bind(s),   // build
      s.el.bind(s),      // el
      s.h.bind(s),       // h
      s,                 // s - a reference to this
      s.seq,             // seq
      s.watch.bind(s)    // watch
    ]
  }
  el(path) {
    if (!path) {
      return this.root
    }
    let w = this._wrappers_
    if (!(path in w)) {
      w[path] = this._findEl_(path)
    }
    return w[path]
  }
  bubble(name, args) {
    let target = this
    while (!und(target)) {
      if (name in target) {
        return target[name].apply(target, args)
      }
      target = target.parent
    }
  }
  build(desc, atts, inner) {
    return this.root = this.h(desc, atts, inner)
  }
  box(viewClass, obj) {
    /*
     * Builds a nested view of the specified class.
     * No caching is used. Use a cache object returned by this.cache() if you need caching.
     */
    let view = inst(viewClass, this.app, this, obj)
    return view
  }
  h(desc, atts, inner) {
    /*
     * Returns a new Wrapper around a new DOM element.
     * @param {str} desc -- string representing an element type. e.g. 'div'. Any additional
     * words are used as cls e.g. 'i far fa-bell' becomes <i class="far fa-bell">
     * @param {View} view -- optional the view which the 
    */
    // TODO: check performance on all this. Too much time splitting strings/array 
    // or should I only wrap at end?
    let tag, cls, w
    if (und(inner)) {
      inner = atts
      atts = {}
    }
    [tag, ...cls] = desc.trim().split(' ')
    w = new Wrapper(doc.createElement(tag), this)
    cls.forEach(i => i.startsWith('#') ? w.att('id', i.slice(1)) : w.clsAdd(i)) 
    return w.atts(atts).inner(inner)
  }
  update(newObj) {
    /*  
     *   The external call to update the view. 
     *   @newObj -- new object, else it keeps its old (which is fine)
     */
    if (newObj) {
      this.o = newObj
    }
    this._updateWatches_()
    this._updateNested_()
  }
  watch(path, callback) {
    /*
    Watch a property and call the callback during update if it has changed.

    @path -- A dotted path to the value

      e.g. 'user.id'
    
    @callback -- a function to be called with (newValue, oldValue)
    
      e.g. (n,o) => alert(`Value changed from ${o} to ${n}`)

    */
    if (path === null) {
      this._always_.push(callback)
    } else {
      if (!this._watches_.hasOwnProperty(path)) {
        this._watches_[path] = []
      }
      this._watches_[path].push(callback)
    }
    return this // Keep this because people will use it like on the wrapper.
  }
  _updateNested_() {
    this._nested_.forEach(views => {
      views.forEach(view => view.update())
    })
  }
  _getNest() {
    let nest = []
    this._nested_.push(nest)
    return nest
  }
  _updateWatches_() {
    /*
     * Iterates through watches. If the value has changed, call callback.
     */
    this._always_.forEach(fn => fn())
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
    this._n = undefined
    this.view = view
  }
  get Value() {
    /* Returns the value of the element */
    return this.e.value
  }
  append(item) {
    return this._append(item)
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
    this.clear()
    return this._append(item)
  }
  clear() {
    if (this._n) {
      this._n.length = 0
    }
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
     * Use this for adding standard lists of items. Use items() is you used use()
     */
    if (!Array.isArray(items)) {
      return this.child(items)
    }
    this._prepRepeat()
    items.forEach(item => this._append(item))
    return this._done()
  }
  items(items) {
    this._prepRepeat()
    let view
    items.forEach(item => {
      view = this._c.getEl(item)
      this._nest(view)
      this.e.appendChild(view.root.e)
    })
    return this._done()
  }
  _nest(view) {
    if (!this._n) {
      this._n = this.view._getNest()
    }
    this._n.push(view)
  }
  _prepRepeat() {
    this.visible(false)
    this.clear()
  }
  _done() {
    this.visible(true)
    return this
  }
  on(event, callback) {
    this.e.addEventListener(event, e => callback(e, this))
    return this
  }
  style(name, value) {
    this.e.style[name] = value
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
  visible(visible) {
    return this.style('visibility', visible? 'visible' : 'hidden')
  }
  _append(item) {
    /*   Appends an item to the element, saving it to the appropriate list
     */
    let e = null
    if (item instanceof Wrapper) {
      e = item.e
    } else if (item instanceof View) {
      this._nest(item)
      e = item.root.e
    } else if (item instanceof Node) {
      e = item
    } else {
      e = doc.createTextNode(und(item) ? '' : item)
    }
    this.e.appendChild(e)
    return this
  }
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
    this.app = app
    this.view = view
    this.viewClass = viewClass
    this.cache = {}
    this.keyFn = cacheBy 
    this._seq = 0
    if (und(cacheBy)) {
      this.keyFn = (obj, seq) => seq
    } else if (isStr(cacheBy)) {
      this.keyFn = (obj, seq) => getProp(obj, cacheBy)
    }
  }
  reset() {
    this._seq = 0
  }
  getEl(obj) {
    /*
    Gets a view, potentially from cache
    */
    let view, key = this.keyFn(obj, this._seq)
    if (this.cache.hasOwnProperty(key)) {
      view = this.cache[key]
    } else {
      view = inst(this.viewClass, this.app, this.view, obj, this._seq)
      this.cache[key] = view
    }
    view.update(obj)
    this._seq += 1
    return view
  }
}

function inst(viewClass, app, parent, obj, seq) {
  let v = new viewClass(app, parent, obj, seq)
  v.init(...v._args_)
  return v
}


export function getNode(elementOrId) {
  // We're assuming it starts with #
  let el = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)): elementOrId
  return el
}

/*
 * Mounts a view onto an element.
 */
export function mount(view, elementOrId) {
  let target = getNode(elementOrId)
  target.parentNode.replaceChild(view.root.e, target)
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