# Methods

In addition to components, React-Static exports a some simple functions to help you in programmatic use cases:

* [onLoading](/docs/methods/#onloading)
* [prefetch](/docs/methods/#prefetch)
* [scrollTo](/docs/methods/#scrollto)

### `onLoading`

If you need to imperatively subscribe to React-Static's global loading state, you can use `onLoading`. Via a callback, you have access to a `loading` state, which will be set to `0`, `1`, or `2` depending on the loading state. This changes when react-static is either navigating to a new page or waiting on assets to load (this won't happen often, hopefully not at all). Use this to show a loading indicator if you'd like!

Possible `loading` states:

* `0` - Finished loading / not loading
* `1` - A "soft" loading state for navigating to a new page.
* `2` - A "hard" loading state for when assets are being requested.

Example:

```javascript
import { onLoading } from 'react-static'

// Pass a callback that will fire whenever the loading state changes.
const unsubscribe = onLoading(loading => {
  console.log(`Currently loading state: ${loading}`)
})

// Call the function it returns to unsubscribe!
unsubscribe()
```

### `prefetch`

`prefetch` is an imperative version of the `Prefetch` component that you can use anywhere in your code.

Example:

```javascript
import { prefetch } from 'react-static'

const myFunc = async () => {
  const data = await prefetch('/blog')
  console.log('The preloaded data:', data)
}
```

### `scrollTo`

This **async** method can be used to scroll to any given height or DOMElement you pass it.

* Arguments
  * `height: int || DOMElement` - The height from the top of the page or dom element you would like to scroll to.
  * `options{}` - An optional settings object
    * `duration: Int` - The duration of the animation in milliseconds
    * `offset: Int` - The negative or positive offset in pixels
    * `context: DOMElement` - The container element that will be scrolled. Defaults to `body` via `window.scrollTo`
* Returns a `Promise` that is resolved when the scrolling stops

Example:

```javascript
import { scrollTo } from 'react-static'

const scrollToElement = () => {
  const element = document.getElementById('my-element')
  scrollTo(element)
}

const asyncScrollToHeight = async () => {
  await scrollTo(100, {
    offset: -10,
    duration: 2000
  })
  console.log('Done scrolling!')
}
```
