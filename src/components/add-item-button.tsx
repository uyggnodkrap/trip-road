'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Props {
  tripId: string
  date: string
}

export function AddItemButton({ tripId, date }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [placeName, setPlaceName] = useState('')
  const [time, setTime] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { data: existing } = await supabase
      .from('itinerary_items')
      .select('order')
      .eq('trip_id', tripId)
      .eq('date', date)
      .order('order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? existing[0].order + 1 : 0

    await supabase.from('itinerary_items').insert({
      trip_id: tripId,
      date,
      time: time || null,
      place_name: placeName,
      memo: memo || null,
      order: nextOrder,
    })

    setPlaceName('')
    setTime('')
    setMemo('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
        + 추가
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>일정 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label htmlFor="place">장소 이름</Label>
            <Input
              id="place"
              placeholder="예: 도쿄 타워"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="time">시간 (선택)</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea
              id="memo"
              placeholder="예약 정보, 주의사항 등"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '추가 중...' : '추가'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
