import React from 'react';
import ReactDOM from 'react-dom';
import MainBoard from './board.js'
// import MainBoard from './NewBoard'
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <MainBoard />
  </React.StrictMode>,
  document.getElementById('root')
);
reportWebVitals();
