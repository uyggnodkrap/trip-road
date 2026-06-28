'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
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
}

export function DeleteTripButton({ tripId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('itinerary_items').delete().eq('trip_id', tripId)
    await supabase.from('trips').delete().eq('id', tripId)
    router.push('/')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-gray-400 hover:text-red-500')}>
        삭제
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>여행 삭제</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">이 여행과 모든 일정을 삭제합니다. 되돌릴 수 없습니다.</p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>취소</Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={loading}>
            {loading ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
