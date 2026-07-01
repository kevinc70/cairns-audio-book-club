import type { DiscussionNote } from '../../types'

interface DiscussionCardProps {
  note: DiscussionNote
}

export function DiscussionCard({ note }: DiscussionCardProps) {
  return (
    <article className="discussion-card">
      <div className="discussion-heading">
        <p className="eyebrow">Discussion notes</p>
        <h2>{note.title}</h2>
      </div>
      <div className="discussion-content">
        {note.blocks.map((block) => {
          if (block.type === 'heading') {
            return <h3 key={block.text}>{block.text}</h3>
          }
          if (block.type === 'paragraph') {
            return <p key={block.text}>{block.text}</p>
          }
          if (block.type === 'list') {
            return (
              <ul key={block.text.join(',')}>
                {block.text.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          }
          return null
        })}
      </div>
    </article>
  )
}
