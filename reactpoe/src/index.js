// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Routes from './routes';
import App from './components/App';
import About from './components/About';
import NotFound from './components/NotFound';

import './index.css';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App}/>
      <Route path="/about" component={About} />
      <Route path="*" component={NotFound} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);