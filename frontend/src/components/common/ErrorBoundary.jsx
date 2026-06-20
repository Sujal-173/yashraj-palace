import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', textAlign:'center', padding:'2rem' }}>
          <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>⚠️</div>
          <h1 style={{ fontSize:'1.75rem', marginBottom:'0.75rem', color:'#1C1C1E' }}>Something went wrong</h1>
          <p style={{ color:'#6B6B6B', marginBottom:'1.5rem', maxWidth:'400px' }}>
            An unexpected error occurred. Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding:'0.75rem 1.75rem', background:'#6B1A2B', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'1rem', fontWeight:'600' }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
