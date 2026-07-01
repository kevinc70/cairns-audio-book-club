import { BookOpen, Clock3, Heart, Sparkles } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { HeroSection } from '../components/ui/HeroSection'
import { FamilyGrid } from '../components/books/FamilyGrid'
import BookCoverList from '../components/books/BookCoverList'
import { FinishedBooks } from '../components/books/FinishedBooks'
import { ReadingTimeline } from '../components/books/ReadingTimeline'
import { ActivityFeed } from '../components/books/ActivityFeed'
import { StatsCard } from '../components/stats/StatsCard'
import type { Member, ShelfBook, FinishedBook, JourneyItem, ActivityItem, HeroBook } from '../types'

const currentBook: HeroBook = {
  title: 'The Hobbit',
  author: 'J.R.R. Tolkien',
  rating: '★★★★★',
  startedDate: 'March 12',
  discussionDate: 'July 15',
  progress: 82,
  summary:
    'A cinematic family adventure that brings magic, warmth, and wonder to every listening hour.',
}

const familyMembers: Member[] = [
  {
    name: 'Kevin',
    initial: 'K',
    booksCompleted: 14,
    favoriteGenre: 'Fantasy',
    currentlyListening: 'The Hobbit',
  },
  {
    name: 'Emma',
    initial: 'E',
    booksCompleted: 18,
    favoriteGenre: 'Historical Fiction',
    currentlyListening: 'The Night Circus',
  },
  {
    name: 'Liam',
    initial: 'L',
    booksCompleted: 11,
    favoriteGenre: 'Sci-Fi',
    currentlyListening: 'Project Hail Mary',
  },
]

const nextAdventures: ShelfBook[] = [
  {
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    rating: '4.9',
    readingTime: '9 hrs',
    discussionDate: 'Aug 2',
    description: 'A luminous tale of wonder, magic, and family promise.',
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    rating: '4.8',
    readingTime: '11 hrs',
    discussionDate: 'Aug 18',
    description: 'A thrilling science adventure for curious ears.',
  },
  {
    title: 'The Paper Garden',
    author: 'Julia Glass',
    rating: '4.7',
    readingTime: '8 hrs',
    discussionDate: 'Sept 7',
    description: 'A gentle story of family, memory, and quiet light.',
  },
]

const finishedBooks: FinishedBook[] = [
  {
    title: 'Under the Elm Tree',
    author: 'A. Townsend',
    discussionDate: 'May 22',
    rating: '★★★★★',
    quote: '“A story that felt like home from the first page.”',
  },
  {
    title: 'Evenings at the Lake',
    author: 'N. Beckett',
    discussionDate: 'April 9',
    rating: '★★★★★',
    quote: '“Beautifully told and unforgettable together.”',
  },
]

const journeyItems: JourneyItem[] = [
  {
    year: '2025',
    title: 'Under the Elm Tree',
    discussionDate: 'May 22',
    notes: 'A family favorite for its warmth, humor, and unforgettable characters.',
    rating: '★★★★★',
  },
  {
    year: '2024',
    title: 'Evenings at the Lake',
    discussionDate: 'April 9',
    notes: 'The perfect slow listen for cozy nights and long talks.',
    rating: '★★★★★',
  },
  {
    year: '2023',
    title: 'The Paper Garden',
    discussionDate: 'Dec 14',
    notes: 'A luminous story that made us treasure every chapter.',
    rating: '★★★★☆',
  },
]

const activityItems: ActivityItem[] = [
  {
    title: 'Kevin finished Chapter 18',
    description: 'A perfect moment to pause and share thoughts before the next listen.',
    time: 'Today · 8:24 PM',
  },
  {
    title: 'Emma added Dune',
    description: 'New audiobook queued for the next family adventure.',
    time: 'Yesterday · 6:10 PM',
  },
  {
    title: 'Liam rated Project Hail Mary ★★★★★',
    description: 'A glowing family recommendation from our sci-fi fan.',
    time: 'Monday · 4:50 PM',
  },
  {
    title: 'Discussion scheduled Friday',
    description: 'Save the date for our next shared listening conversation.',
    time: 'This week',
  },
]

const stats = [
  {
    icon: <BookOpen size={20} />,
    label: 'Books completed',
    value: '34',
  },
  {
    icon: <Clock3 size={20} />,
    label: 'Hours listened',
    value: '142',
  },
  {
    icon: <Heart size={20} />,
    label: 'Favorite author',
    value: 'J.R.R. Tolkien',
  },
  {
    icon: <Sparkles size={20} />,
    label: 'Top genre',
    value: 'Fantasy',
  },
]

export function HomePage() {
  return (
    <AppShell>
      <header className="page-header page-header-premium">
        <p className="eyebrow">We’ve shared all these amazing stories together.</p>
        <h1>A home for our family’s audiobooks.</h1>
        <p className="intro-text">
          Every listen is a moment to enjoy together—stories that feel cinematic, personal, and unforgettable.
        </p>
      </header>

      <HeroSection book={currentBook} />
      <FamilyGrid members={familyMembers} />

      <section className="section-block">
        <div className="section-trailer">
          <p className="eyebrow">Our Next Adventures</p>
          <h2>Large covers, strong stories, next on the shelf.</h2>
        </div>
        <BookCoverList items={nextAdventures} />
      </section>

      <FinishedBooks books={finishedBooks} />
      <ReadingTimeline items={journeyItems} />
      <ActivityFeed items={activityItems} />

      <section className="stats-section">
        <div className="section-trailer">
          <p className="eyebrow">Statistics</p>
          <h2>Elegant story metrics, not a dashboard.</h2>
        </div>
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatsCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>
    </AppShell>
  )
}
