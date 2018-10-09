import React from 'react'
import { withRouter } from 'react-router-dom'
import RAF from 'raf'
//
import { unwrapArray } from '../../utils/browser'
import scrollTo from '../../utils/scrollTo'

const RouterScroller = withRouter(
  class RouterScroller extends React.Component {
    componentDidMount() {
      // Do not scroll to top on initial page load if hash does not exist
      this.scrollToHash({ orScrollToTop: false })
    }
    componentDidUpdate(prev) {
      if (
        prev.location.pathname !== this.props.location.pathname &&
        !this.props.location.hash
      ) {
        if (window.__noScrollTo) {
          window.__noScrollTo = false
          return
        }
        this.scrollToTop()
        return
      }
      if (prev.location.hash !== this.props.location.hash) {
        this.scrollToHash()
      }
    }
    scrollToTop = () => {
      const { autoScrollToTop, scrollToTopDuration } = this.props
      if (autoScrollToTop) {
        scrollTo(0, {
          duration: scrollToTopDuration,
        })
      }
    }
    scrollToHash = ({ orScrollToTop = true } = {}) => {
      const {
        scrollToHashDuration,
        autoScrollToHash,
        scrollToHashOffset,
        location: { hash },
      } = this.props
      if (!autoScrollToHash) {
        return
      }
      if (hash) {
        const resolvedHash = hash.substring(1)
        if (resolvedHash) {
          // We must attempt to scroll synchronously or we risk the browser scrolling for us
          const element = document.getElementById(resolvedHash)
          if (element !== null) {
            scrollTo(element, {
              duration: scrollToHashDuration,
              offset: scrollToHashOffset,
            })
          } else {
            RAF(() => {
              const element = document.getElementById(resolvedHash)
              if (element !== null) {
                scrollTo(element, {
                  duration: scrollToHashDuration,
                  offset: scrollToHashOffset,
                })
              }
            })
          }
        }
      } else if (orScrollToTop) {
        scrollTo(0, {
          duration: scrollToHashDuration,
        })
      }
    }
    render() {
      return unwrapArray(this.props.children)
    }
  }
)

export default RouterScroller
