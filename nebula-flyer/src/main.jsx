import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AtsFlyer from './AtsFlyer.jsx'
import AtsFlyerPro from './AtsFlyerPro.jsx'
import PerformanceFlyer from './PerformanceFlyer.jsx'

const path = window.location.pathname;

let Component = App;
if (path === '/ats') {
  Component = AtsFlyer;
} else if (path === '/ats-pro') {
  Component = AtsFlyerPro;
} else if (path === '/performance') {
  Component = PerformanceFlyer;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>,
)
