import { supabase } from './supabase'

const CHILD_TABLES = ['member_book_status', 'discussion_meetings', 'quotes', 'book_reviews', 'book_photos']

function isMissingTableError(error: any) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase()
  return (
    text.includes('42p01') ||
    text.includes('pgrst205') ||
    text.includes('could not find the table') ||
    text.includes('relation') && text.includes('does not exist')
  )
}

export async function deleteBookAndChildren(bookId: string) {
  for (const table of CHILD_TABLES) {
    const { error } = await supabase.from(table).delete().eq('book_id', bookId)
    if (error && !isMissingTableError(error)) {
      throw new Error(`Unable to delete related records from ${table}: ${error.message}`)
    }
  }

  const { error } = await supabase.from('books').delete().eq('id', bookId)
  if (error) {
    throw new Error(`Unable to delete the book: ${error.message}`)
  }
}
