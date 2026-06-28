'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trip } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRequireAuth } from '@/hooks/use-require-auth'

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return `${s.toLocaleDateString('ko-KR')} ~ ${e.toLocaleDateString('ko-KR')} (${diff}일)`
}

export default function HomePage() {
  const { user, loading } = useRequireAuth()
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    // RLS가 본인 + 초대된 여행 모두 반환
    supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: false })
      .then(({ data }) => setTrips((data as Trip[]) ?? []))
  }, [user])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">✈️ 여행 플래너</h1>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">내 여행</h2>
          <Link href="/trips/new" className={cn(buttonVariants({ size: 'sm' }))}>
            + 새 여행
          </Link>
        </div>

        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trip?id=${trip.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{trip.title}</CardTitle>
                      {trip.user_id !== user.id && (
                        <Badge variant="outline" className="text-xs">공유됨</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p>아직 여행이 없어요.</p>
            <p className="text-sm mt-1">새 여행을 만들어 일정을 계획해보세요!</p>
          </div>
        )}
      </main>
    </div>
  )
}
