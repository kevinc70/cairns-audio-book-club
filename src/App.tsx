import './styles/theme.css'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { BookDetailPage } from './pages/BookDetailPage'
import { LibraryPage } from './pages/LibraryPage'
import { WantToReadPage } from './pages/WantToReadPage'
import { StatsPage } from './pages/StatsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book/:id" element={<BookDetailPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/want-to-read" element={<WantToReadPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

export default App
