import * as React from 'react';
import './App.css';
import Header from './Header/Header'
import Body from './Body/Body'
import Footer from './Footer/Footer'

class App extends React.Component { render() {
    return (
    <div>
      <Header/>
      <Body />
      <Footer/>
    </div>
    )
  }
}

export default App;
