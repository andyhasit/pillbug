import {App, View, mount} from '../../../src/pillbug'

const c = console;

var startTime;
var lastMeasure;
var startMeasure = function(name) {
    startTime = performance.now();
    lastMeasure = name;
}
var stopMeasure = function() {
    var last = lastMeasure;
    if (lastMeasure) {
        window.setTimeout(function () {
            lastMeasure = null;
            var stop = performance.now();
            var duration = 0;
            console.log(last+" took "+(stop-startTime));
        }, 0);
    }
}


function random(max) {
  return Math.round(Math.random() * 1000) % max;
}

const A = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean",
  "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy"];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse",
  "keyboard"];

let nextId = 1;

function buildData(count) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
    };
  }
  return data;
}


class Row extends View {
  onSelect = () => {
    this.app.select(this.o.item)
  }
  onRemove = () =>  {
    this.app.remove(this.o.item)
  }
  init(__args__) {
    build('tr')
      .f('cls:app.selected', (n) => n == s.o.id ? "danger" : "")
      .inner([
        h('td col-md-1').f('text:o.id'),
        h('td col-md-4', h('a').f('text:o.label').on('click', s.onSelect)),
        h('td col-md-1', h('a', 
          h('span glyphicon glyphicon-remove').att('aria-hidden', true)
          ).on('click', s.onRemove)),
        h('td col-md-6')
      ])
  }
}


class Button extends View {
  init(__args__) {
    build('div col-sm-6 smallpad',
      h('button btn btn-primary btn-block')
        .f('text:o.title')
        .on('click', _ => s.bubble(s.o.cb))
    )
  }
}


class Jumbotron extends View {
  init(__args__) {
    build('div jumbotron', 
      h('div row', [
        h('div col-md-6', h('h1', 'Pillbug non-keyed')),
        h('div col-md-6', 
          h('div row', [
            box(Button, {id: 'run', title: 'Create 1,000 rows', cb: 'run'}),
            box(Button, {id: 'runlots', title: 'Create 10,000 rows', cb: 'runLots'}),
            box(Button, {id: 'add', title: 'Append 1,000 rows', cb: 'add'}),
            box(Button, {id: 'update', title: 'Update every 10th row', cb: 'update10th'}),
            box(Button, {id: 'clear', title: 'Clear', cb: 'clear'}),
            box(Button, {id: 'swaprows', title: 'Swap Rows', cb: 'swapRows'}),
          ])
        ),
      ])
    )
  }
}


class Main extends View {
  init(__args__) {
    build('div container', [
     box(Jumbotron),
      h('table table table-hover table-striped test-data', [
        h('tbody #attach-here').use(Row).as('tbody')
      ]),
      h('span preloadicon glyphicon glyphicon-remove').att('aria-hidden', true)
    ])
    // watch('app.lines_changed', _ => {
    //   el('tbody').inner(s.app.lines, 'id')
    // })
    watch('app.lines_changed', _ => {
      el('tbody').items(s.app.lines)
    })
  }
}


class Demo extends App {
  constructor() {
    super()
    this.lines = []
    this.selected = 0
    this.lines_changed = 0
  }
  updateAndMeasure(name) {
    startMeasure(name)
    this.update()
    stopMeasure()
  }
  run() {
    // this.lines = buildData(1000)
    // this.selected = 0
    // this.lines_changed ++
    // this.updateAndMeasure('run')
    
    var t0 = performance.now();
    for (let i=0;i<1000;i++) {
      let el = frag.cloneNode(true)
      el.childNodes[0].innerText = "id";
      el.childNodes[1].childNodes[0].innerText = "data.label";
      attachTo.appendChild(el)
    }
    var t1 = performance.now();
    console.log("Run took " + (t1 - t0) + " milliseconds.");
  }
  runLots() {
    // this.lines = buildData(10000)
    // this.selected = 0
    // this.lines_changed ++
    // this.updateAndMeasure('runLots')
    startMeasure('ggg')
    for (let i=0;i<1000;i++) {
      let el = document.createElement('tr')
      el.innerHTML = iString
      attachTo.appendChild(el)
    }
    stopMeasure()
  }
  add() {
    this.lines_changed ++
    this.lines = this.lines.concat(buildData(1000))
    this.updateAndMeasure('add')
  }
  update10th() {
    const data = this.lines;
    for (let i = 0; i < data.length; i += 10) {
      const item = data[i];
      data[i] = {id: item.id, label: item.label + ' !!!'}
    }
    this.updateAndMeasure('update10th')
  }
  select(item) {
    this.selected = item.id
    this.update()
  }
  remove(item) {
    this.lines.splice(this.lines.indexOf(item), 1)
    this.update()
  }
  clear() {
    this.lines_changed ++
    this.lines = []
    this.selected = 0
    this.updateAndMeasure('clear')
  }
  swapRows() {
    this.lines_changed ++
    const data = this.lines
    if (data.length > 998) {
      let temp = data[1]
      data[1] = data[998]
      data[998] = temp
    }
    this.updateAndMeasure('swapRows')
  }
}

const app = new Demo()

app.mount(Main, '#main')
app.update()


let all = []
for (let i = 0; i < 10000; i++) {
  all.push({items: [1, 2, 3, 4]})
}


class Base {
  box() {
  }
  bubble() {
  }
  build() {
  }
  el() {
  }
  h() {
  }
  watch() {
  }
}


class Component {
  static 
  constructor() {
    /*
    Create template node if not exists
    clone it
    create dicts etc...
    */
  }
  el(path) {
    // return wrapper if already exists else fetch it
    // convert path into a function saved in static dict
  }
}


/*
How do we handle repeats and detach?

Exact same issues?

Repeat:
  Always remember inner list
  When new:
    Zip over new items
      for each:
        if in dom: update
        else: get
    remove remaining to recycler

    
    
https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript



Copy this to demos in pillbug at test with dev server
*/

class NewWorld {
  template = `
    <tr class="">
      <td class="col-md-1">2001</td>
      <td class="col-md-4">
        <a>unsightly black keyboard</a>
      </td>
      <td class="col-md-1">
        <a><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
      </td>
      <td class="col-md-6"></td>
    </tr>`
  init() {
    match('o.name', 'tr/td2/a:text')
    match('o.name', 'tr/td2/a:text', (n,o) => n.toUpperCase())
    match('o.name', 'tr/td2/a', (n,o,w) => w.text(n.toUpperCase()))
  }
}

class Ac extends Base {
  init() {
    let s = this
   
  }
}

class Bc extends Base {
  init() {
    let s = this
    s._nested_ = []         // Array of arrays of nested views
    s._named_ = {}          // Named elements or views
    s._always_ = []         // Callbacks that should always by run during update
    s._watches_ = {}        // Watches
    s._previous_ = {}
    s._args_ = [
      s.box.bind(s),     // box
      s.bubble.bind(s),  // bubble
      s.build.bind(s),   // build
      s.el.bind(s),      // el
      s.h.bind(s),       // h
      s.watch.bind(s)    // watch
    ]
  }
}


// all.forEach(i => {
//   i.items.forEach(j => {
//     let x = new Ac(j)
//     x.init()
//   })
// })

let attachTo = document.getElementById('attach-here')
startMeasure('A')
let iString = `
      <td class="col-md-1">2001</td>
      <td class="col-md-4">
        <a>unsightly black keyboard</a>
      </td>
      <td class="col-md-1">
        <a><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
      </td>
      <td class="col-md-6"></td>
    `

// let frag = document.createElement('tr')
// frag.innerHTML = iString

let frag = document.createElement('template')
let raw = `<tr class="">
      <td class="col-md-1">2001</td>
      <td class="col-md-4">
        <a>unsightly black keyboard</a>
      </td>
      <td class="col-md-1">
        <a><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
      </td>
      <td class="col-md-6"></td>
    </tr>`
let tidy = raw.replace(/\n/g, "")
    .replace(/[\t ]+\</g, "<")
    .replace(/\>[\t ]+\</g, "><")
    .replace(/\>[\t ]+$/g, ">")
c.log(tidy)
frag.innerHTML = tidy
frag = frag.content.firstChild

stopMeasure()


// all.forEach(i => {
//   i.items.forEach(j => {
//     let x = new Bc(j)
//     x.init(x._args_)
//   })
// })
startMeasure('BD')
//c.log(8)
stopMeasure()
