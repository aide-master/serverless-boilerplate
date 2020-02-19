import React from 'react'
import Head from 'next/head'
import './index.less'
import { NextPage } from 'next'

const App: NextPage = () => {
  return (
    <div className='App'>
      <Head>
        <title>Demo</title>
      </Head>
      <article className='App-content'>
        <img src='/logo.svg' className='App-logo' alt='logo' />
      </article>
    </div>
  )
}

App.getInitialProps = ({ res }) => {
  // set cachec-control
  // if (res) {
  //   res.setHeader('Cache-Control', 'max-age=86400, public')
  // }
  return {}
}

export default App
