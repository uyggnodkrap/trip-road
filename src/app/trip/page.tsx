'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trip, ItineraryItem } from '@/types'
import { Separator } from '@/components/ui/separator'
import { AddItemButton } from '@/components/add-item-button'
import { ItemCard } from '@/components/item-card'
import { DeleteTripButton } from '@/components/delete-trip-button'
import { EditableTripTitle } from '@/components/editable-trip-title'
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
  const tripId = searchParams.get('id')
  const { user, loading: authLoading } = useRequireAuth()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  async function fetchData() {
    if (!user || !tripId) return
    const supabase = createClient()
    const [{ data: tripData }, { data: itemsData }] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).eq('user_id', user.id).single(),
      supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('date').order('order'),
    ])
    if (!tripData) { router.push('/'); return }
    setTrip(tripData as Trip)
    setItems((itemsData ?? []) as ItineraryItem[])
    setDataLoading(false)
  }

  useEffect(() => {
    if (!user || !tripId) return
    fetchData()
  }, [user, tripId])

  if (authLoading || dataLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  }

  if (!trip) return null

  const dates = getDatesInRange(trip.start_date, trip.end_date)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700">←</Link>
          <EditableTripTitle
            tripId={trip.id}
            initialTitle={trip.title}
            onUpdate={(title) => setTrip({ ...trip, title })}
          />
        </div>
        <DeleteTripButton tripId={trip.id} />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {dates.map((date, i) => {
          const dayItems = items.filter((item) => item.date === date)
          return (
            <section key={date}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-600">{formatDate(date, i)}</h2>
                <AddItemButton tripId={trip.id} date={date} onSuccess={fetchData} />
              </div>

              {dayItems.length > 0 ? (
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <ItemCard key={item.id} item={item} onSuccess={fetchData} />
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
