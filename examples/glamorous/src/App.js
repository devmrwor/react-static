import React from 'react'
import { Router, Route, Switch, Redirect, Link } from 'react-static'
import glamorous from 'glamorous'
//
import Home from 'containers/Home'
import About from 'containers/About'
import Blog from 'containers/Blog'

const AppStyles = glamorous.div({
  fontFamily:
    "'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  fontSize: '16px',
  margin: '0',
  padding: '0',
  '& a': {
    textDecoration: 'none',
    color: '#108db8',
    fontWeight: 'bold',
  },
  '& nav': {
    width: '100%',
    background: '#108db8',
    '& a': {
      color: 'white',
      padding: '1rem',
      display: 'inline-block',
    },
  },
  '& .content': {
    padding: '1rem',
  },
})

export default () => (
  <Router>
    <AppStyles>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
      </nav>
      <div className="content">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/blog" component={Blog} />
          <Redirect to="/" />
        </Switch>
      </div>
    </AppStyles>
  </Router>
)
