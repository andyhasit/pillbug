# Pillbug

A really zany framework.

## Overview

Pillbug is a tiny, lightening fast JavaScript framework for building reactive web apps, or making parts of existing pages reactive (it's 1.8KB gzipped, so you'll barely notice it).

The easiest way to understand Pillbug is to compare it to [React](https://reactjs.org/). 

Here is a simple click counter built in **React**:

```jsx
class MyButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: 0}
  }
  render() {
    return (
      <div>
        <div>{this.state.value}</div>
        <button onClick={_ => this.handleClick()}>Click</button>
      </div>
    )
  }
  handleClick(event) {
    this.setState({value: this.state.value++})
  }
}
```

Here is the same component in **Pillbug**:

```javascript
class ClickCounter extends View {
  init(__args__) {
    this.clickCount = 0
    build('div', [
      h('div').f('text:clickCount'),
      h('button').on('click', _ => this.handleClick())
    ])
  }
  handleClick() {
    this.clickCount ++
    this.update()
  }
}
```

Apart from the obvious, they're pretty similar, but what's actually happening underneath is very different.

In **React** (or any virtual DOM based framework) we return a *representation* of what the component should look like. React then compares this against what it thinks is in the DOM, and applies the changes. It repeats this "rebuild & compare" every time the state changes.

In **Pillbug** we create the *actual* DOM in real time once, and attach instructions to directly update elements if certain values change.

This different approach has two major implications:

#### Performance

Pillbug's approach is a lot more efficient because:

1. It doesn't rebuild the component's whole representation every time.
2. It only compares old vs new on specific values we care about, not the whole representation.

*Performance* however is mostly affected by how you wield the DOM rather than in-memory operations (though they still count). This [article](https://codeburst.io/taming-huge-collections-of-dom-nodes-bebafdba332) is essential reading on DOM performance, and was a big inspiration for Pillbug.

Aside from being faster than virtual DOM frameworks out of the box, Pillbug also makes it easy to get within milliseconds of the fastest possible render in the browser (which is *a lot faster* than most frameworks).

#### Productivity

A quick glance at [stackoverflow/tags](https://stackoverflow.com/tags?) tells us that we probably spend more time stuck figuring out:

- Why something is not behaving the way we expect.
- How to do tricky things.
- How to to work around it.

than we do on implementing actual functionality... React is not as bad as Frameworks which use special syntax in HTML (Angular, Ember, Riot etc...) in this respect, but still has 172,000 questions on stackoverflow.

Pillbug is just JavaScript wrapper code around direct DOM manipulation, bundled into a minimal component architecture. There is no magic, no special syntax embedded in HTML, no data binding, no observable pattern, no virtual DOM, no diff & patch algorithms, and no code that you can't understand in under a minute or two.

This means:

- There's not much that can go wrong - if it does, you can examine the 300 lines of code to find out why.
- There's no "how to" answer for tricky things - its just JavaScript.
- There's nothing to work around - we're already working directly with DOM, just using wrapper code.

Reducing the time wasted on such issue is the first step towards productivity. The second is syntactic sugar to help you write less code, and Pillbug has some very neat tricks up its sleeve for that as you'll soon discover.

## Installation

#### Quick way

The quick way to get running is by cloning this repo and running the demos:

```
git clone https://github.com/andyhasit/pillbug
cd pillbug/demos
npm install
```

I highly recommend using [parcel](https://parceljs.org/) which you should install globally:

```
npm install -g parcel-bundler
```

You can then run the demo server which do all the transpiling and watch changes in your files:

```
cd pillbug/demos
parcel index.html
```

#### Long way

Get Pillbug from npm:

```
npm i pillbug-js --save-dev
```

Install the babel plugin:

```
npm install --save-dev @babel/core
npm install babel-plugin-pillbug
```

Configure it by adding this to the **.babelrc** file in your project:

```
{
  "plugins": [
    [
      "pillbug", {
        "oldArgs": "__args__",
        "newArgs": "app, box, , build, el, h, obj, seq, watch"
      }
    ]
  ]
}
```

## Using Pillbug

Refer to the [tutorial](./Tutorial.md) and the [reference](./Reference.md).

## Project Status

This project is in very early stages and things are subject to change. Contributions welcome.

## Licence

[MIT](https://opensource.org/licenses/MIT)

