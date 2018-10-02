import React, { Fragment } from 'react'
import { Router, Routes } from 'react-static'

import './app.css'
import Header from './components/Header'
import Footer from './components/Footer'

const App = () => (
  <Router>
    <Fragment>
      <Header />
      <main role="main" className="container">
        <Routes />
      </main>
      <Footer />
    </Fragment>
  </Router>
)

export default App
