import type { ProgressInfo } from '../../types'

interface ProgressCardProps {
  progress: ProgressInfo
}

export function ProgressCard({ progress }: ProgressCardProps) {
  return (
    <article className="progress-card">
      <div className="progress-card-header">
        <p className="eyebrow">Progress</p>
        <p className="progress-percent">{progress.complete}% Complete</p>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress.complete}%` }} />
      </div>
      <div className="progress-details">
        <span>Last listened: {progress.lastListened}</span>
        <span>Time remaining: {progress.timeRemaining}</span>
      </div>
    </article>
  )
}
