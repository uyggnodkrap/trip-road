import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Trip, ItineraryItem } from '@/types'
import { Separator } from '@/components/ui/separator'
import { AddItemButton } from '@/components/add-item-button'
import { ItemCard } from '@/components/item-card'
import { DeleteTripButton } from '@/components/delete-trip-button'
import { EditableTripTitle } from '@/components/editable-trip-title'

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

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trip) notFound()

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('trip_id', id)
    .order('date')
    .order('order')

  const tripData = trip as Trip
  const allItems = (items ?? []) as ItineraryItem[]
  const dates = getDatesInRange(tripData.start_date, tripData.end_date)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700">←</Link>
          <EditableTripTitle tripId={id} initialTitle={tripData.title} />
        </div>
        <DeleteTripButton tripId={id} />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {dates.map((date, i) => {
          const dayItems = allItems.filter((item) => item.date === date)
          return (
            <section key={date}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-600">{formatDate(date, i)}</h2>
                <AddItemButton tripId={id} date={date} />
              </div>

              {dayItems.length > 0 ? (
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
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
