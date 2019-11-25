window.c = console   // So you can debug with c.log()
import {App, View} from 'pillbug-js'


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