window.c = console   // So you can debug with c.log()

import {App} from 'pillbug-js'
import {TicTacToe} from './tictactoe'


const app = new App()
app.mount(TicTacToe, '#main')
app.update()