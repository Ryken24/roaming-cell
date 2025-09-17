// Netlify serverless function to forward lead form submissions to HubSpot Forms API
import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN
    const formId = process.env.HUBSPOT_FORM_ID
    if (!token || !formId) {
      return { statusCode: 500, body: 'Server misconfiguration' }
    }

    const body = JSON.parse(event.body || '{}') as Record<string, string>
    const submittedAt = Date.now()

    const payload = {
      submittedAt,
      fields: Object.entries(body).map(([name, value]) => ({ name, value })),
      context: {
        pageUri: event.headers.referer || '',
        pageName: 'Hotspot Optimizer — Demo Request',
        hutk: event.headers.cookie?.match(/hubspotutk=([^;]+)/)?.[1]
      }
    }

    const res = await fetch(`https://api.hubapi.com/marketing/v3/forms/${formId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('HubSpot error', res.status, text)
      return { statusCode: 502, body: 'HubSpot submission failed' }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (e: any) {
    console.error('Lead submission error', e)
    return { statusCode: 500, body: 'Unexpected error' }
  }
}