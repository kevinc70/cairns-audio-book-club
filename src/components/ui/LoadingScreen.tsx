type LoadingScreenProps = {
  message?: string
}

export function LoadingScreen({ message = 'Turning the page...' }: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-panel">
        <p>{message}</p>
        <div className="page-turn" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
