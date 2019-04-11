import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';

import './App.css';

import FormControl from './containers/FormControl';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <FormControl></FormControl>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
