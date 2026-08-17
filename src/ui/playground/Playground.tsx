import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import { Badge } from '@ui/atoms/Badge'
import { Box } from '@ui/atoms/Box'
import { Checkbox } from '@ui/atoms/Checkbox'
import { Container } from '@ui/atoms/Container'
import { Divider } from '@ui/atoms/Divider'
import { Grid } from '@ui/atoms/Grid'
import { Input } from '@ui/atoms/Input'
import { Select } from '@ui/atoms/Select'
import { Switch } from '@ui/atoms/Switch'
import { Textarea } from '@ui/atoms/Textarea'
import { Button } from '@ui/molecules/Button'
import { Popover } from '@ui/molecules/Popover'
import { Stack } from '@ui/molecules/Stack'
import { Tooltip } from '@ui/molecules/Tooltip'
import { Text } from '@ui/atoms/Text'
import { Field } from '@ui/organisms/Field'
import { ThemeProvider } from '@ui/theme/ThemeProvider'
import type { ThemeMode } from '@ui/theme/theme.types'
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
  const [checked, setChecked] = useState(false)
  const [notify, setNotify] = useState(true)

  return (
    <ThemeProvider theme={theme}>
      <Box className={styles.page}>
        <Stack direction="row" justify="between" align="center" className={styles.header}>
          <Text as="h1" size="lg" weight="bold">
            Component gallery
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

        <Section title="Form controls (NORMAL)">
          <Stack gap={4}>
            <Field label="Email" hint="We'll never share it">
              <Input placeholder="you@example.com" />
            </Field>
            <Field label="Bio" error="Required">
              <Textarea rows={3} placeholder="A short bio…" />
            </Field>
            <Field label="Team">
              <Select
                options={[
                  { value: 'design', label: 'Design' },
                  { value: 'eng', label: 'Engineering' },
                ]}
              />
            </Field>
            <Stack direction="row" gap={3} align="center">
              <Checkbox
                aria-label="Accept terms"
                checked={checked}
                onCheckedChange={setChecked}
              />
              <Text size="sm">Accept terms</Text>
            </Stack>
            <Stack direction="row" gap={3} align="center">
              <Switch aria-label="Notifications" checked={notify} onCheckedChange={setNotify} />
              <Text size="sm">Notifications {notify ? 'on' : 'off'}</Text>
            </Stack>
          </Stack>
        </Section>

        <Section title="Layout primitives (NORMAL)">
          <Stack gap={4}>
            <Grid columns={4} gap={2}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} class={styles.swatch} />
              ))}
            </Grid>
            <Divider />
            <Container width="sm" className={styles.containerDemo}>
              <div class={styles.swatch} />
            </Container>
          </Stack>
        </Section>

        <Section title="Overlays (NORMAL)">
          <Stack direction="row" gap={6} align="center">
            <Tooltip content="A helpful hint">
              <Button size="sm" tone="neutral">
                Hover or focus me
              </Button>
            </Tooltip>
            <Popover trigger={<Button size="sm">Open popover</Button>}>
              <Text size="sm">Popover content — Tab traps focus, click outside or Escape closes.</Text>
            </Popover>
          </Stack>
        </Section>
      </Box>
    </ThemeProvider>
  )
}
