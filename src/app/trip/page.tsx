'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trip, ItineraryItem } from '@/types'
import { Separator } from '@/components/ui/separator'
import { AddItemButton } from '@/components/add-item-button'
import { ItemCard } from '@/components/item-card'
import { DeleteTripButton } from '@/components/delete-trip-button'
import { EditableTripTitle } from '@/components/editable-trip-title'
import { ShareButton } from '@/components/share-button'
import { useRequireAuth } from '@/hooks/use-require-auth'

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function formatDate(dateStr: string, index: number) {
  const d = new Date(dateStr)
  return `Day ${index + 1} · ${d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}`
}

function TripContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useRequireAuth()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [tripId, setTripId] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // 공유 토큰으로 여행 참여
  useEffect(() => {
    if (!user) return
    const shareToken = searchParams.get('share')
    const idParam = searchParams.get('id')

    if (shareToken) {
      const supabase = createClient()
      supabase.rpc('join_trip_by_token', { p_token: shareToken }).then(({ data: tId, error }) => {
        if (error || !tId) { router.push('/'); return }
        router.replace(`/trip/?id=${tId}`)
      })
    } else if (idParam) {
      setTripId(idParam)
    } else {
      router.push('/')
    }
  }, [user, searchParams, router])

  const fetchItems = useCallback(async () => {
    if (!tripId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('date')
      .order('order')
    setItems((data ?? []) as ItineraryItem[])
  }, [tripId])

  // 초기 데이터 로드
  useEffect(() => {
    if (!user || !tripId) return
    const supabase = createClient()
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => {
      if (!data) { router.push('/'); return }
      setTrip(data as Trip)
      setDataLoading(false)
    })
    fetchItems()
  }, [user, tripId, fetchItems, router])

  // Realtime 구독 — 다른 사용자의 변경 사항 실시간 반영
  useEffect(() => {
    if (!tripId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'itinerary_items',
        filter: `trip_id=eq.${tripId}`,
      }, fetchItems)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tripId, fetchItems])

  if (authLoading || dataLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  }

  if (!trip) return null

  const isOwner = trip.user_id === user.id
  const dates = getDatesInRange(trip.start_date, trip.end_date)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-gray-500 hover:text-gray-700 shrink-0">←</Link>
          <EditableTripTitle
            tripId={trip.id}
            initialTitle={trip.title}
            onUpdate={(title) => setTrip({ ...trip, title })}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton shareToken={trip.share_token} />
          {isOwner && <DeleteTripButton tripId={trip.id} />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {dates.map((date, i) => {
          const dayItems = items.filter((item) => item.date === date)
          return (
            <section key={date}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-600">{formatDate(date, i)}</h2>
                <AddItemButton tripId={trip.id} date={date} onSuccess={fetchItems} />
              </div>

              {dayItems.length > 0 ? (
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <ItemCard key={item.id} item={item} onSuccess={fetchItems} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-2">일정을 추가해보세요</p>
              )}

              <Separator className="mt-4" />
            </section>
          )
        })}
      </main>
    </div>
  )
}

export default function TripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>}>
      <TripContent />
    </Suspense>
  )
}
