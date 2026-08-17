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
import { Combobox } from '@ui/organisms/Combobox'
import { Dialog } from '@ui/organisms/Dialog'
import { Field } from '@ui/organisms/Field'
import { Menu } from '@ui/organisms/Menu'
import { Tabs } from '@ui/organisms/Tabs'
import { ToastViewport, toast } from '@ui/organisms/Toast'
import { ThemeProvider } from '@ui/theme/ThemeProvider'
import type { ThemeMode } from '@ui/theme/theme.types'
import { cx } from '@ui/utils/cx'
import styles from './Playground.module.scss'

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
]

const tones = ['neutral', 'accent', 'danger'] as const
const sizes = ['sm', 'md', 'lg'] as const
const badgeTones = ['neutral', 'accent', 'success', 'warning', 'danger'] as const

// One Section per component (not grouped by tier) so each one is a stable,
// independent target for both a human scanning the page and the
// per-component visual-regression tests in e2e/components.spec.ts.
function Section({
  title,
  overlay,
  children,
}: {
  title: string
  // Cards whose open state is a floating overlay (Tooltip, Popover, Menu,
  // Combobox) get extra margin-bottom so the panel doesn't visually
  // overlap the next card — see .section--overlay in Playground.module.scss.
  overlay?: boolean
  children: ComponentChildren
}) {
  return (
    <Box
      as="section"
      className={cx(styles.section, overlay && styles['section--overlay'])}
      data-component={title}
    >
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
      <Box as="main" className={styles.page}>
        <Stack direction="row" justify="between" align="center" className={styles.header}>
          <Text as="h1" size="lg" weight="bold" className={styles.pageTitle}>
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

        <Section title="Box">
          <Stack direction="row" gap={3} align="center">
            <Box as="span" className={styles.boxDemo}>
              as=&quot;span&quot;
            </Box>
            <Box as="div" className={styles.boxDemo}>
              as=&quot;div&quot;
            </Box>
            <Box as="a" href="#box" className={styles.boxDemo}>
              as=&quot;a&quot;
            </Box>
          </Stack>
        </Section>

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

        <Section title="Badge">
          <Stack direction="row" gap={3} align="center">
            {badgeTones.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
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

        <Section title="Grid">
          <Grid columns={4} gap={2}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} class={styles.swatch} />
            ))}
          </Grid>
        </Section>

        <Section title="Container">
          <Container width="sm" className={styles.containerDemo}>
            <div class={styles.swatch} />
          </Container>
        </Section>

        <Section title="Divider">
          <Stack gap={3}>
            <Text size="sm">Above</Text>
            <Divider />
            <Text size="sm">Below</Text>
          </Stack>
        </Section>

        <Section title="Field">
          <Field label="Email" hint="We'll never share it">
            <Input placeholder="you@example.com" />
          </Field>
        </Section>

        <Section title="Input">
          <Stack gap={3}>
            <Input placeholder="Default" />
            <Input invalid placeholder="Invalid" />
            <Input disabled placeholder="Disabled" />
          </Stack>
        </Section>

        <Section title="Textarea">
          <Textarea rows={3} placeholder="A short bio…" />
        </Section>

        <Section title="Select">
          <Select
            aria-label="Team"
            placeholder="Select a team…"
            options={[
              { value: 'design', label: 'Design' },
              { value: 'eng', label: 'Engineering' },
            ]}
          />
        </Section>

        <Section title="Checkbox">
          <Stack direction="row" gap={3} align="center">
            <Checkbox aria-label="Accept terms" checked={checked} onCheckedChange={setChecked} />
            <Text size="sm">Accept terms</Text>
          </Stack>
        </Section>

        <Section title="Switch">
          <Stack direction="row" gap={3} align="center">
            <Switch aria-label="Notifications" checked={notify} onCheckedChange={setNotify} />
            <Text size="sm">Notifications {notify ? 'on' : 'off'}</Text>
          </Stack>
        </Section>

        <Section title="Tooltip" overlay>
          <Tooltip content="A helpful hint">
            <Button size="sm" tone="neutral">
              Hover or focus me
            </Button>
          </Tooltip>
        </Section>

        <Section title="Popover" overlay>
          <Popover trigger={<Button size="sm">Open popover</Button>}>
            <Text size="sm">Popover content — Tab traps focus, click outside or Escape closes.</Text>
          </Popover>
        </Section>

        <Section title="Tabs">
          <Tabs.Root defaultValue="account">
            <Tabs.List>
              <Tabs.Trigger value="account">Account</Tabs.Trigger>
              <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
              <Tabs.Trigger value="disabled" disabled>
                Disabled
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="account">
              <Text size="sm">Account settings panel.</Text>
            </Tabs.Panel>
            <Tabs.Panel value="billing">
              <Text size="sm">Billing panel — arrow keys move between tabs.</Text>
            </Tabs.Panel>
          </Tabs.Root>
        </Section>

        <Section title="Dialog">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button size="sm">Open dialog</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Close />
              <Dialog.Title>Delete item?</Dialog.Title>
              <Text size="sm" tone="fg-muted">
                This can't be undone. Focus is trapped here — try Tab.
              </Text>
              <Stack direction="row" gap={2} className={styles.dialogActions}>
                <Button size="sm" tone="danger">
                  Delete
                </Button>
              </Stack>
            </Dialog.Content>
          </Dialog.Root>
        </Section>

        <Section title="Menu" overlay>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button size="sm" tone="neutral">
                Actions ▾
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item onSelect={() => toast.show({ title: 'Renamed', type: 'success' })}>
                Rename
              </Menu.Item>
              <Menu.Item onSelect={() => toast.show({ title: 'Duplicated' })}>Duplicate</Menu.Item>
              <Menu.Item disabled>Archive (disabled)</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Section>

        <Section title="Combobox" overlay>
          <Combobox options={fruitOptions} aria-label="Favorite fruit" placeholder="Type to filter…" />
        </Section>

        <Section title="Toast">
          <Button
            size="sm"
            onClick={() =>
              toast.show({
                title: 'Saved',
                description: 'Your changes were saved.',
                type: 'info',
              })
            }
          >
            Fire a toast
          </Button>
        </Section>
      </Box>

      <ToastViewport />
    </ThemeProvider>
  )
}
