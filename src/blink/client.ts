import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'travel-buddy-ai-ki85gite',
  authRequired: true
})

export default blink