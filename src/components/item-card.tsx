'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItineraryItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  item: ItineraryItem
  onSuccess: () => void
}

export function ItemCard({ item, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [placeName, setPlaceName] = useState(item.place_name)
  const [time, setTime] = useState(item.time ?? '')
  const [memo, setMemo] = useState(item.memo ?? '')
  const [loading, setLoading] = useState(false)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('itinerary_items')
      .update({ place_name: placeName, time: time || null, memo: memo || null })
      .eq('id', item.id)
    setOpen(false)
    setLoading(false)
    onSuccess()
  }

  async function handleDelete() {
    const supabase = createClient()
    await supabase.from('itinerary_items').delete().eq('id', item.id)
    setOpen(false)
    onSuccess()
  }

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-sm transition-shadow"
        onClick={() => setOpen(true)}
      >
        <CardContent className="py-3 flex items-start gap-3">
          {item.time && (
            <span className="text-xs text-gray-500 min-w-[40px] pt-0.5">{item.time.slice(0, 5)}</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.place_name}</p>
            {item.memo && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.memo}</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>장소 이름</Label>
              <Input
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>시간</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>메모</Label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                삭제
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
