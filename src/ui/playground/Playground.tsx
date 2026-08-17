import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import { Badge } from '../components/Badge'
import { Box } from '../components/Box'
import { Button } from '../components/Button'
import { Stack } from '../components/Stack'
import { Text } from '../components/Text'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { ThemeMode } from '../theme/theme.types'
import styles from './Playground.module.scss'

const tones = ['neutral', 'accent', 'danger'] as const
const sizes = ['sm', 'md', 'lg'] as const
const badgeTones = ['neutral', 'accent', 'success', 'warning', 'danger'] as const

function Section({ title, children }: { title: string; children: ComponentChildren }) {
  return (
    <Box as="section" className={styles.section}>
      <Text as="h2" size="lg" weight="bold" className={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </Box>
  )
}

export function Playground() {
  const [theme, setTheme] = useState<ThemeMode>('system')
  const [loading, setLoading] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <Box className={styles.page}>
        <Stack direction="row" justify="between" align="center" className={styles.header}>
          <Text as="h1" size="lg" weight="bold">
            BASIC component gallery
          </Text>
          <Stack direction="row" gap={2}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <Button
                key={mode}
                size="sm"
                tone={theme === mode ? 'accent' : 'neutral'}
                onClick={() => setTheme(mode)}
              >
                {mode}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Section title="Text">
          <Stack gap={2}>
            <Text size="lg" weight="bold">
              Large bold text
            </Text>
            <Text size="md">Medium regular text</Text>
            <Text size="sm" tone="fg-muted">
              Small muted text
            </Text>
            <Text tone="danger">Danger tone text</Text>
          </Stack>
        </Section>

        <Section title="Button">
          <Stack gap={4}>
            <Stack direction="row" gap={3} align="center">
              {tones.map((tone) => (
                <Button key={tone} tone={tone}>
                  {tone}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" gap={3} align="center">
              {sizes.map((size) => (
                <Button key={size} size={size}>
                  size {size}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" gap={3} align="center">
              <Button disabled>disabled</Button>
              <Button loading={loading} onClick={() => setLoading((v) => !v)}>
                {loading ? 'loading…' : 'toggle loading'}
              </Button>
            </Stack>
          </Stack>
        </Section>

        <Section title="Badge">
          <Stack direction="row" gap={3} align="center">
            {badgeTones.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </Stack>
        </Section>

        <Section title="Stack">
          <Stack gap={3}>
            <Stack direction="row" gap={2} className={styles.swatchRow}>
              <div class={styles.swatch} />
              <div class={styles.swatch} />
              <div class={styles.swatch} />
            </Stack>
            <Stack direction="row" justify="between" className={styles.swatchRow}>
              <div class={styles.swatch} />
              <div class={styles.swatch} />
            </Stack>
          </Stack>
        </Section>
      </Box>
    </ThemeProvider>
  )
}
