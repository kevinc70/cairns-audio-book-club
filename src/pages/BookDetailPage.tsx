import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { StatusFilterDropdown } from '../components/ui/StatusFilterDropdown'
import { supabase } from '../lib/supabase'

type Availability = '' | 'not_available' | 'available_now' | 'signed_out' | 'read_already' | 'not_interested'
type OnHoldSelection = '' | 'yes' | 'no'

type DetailBook = {
  id: string
  title: string
  author?: string | null
  discussionDate?: string | null
  coverUrl?: string | null
}

type MemberCard = {
  rowId?: string
  memberId: string
  name: string
  availability: Availability
  onHold: OnHoldSelection
  expectedAvailabilityDate: string
  review: string
}

type DiscussionInfo = {
  meetingId?: string
  date: string
  link: string
}

type PhotoItem = {
  id: string
  url: string
  name: string
}

const MEMBER_ORDER = ['Kevin', 'Bel', 'Angus']

const AVAILABILITY_OPTIONS: Array<{ value: Availability; label: string }> = [
  { value: '', label: 'Select availability' },
  { value: 'not_available', label: 'Not Available' },
  { value: 'available_now', label: 'Available Now' },
  { value: 'signed_out', label: 'Signed Out' },
  { value: 'read_already', label: 'Read Already' },
  { value: 'not_interested', label: 'Not Interested' },
]

const ON_HOLD_OPTIONS: Array<{ value: OnHoldSelection; label: string }> = [
  { value: '', label: 'Select' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

function formatDate(date: string | null | undefined) {
  if (!date) return ''
  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const parsed = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatInputDate(date: string | null | undefined) {
  if (!date) return ''
  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnlyMatch) return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

function payloadFromMember(bookId: string, member: MemberCard) {
  return {
    book_id: bookId,
    member_id: member.memberId,
    available: member.availability === 'available_now',
    borrowed: member.availability === 'signed_out',
    finished: member.availability === 'read_already',
    not_interested: member.availability === 'not_interested',
    on_hold: member.onHold === 'yes',
    own_copy: false,
    expected_available_date: member.expectedAvailabilityDate || null,
    notes: member.review || null,
  }
}

function sortMembers<T extends { name: string }>(members: T[]) {
  return members.slice().sort((a, b) => {
    const aIndex = MEMBER_ORDER.indexOf(a.name)
    const bIndex = MEMBER_ORDER.indexOf(b.name)
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
    }
    return a.name.localeCompare(b.name)
  })
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [book, setBook] = useState<DetailBook | null>(null)
  const [members, setMembers] = useState<MemberCard[]>([])
  const [discussion, setDiscussion] = useState<DiscussionInfo>({ date: '', link: '' })
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [openingDiscussion, setOpeningDiscussion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBook = async () => {
      if (!id) {
        setError('No book selected.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data: bookRow, error: bookError } = await supabase
        .from('books')
        .select('id,title,author,discussion_date,cover_url,cover_image_url')
        .eq('slug', id)
        .single()

      if (bookError || !bookRow) {
        setError('Unable to load this book.')
        setLoading(false)
        return
      }

      const [membersResult, statusResult, meetingResult] = await Promise.all([
        supabase.from('family_members').select('id,name'),
        supabase
          .from('member_book_status')
          .select('id,member_id,available,on_hold,borrowed,finished,not_interested,expected_available_date,notes')
          .eq('book_id', bookRow.id),
        supabase
          .from('discussion_meetings')
          .select('id,scheduled_for,meeting_link')
          .eq('book_id', bookRow.id)
          .limit(1)
          .maybeSingle(),
      ])

      if (membersResult.error || statusResult.error || meetingResult.error) {
        setError('Unable to load book details.')
        setLoading(false)
        return
      }

      const statusRows = statusResult.data ?? []
      const memberCards = sortMembers(membersResult.data ?? []).map((member: any) => {
        const status = (statusRows as any[]).find((row) => row.member_id === member.id)
        return {
          rowId: status?.id,
          memberId: member.id,
          name: member.name,
          availability: '' as Availability,
          onHold: '' as OnHoldSelection,
          expectedAvailabilityDate: formatInputDate(status?.expected_available_date),
          review: status?.notes ?? '',
        }
      })

      setBook({
        id: bookRow.id,
        title: bookRow.title,
        author: bookRow.author,
        discussionDate: bookRow.discussion_date,
        coverUrl: bookRow.cover_image_url ?? bookRow.cover_url,
      })
      setMembers(memberCards)
      setDiscussion({
        meetingId: meetingResult.data?.id,
        date: formatInputDate(meetingResult.data?.scheduled_for ?? bookRow.discussion_date),
        link: meetingResult.data?.meeting_link ?? '',
      })
      setLoading(false)
    }

    loadBook()
  }, [id])

  const saveMember = async (member: MemberCard) => {
    if (!book) return
    const payload = payloadFromMember(book.id, member)

    try {
      setSaving(true)
      if (member.rowId) {
        const { error } = await supabase.from('member_book_status').update(payload).eq('id', member.rowId)
        if (error) throw error
        return
      }

      const { data, error } = await supabase.from('member_book_status').insert([payload]).select('id').single()
      if (error) throw error
      setMembers((current) =>
        current.map((item) => (item.memberId === member.memberId ? { ...item, rowId: data.id } : item)),
      )
    } catch (saveError) {
      console.error('Unable to save member status', saveError)
    } finally {
      setSaving(false)
    }
  }

  const updateMember = (memberId: string, changes: Partial<MemberCard>, save = true) => {
    let updatedMember: MemberCard | null = null
    setMembers((current) =>
      current.map((member) => {
        if (member.memberId !== memberId) return member
        updatedMember = { ...member, ...changes }
        return updatedMember
      }),
    )

    if (save) {
      window.setTimeout(() => {
        if (updatedMember) saveMember(updatedMember)
      }, 0)
    }
  }

  const saveDiscussion = async (nextDiscussion = discussion) => {
    if (!book) return

    try {
      setSaving(true)
      const { error: bookError } = await supabase
        .from('books')
        .update({ discussion_date: nextDiscussion.date || null })
        .eq('id', book.id)
      if (bookError) throw bookError

      const payload = {
        book_id: book.id,
        scheduled_for: nextDiscussion.date || null,
        meeting_link: nextDiscussion.link || null,
      }

      if (nextDiscussion.meetingId) {
        const { error } = await supabase
          .from('discussion_meetings')
          .update(payload)
          .eq('id', nextDiscussion.meetingId)
        if (error) throw error
      } else if (nextDiscussion.date || nextDiscussion.link) {
        const { data, error } = await supabase
          .from('discussion_meetings')
          .insert([payload])
          .select('id')
          .single()
        if (error) throw error
        setDiscussion((current) => ({ ...current, meetingId: data.id }))
      }

      setBook((current) => (current ? { ...current, discussionDate: nextDiscussion.date } : current))
    } catch (saveError) {
      console.error('Unable to save discussion details', saveError)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    setUploadingPhotos(true)
    const nextPhotos = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setPhotos((current) => [...current, ...nextPhotos])
    window.setTimeout(() => setUploadingPhotos(false), 350)
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingScreen message="Turning the page..." />
      </AppShell>
    )
  }

  if (error || !book) {
    return (
      <AppShell>
        <section className="page-section">
          <header className="page-header">
            <p className="eyebrow">Book not available</p>
            <h1>{error ?? 'We could not find that book.'}</h1>
          </header>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {saving ? <LoadingScreen message="Saving your story..." /> : null}
      {uploadingPhotos ? <LoadingScreen message="Adding memories..." /> : null}
      {openingDiscussion ? <LoadingScreen message="Opening discussion..." /> : null}
      <article className="book-detail-page simple-book-detail">
        <section className="detail-hero-simple">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={`${book.title} cover`} className="detail-hero-cover" />
          ) : (
            <div className="detail-hero-cover detail-cover-placeholder" aria-hidden="true">
              <span>Cover</span>
            </div>
          )}
          <div className="detail-hero-copy">
            <h1>{book.title}</h1>
            <p>{book.author}</p>
            {book.discussionDate ? (
              <p className="detail-discussion-date">Discussion: {formatDate(book.discussionDate)}</p>
            ) : null}
          </div>
        </section>

        {!book.discussionDate ? (
          <section className="detail-section">
            <h2>Member Status</h2>
            <div className="member-status-grid">
              {members.map((member) => (
                <article key={member.memberId} className="member-status-detail-card">
                  <h3>{member.name}</h3>
                  <div className="status-row">
                    <StatusFilterDropdown
                      label="Availability"
                      value={member.availability}
                      options={AVAILABILITY_OPTIONS}
                      onChange={(value) => updateMember(member.memberId, { availability: value })}
                    />
                  </div>
                  <div className="status-row">
                    <StatusFilterDropdown
                      label="On Hold"
                      value={member.onHold}
                      options={ON_HOLD_OPTIONS}
                      onChange={(value) => updateMember(member.memberId, { onHold: value })}
                    />
                  </div>
                  <label className="status-row">
                    <span>Expected Availability</span>
                    <input
                      type="date"
                      value={member.expectedAvailabilityDate}
                      onChange={(event) =>
                        updateMember(member.memberId, { expectedAvailabilityDate: event.target.value })
                      }
                    />
                  </label>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="detail-section discussion-detail-section">
          <h2>Discussion</h2>
          <div className="discussion-detail-grid">
            <label>
              <span>Discussion Date</span>
              <input
                type="date"
                value={discussion.date}
                onChange={(event) => setDiscussion((current) => ({ ...current, date: event.target.value }))}
                onBlur={() => saveDiscussion()}
              />
            </label>
            <label>
              <span>Discussion Link</span>
              <input
                type="url"
                value={discussion.link}
                placeholder="https://..."
                onChange={(event) => setDiscussion((current) => ({ ...current, link: event.target.value }))}
                onBlur={() => saveDiscussion()}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!discussion.link}
              onClick={() => {
                if (!discussion.link) return
                setOpeningDiscussion(true)
                window.open(discussion.link, '_blank', 'noopener,noreferrer')
                window.setTimeout(() => setOpeningDiscussion(false), 500)
              }}
            >
              Open Discussion
            </button>
          </div>
        </section>

        <section className="detail-section">
          <h2>Family Reviews</h2>
          <div className="family-review-grid">
            {members.map((member) => (
              <label key={member.memberId} className="family-review-card">
                <span>{member.name}</span>
                <textarea
                  value={member.review}
                  onChange={(event) => updateMember(member.memberId, { review: event.target.value }, false)}
                  onBlur={() => {
                    const updated = members.find((item) => item.memberId === member.memberId)
                    if (updated) saveMember(updated)
                  }}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <div className="photos-section-header">
            <h2>Photos</h2>
            <button className="btn btn-primary" type="button" onClick={() => uploadInputRef.current?.click()}>
              Upload Photos
            </button>
            <input
              ref={uploadInputRef}
              className="photo-upload-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handlePhotoUpload(event.target.files)}
            />
          </div>
          {photos.length === 0 ? (
            <p className="empty-state">No photos have been uploaded yet.</p>
          ) : (
            <div className="uploaded-photo-grid">
              {photos.map((photo) => (
                <button key={photo.id} type="button" onClick={() => setActivePhoto(photo)}>
                  <img src={photo.url} alt={photo.name} />
                </button>
              ))}
            </div>
          )}
        </section>

        {activePhoto ? (
          <div className="photo-lightbox" role="dialog" aria-modal="true" onClick={() => setActivePhoto(null)}>
            <img src={activePhoto.url} alt={activePhoto.name} />
          </div>
        ) : null}
      </article>
    </AppShell>
  )
}
