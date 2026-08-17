/**
 * @dsh-external/ui-message-nav — host half.
 * Serves the standalone message navigation configuration to the browser UI.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from 'cordis'
import z from 'schemastery'

export const name = '@dsh-external/ui-message-nav'
export const inject = ['webServer']

export interface Config {
  /** Side of the conversation view the rail attaches to. */
  position: 'left' | 'right'
  /** Maximum characters shown in the hover preview. */
  previewMaxLength: number
  /** Whether scrolling to the top automatically loads older messages. */
  autoLoadOlder: boolean
  /** Scroll top threshold in px that triggers auto-load-older. */
  autoLoadThreshold: number
  /** Whether hover previews are enabled. */
  showPreview: boolean
  /** Highlight color for the active message bar. */
  activeColor: string
  /** Idle color for non-active message bars. */
  idleColor: string
  /** Active bar width in px. */
  barWidthActive: number
  /** Idle bar width in px. */
  barWidthIdle: number
  /** Active bar height in px. */
  barHeightActive: number
  /** Idle bar height in px. */
  barHeightIdle: number
}

export const Config = z.object({
  position: z.union([z.const('left'), z.const('right')]).default('right'),
  previewMaxLength: z.natural().default(60),
  autoLoadOlder: z.boolean().default(true),
  autoLoadThreshold: z.natural().default(40),
  showPreview: z.boolean().default(true),
  activeColor: z.string().default('var(--dsw-alias-state-info-primary, #4a90d9)'),
  idleColor: z.string().default('var(--dsw-alias-label-tertiary, #999)'),
  barWidthActive: z.natural().default(6),
  barWidthIdle: z.natural().default(4),
  barHeightActive: z.natural().default(20),
  barHeightIdle: z.natural().default(12),
})

function sendJson(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(value))
}

export function apply(ctx: Context, config: Config): void {
  ctx.effect(() => (ctx as any).webServer.register({
    kind: 'prefix',
    path: '/@dsh-external/ui-message-nav/api',
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      const pathname = new URL(req.url ?? '/', 'http://x').pathname
      if (req.method === 'GET' && pathname === '/@dsh-external/ui-message-nav/api/config') {
        sendJson(res, 200, { config })
        return
      }
      if (req.method === 'GET' && pathname === '/@dsh-external/ui-message-nav/api/status') {
        sendJson(res, 200, { ok: true, name: '@dsh-external/ui-message-nav' })
        return
      }
      sendJson(res, 404, { error: 'not found' })
    },
  }), '@dsh-external/ui-message-nav: api')
}
