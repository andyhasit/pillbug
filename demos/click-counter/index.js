import {App, View} from '../../core.js' //pillbug-js'

const c = console

class ClickCounter extends View {
  init(__args__) {
    this.clickCount = 0
    build('div', [
      h('button', 'Click me').on('click', _ => this.handleClick()),
      h('div').f('text:clickCount')
    ])
  }
  handleClick() {
    this.clickCount ++
    this.update()
  }
}

const app = new App()
app.mount(ClickCounter, '#main')
app.update()