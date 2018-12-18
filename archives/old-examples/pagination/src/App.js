import React from 'react'
import { Root, Routes } from 'react-static'
import { Link } from '@reach/router'
import styled, { injectGlobal } from 'styled-components'

//

injectGlobal`
  body {
    font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial,
      'Lucida Grande', sans-serif;
    font-weight: 300;
    font-size: 16px;
    margin: 0;
    padding: 0;
  }
`

const AppStyles = styled.div`
  a {
    text-decoration: none;
    color: #108db8;
    font-weight: bold;
  }

  nav {
    width: 100%;
    background: #108db8;

    a {
      color: white;
      padding: 1rem;
      display: inline-block;
    }
  }

  .content {
    padding: 1rem;
  }

  img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
  }
`

const App = () => (
  <Root>
    <AppStyles>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/users">Users</Link>
      </nav>
      <div className="content">
        <Routes />
      </div>
    </AppStyles>
  </Root>
)

export default App
