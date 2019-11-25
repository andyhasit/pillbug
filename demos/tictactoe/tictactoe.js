import {View} from 'pillbug-js'


export class TicTacToe extends View {
  init(__args__) {
    app.game = new Game(app)
    build('div', [
      box(StatusBar),
      box(Board)
    ])
    this.update()
  }
}


class Board extends View {
  init(__args__) {
    build('div grid', app.game.grid.map(row => 
      h('div row', row.map(cell => 
        box(Square, cell)
      ))
    ))
  }
}


class Square extends View {
  init(__args__) {
    build('button square')
      .f('text:obj.value')
      .on('click', (e,w) => {
        app.game.tickSquare(obj.x, obj.y)
        w.att('disabled', true)
      })
  }
}


class StatusBar extends View {
  init(__args__) {
    build('div', [
      h('span').f('app.game.changed', (n,o,w) => {
        if (app.game.winner) {
          w.text(`Player ${app.game.winner} wins!`) 
        } else {
          let who = app.game.playerOneTurn? 1 : 2;
          w.text(`Player ${who} turn`) 
        }
      })
    ])
  }
}


class Game {
  constructor(app) {
    this.app = app
    this.changed = 0
    this.playerOneTurn = true
    this.winner = null
    this.winCombos = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7]
    ]
    let side = [1, 2, 3]
    this.grid = side.map(y => side.map(x => ({value: '_', x: x-1, y: y-1})))
  }
  setWinner() {
    let flatList = []
    this.grid.forEach(row => row.forEach(square => flatList.push(square.value)))
    this.winCombos.forEach(combo => {
      let values = combo.map(i => flatList[i - 1]).join('') // Crappy way to check but hey!
      if (values == 'XXX') {
        this.winner = 1
      }
      if (values == '000') {
        this.winner = 2
      } 
    })
  }
  tickSquare(x, y) {
    this.changed += 1
    this.grid[y][x].value = this.playerOneTurn? 'X' : '0';
    this.playerOneTurn = ! this.playerOneTurn;
    this.setWinner()
    this.app.update()
  }
}