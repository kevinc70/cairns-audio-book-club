import type { PhotoItem } from '../../types'

interface PhotoGalleryProps {
  photos: PhotoItem[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  return (
    <section className="photo-gallery">
      <div className="section-trailer">
        <p className="eyebrow">Photo gallery</p>
        <h2>Moments from our listening discussion.</h2>
      </div>
      {photos.length === 0 ? (
        <p className="empty-state">No gallery photos are available yet.</p>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <div className="photo-placeholder" aria-hidden="true">
                <span>Photo</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
