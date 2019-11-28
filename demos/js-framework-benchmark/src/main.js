'use strict'
import {App, mount, View} from '../../../src/pillbug'

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
    this.lines = buildData(1000)
    this.selected = 0
    this.lines_changed ++
    this.updateAndMeasure('run')
    
    // var t0 = performance.now();
    // for (let i=0;i<1000;i++) {
    //   let el = frag.cloneNode(true)
    //   el.childNodes[0].innerText = "id";
    //   el.childNodes[1].childNodes[0].innerText = "data.label";
    //   attachTo.appendChild(el)
    // }
    // var t1 = performance.now();
    // console.log("Run took " + (t1 - t0) + " milliseconds.");
  }
  runLots() {
    this.lines = buildData(10000)
    this.selected = 0
    this.lines_changed ++
    this.updateAndMeasure('runLots')
    // startMeasure('ggg')
    // for (let i=0;i<1000;i++) {
    //   let el = document.createElement('tr')
    //   el.innerHTML = iString
    //   attachTo.appendChild(el)
    // }
    // stopMeasure()
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


class Main extends View {
  static html = `
    <div class="container">
      <div>dd</div>
      <table class="table table-hover table-striped test-data">
        <tbody id="tbody"></tbody>
      </table>
      <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true">
    </div>
  `
  init(__args__) {
    el('div').child(box(Jumbotron))
    let tbody = el('tbody').use(Row)
    watch(null, _ => {
      tbody.items(s.app.lines)
    })
    // watch('app.lines_changed', _ => {
    //   tbody.items(s.app.lines)
    // })
  }
}


class Jumbotron extends View {
  static html = `
    <div class="jumbotron">
      <div class="row">
        <div class="col-md-6">
          <h1>Pillbug non-keyed</h1>
        </div>
        <div class="col-md-6">
          <div class="row">Hi</div>
        </div>
      </div>
    </div>
  `
  init(__args__) {
    el('div3').inner([
      box(Button, {id: 'run', title: 'Create 1,000 rows', cb: 'run'}),
      box(Button, {id: 'runlots', title: 'Create 10,000 rows', cb: 'runLots'}),
      box(Button, {id: 'add', title: 'Append 1,000 rows', cb: 'add'}),
      box(Button, {id: 'update', title: 'Update every 10th row', cb: 'update10th'}),
      box(Button, {id: 'clear', title: 'Clear', cb: 'clear'}),
      box(Button, {id: 'swaprows', title: 'Swap Rows', cb: 'swapRows'}),
    ])
  }
}


class Row extends View {
  static html = `
    <tr>
      <td class="col-md-1"></td>
      <td class="col-md-4">
        <a class="lbl"></a>
      </td>
      <td class="col-md-1">
        <a class="remove">
        </a>
      </td>
      <td class="col-md-6">
          <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
      </td>
    </tr>
  `
  init(__args__) {
    el().f('cls:app.selected', (n) => n == s.o.id ? "danger" : "")
    el('td').f('text:o.id')
    el('a').f('text:o.label').on('click', _ => app.select(s.o))
    el('a1').on('click', _ => app.remove(s.o))
  }
}


class Button extends View {
  static html = `
    <div class="col-sm-6 smallpad">
      <button class="btn btn-primary btn-block"/>
    </div>
  `
  init(__args__) {
    el('button')
      .f('text:o.title')
      .on('click', _ => s.bubble(s.o.cb))
  }
}


const app = new Demo()
app.mount(Main, '#main')
app.update()

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


*/