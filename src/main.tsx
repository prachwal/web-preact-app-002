import { render } from 'preact'
import '@fontsource-variable/inter/wght.css'
import './index.scss'
import { App } from './app.tsx'

render(<App />, document.getElementById('app')!)
