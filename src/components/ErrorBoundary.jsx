import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(p){ super(p); this.state = { hasError:false, error:null } }
  static getDerivedStateFromError(error){ return { hasError:true, error } }
  componentDidCatch(err, info){ console.error('ErrorBoundary', err, info) }
  render(){
    if (this.state.hasError) {
      return (
        <div className="container py-4">
          <div className="card p-4">
            <h4>Ocurrió un error en la UI</h4>
            <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
