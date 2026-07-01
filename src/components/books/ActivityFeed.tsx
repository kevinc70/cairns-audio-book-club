interface ActivityItem {
  title: string
  description: string
  time: string
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="activity-feed">
      <div className="section-trailer">
        <p className="eyebrow">Family activity</p>
        <h2>Everything happening in our listening room.</h2>
      </div>
      {items.length === 0 ? (
        <p className="empty-state">No activity updates are available yet.</p>
      ) : (
        <div className="activity-cards">
          {items.map((activity) => (
            <article key={activity.title} className="activity-card">
              <p className="activity-time">{activity.time}</p>
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
