import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trip } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return `${s.toLocaleDateString('ko-KR')} ~ ${e.toLocaleDateString('ko-KR')} (${diff}일)`
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

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

        {trips && trips.length > 0 ? (
          <div className="space-y-3">
            {(trips as Trip[]).map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{trip.title}</CardTitle>
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
