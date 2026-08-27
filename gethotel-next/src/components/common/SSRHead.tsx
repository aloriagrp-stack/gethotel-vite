'use client';
import { collectHead } from "@/lib/ssr-head"

interface SSRHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  schemas?: object[]
  noIndex?: boolean
}

export default function SSRHead(props: SSRHeadProps) {
  if (props.title || props.description) {
    collectHead(props)
  }
  return null
}
