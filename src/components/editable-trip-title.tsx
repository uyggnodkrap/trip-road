'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tripId: string
  initialTitle: string
  onUpdate: (title: string) => void
}

export function EditableTripTitle({ tripId, initialTitle, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  async function handleBlur() {
    setEditing(false)
    const trimmed = title.trim()
    if (!trimmed || trimmed === initialTitle) {
      setTitle(initialTitle)
      return
    }
    const supabase = createClient()
    await supabase.from('trips').update({ title: trimmed }).eq('id', tripId)
    onUpdate(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') inputRef.current?.blur()
    if (e.key === 'Escape') {
      setTitle(initialTitle)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="text-xl font-bold bg-transparent border-b border-gray-400 outline-none w-48 sm:w-72"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-xl font-bold hover:opacity-70 transition-opacity text-left"
      title="클릭해서 제목 수정"
    >
      {title}
    </button>
  )
}
