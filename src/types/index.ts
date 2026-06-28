export interface Trip {
  id: string
  user_id: string
  title: string
  start_date: string
  end_date: string
  share_token: string
  created_at: string
}

export interface ItineraryItem {
  id: string
  trip_id: string
  date: string
  time: string | null
  place_name: string
  memo: string | null
  order: number
  created_at: string
}
