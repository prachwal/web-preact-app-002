import { cleanup } from '@testing-library/preact'
import { afterEach, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as axeMatchers from 'vitest-axe/matchers'

// vitest-axe's own extend-expect entry point ships empty in this version —
// register the matcher directly instead.
expect.extend(axeMatchers)

afterEach(cleanup)
