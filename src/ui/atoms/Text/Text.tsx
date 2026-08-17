import { forwardRef } from 'preact/compat'
import { cx } from '@ui/utils/cx'
import { asPolymorphic } from '@ui/utils/polymorphic'
import { variant } from '@ui/utils/variant'
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
  { as: tag = 'span', size, weight, tone, className, ...rest },
  ref,
) {
  const Tag = asPolymorphic(tag)
  return (
    <Tag
      ref={ref}
      class={cx(textVariant(styles, { size, weight, tone }), className)}
      {...rest}
    />
  )
})
