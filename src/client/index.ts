/**
 * @dsh-external/ui-message-nav — browser half.
 * Standalone session message navigation rail for the DSH conversation view.
 */
import React, { useEffect, useRef, useState } from 'react'

export const inject = ['slots']

const API_PREFIX = '/@dsh-external/ui-message-nav/api'

interface NavConfig {
  position: 'left' | 'right'
  previewMaxLength: number
  autoLoadOlder: boolean
  autoLoadThreshold: number
  showPreview: boolean
  activeColor: string
  idleColor: string
  barWidthActive: number
  barWidthIdle: number
  barHeightActive: number
  barHeightIdle: number
}

const DEFAULT_CONFIG: NavConfig = {
  position: 'right',
  previewMaxLength: 60,
  autoLoadOlder: true,
  autoLoadThreshold: 40,
  showPreview: true,
  activeColor: 'var(--dsw-alias-state-info-primary, #4a90d9)',
  idleColor: 'var(--dsw-alias-label-tertiary, #999)',
  barWidthActive: 6,
  barWidthIdle: 4,
  barHeightActive: 20,
  barHeightIdle: 12,
}

interface MessageItem {
  key: string
  element: HTMLElement
  preview: string
}

function MessageNav() {
  const [config, setConfig] = useState<NavConfig>(DEFAULT_CONFIG)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const messagesRef = useRef<MessageItem[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let current = true
    fetch(`${API_PREFIX}/config`)
      .then(async response => {
        const data = await response.json()
        if (response.ok && current) setConfig({ ...DEFAULT_CONFIG, ...data.config })
      })
      .catch(() => {
        // Keep defaults when the host API is unavailable.
      })
    return () => { current = false }
  }, [])

  useEffect(() => {
    let observer: MutationObserver | undefined
    let disposed = false

    const scan = () => {
      if (disposed) return
      const container = document.querySelector<HTMLElement>('[data-conversation-scroll]')
      containerRef.current = container
      const elements = Array.from(container?.querySelectorAll<HTMLElement>('[data-chat-flow-kind="user"]') ?? [])
      setMessages(elements.map((element, index) => {
        const raw = element.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        return {
          key: element.getAttribute('data-chat-flow-key') ?? `user-${index}`,
          element,
          preview: raw.length > config.previewMaxLength ? `${raw.slice(0, config.previewMaxLength)}…` : raw,
        }
      }))
    }

    const updateActive = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const container = containerRef.current
        if (!container) return
        const viewTop = container.getBoundingClientRect().top + 80
        let current: string | null = null
        for (const message of messagesRef.current) {
          const rect = message.element.getBoundingClientRect()
          if (rect.top <= viewTop) current = message.key
          else break
        }
        setActiveKey(current ?? messagesRef.current[0]?.key ?? null)
        if (config.autoLoadOlder && container.scrollTop <= config.autoLoadThreshold) {
          const olderButton = container.querySelector<HTMLButtonElement>('[class*="older"] button')
          if (olderButton !== null && !olderButton.disabled) olderButton.click()
        }
      })
    }

    scan()
    observer = new MutationObserver(() => {
      scan()
      updateActive()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const container = containerRef.current
    container?.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)

    return () => {
      disposed = true
      observer?.disconnect()
      container?.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [config])

  messagesRef.current = messages

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const update = () => {
      const viewTop = container.getBoundingClientRect().top + 80
      let current: string | null = null
      for (const message of messages) {
        const rect = message.element.getBoundingClientRect()
        if (rect.top <= viewTop) current = message.key
        else break
      }
      setActiveKey(current ?? messages[0]?.key ?? null)
    }
    update()
    if (config.autoLoadOlder && container.scrollTop <= config.autoLoadThreshold) {
      const olderButton = container.querySelector<HTMLButtonElement>('[class*="older"] button')
      if (olderButton !== null && !olderButton.disabled) olderButton.click()
    }
  }, [messages, config])

  function jump(key: string) {
    const message = messages.find(candidate => candidate.key === key)
    message?.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveKey(key)
  }

  if (messages.length === 0) return null

  const isRight = config.position === 'right'
  const tooltipStyle: React.CSSProperties = isRight
    ? { right: 'calc(100% + 8px)' }
    : { left: 'calc(100% + 8px)' }

  const bars = messages.map(message => {
    const active = message.key === activeKey
    const hovered = hoverKey === message.key
    const bar = React.createElement('button', {
      type: 'button',
      'aria-label': message.preview || '用户消息',
      onClick: () => jump(message.key),
      onMouseEnter: () => setHoverKey(message.key),
      onMouseLeave: () => setHoverKey(null),
      style: {
        width: active ? config.barWidthActive : config.barWidthIdle,
        height: active ? config.barHeightActive : config.barHeightIdle,
        borderRadius: 3,
        border: 'none',
        background: active ? config.activeColor : config.idleColor,
        cursor: 'pointer',
        padding: 0,
        transition: 'width .15s ease, height .15s ease, background .15s ease',
      },
    })
    const tooltip = hovered && config.showPreview
      ? React.createElement('div', {
        style: {
          position: 'absolute',
          ...tooltipStyle,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--dsw-specific-input-major, #fff)',
          border: '1px solid var(--dsw-alias-border-primary, #e5e5e5)',
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 12,
          color: 'var(--dsw-alias-label-primary)',
          boxShadow: 'var(--dsw-shadow-lv2, 0 2px 12px rgba(0,0,0,.12))',
          whiteSpace: 'nowrap',
          maxWidth: 260,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none',
          zIndex: 50,
        },
      }, message.preview || '（空消息）')
      : null
    return React.createElement('div', {
      key: message.key,
      style: { position: 'relative', display: 'flex', justifyContent: 'center' },
    }, bar, tooltip)
  })

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        ...(isRight ? { right: 8 } : { left: 8 }),
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 30,
        padding: 6,
        borderRadius: 10,
        background: 'var(--dsw-specific-input-major, rgba(255,255,255,.9))',
        boxShadow: 'var(--dsw-shadow-lv2, 0 2px 12px rgba(0,0,0,.12))',
        pointerEvents: 'auto',
      },
    },
    bars,
  )
}

export function apply(ctx: any): void {
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register({
      name: 'shell.overlay',
      id: '@dsh-external/ui-message-nav-rail',
      order: 120,
    }, MessageNav),
  )
}
