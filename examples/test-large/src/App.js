import React from 'react'
import { Root, Routes } from 'react-static'
import { Link } from '@reach/router'

import './app.css'

const App = () => (
  <Root>
    <nav>
      <Link exact to="/">
        Home
      </Link>
      <Link to="/about">About</Link>
      <Link to="/blog">Blog</Link>
    </nav>
    <div className="content">
      <Routes />
    </div>
  </Root>
)

export default App
