// BASIC-tier variant() — a CVA-shaped helper with zero dependency. Class
// names in `config` are the plain BEM names from the naming convention
// (e.g. 'button--tone-accent'); `styles` is the CSS-module export for the
// component, used to resolve those names to their (possibly hashed) output.

type VariantMap = Record<string, Record<string, string>>
type StylesMap = Record<string, string>

interface VariantConfig<V extends VariantMap> {
  base?: string
  variants: V
  defaultVariants?: { [K in keyof V]?: keyof V[K] }
}

export type VariantProps<V extends VariantMap> = { [K in keyof V]?: keyof V[K] }

export function variant<V extends VariantMap>(config: VariantConfig<V>) {
  return (styles: StylesMap, props: VariantProps<V> = {}): string => {
    const resolve = (name: string) => styles[name] ?? name
    const classes = config.base ? [resolve(config.base)] : []

    for (const key in config.variants) {
      const chosen = props[key] ?? config.defaultVariants?.[key]
      if (chosen != null) classes.push(resolve(config.variants[key][chosen as string]))
    }

    return classes.filter(Boolean).join(' ')
  }
}
