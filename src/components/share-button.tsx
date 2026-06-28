'use client'

import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  shareToken: string
}

export function ShareButton({ shareToken }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = `${window.location.origin}/trip-road/trip/?share=${shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
    >
      {copied ? '✓ 복사됨' : '공유'}
    </button>
  )
}
