import { forwardRef } from 'preact/compat'
import { cx } from '../../utils/cx'
import { variant } from '../../utils/variant'
import styles from './Text.module.scss'
import type { TextProps } from './Text.types'

const textVariant = variant({
  base: 'text',
  variants: {
    size: { sm: 'text--size-sm', md: 'text--size-md', lg: 'text--size-lg' },
    weight: {
      regular: 'text--weight-regular',
      medium: 'text--weight-medium',
      bold: 'text--weight-bold',
    },
    tone: {
      fg: 'text--tone-fg',
      'fg-muted': 'text--tone-fg-muted',
      danger: 'text--tone-danger',
    },
  },
  defaultVariants: { size: 'md', weight: 'regular', tone: 'fg' },
})

/** Typography primitive. Renders a `<span>` by default. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Component = 'span', size, weight, tone, className, ...rest },
  ref,
) {
  // `as` makes the JSX tag dynamic — TS can't narrow the resulting
  // intrinsic-element union, so this one boundary is intentionally untyped.
  const Tag = Component as any
  return (
    <Tag
      ref={ref}
      class={cx(textVariant(styles, { size, weight, tone }), className)}
      {...rest}
    />
  )
})
