import { render } from 'preact'
import './ui/index.scss'
import { Playground } from './ui/playground/Playground'

render(<Playground />, document.getElementById('app')!)
