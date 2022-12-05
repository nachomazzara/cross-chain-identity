import { VercelRequest, VercelResponse } from '@vercel/node'

const fetch = require('node-fetch')

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { url } = request.query
  try {
    const res = await fetch(url as string, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': 'http::/localhost:3000',
      },
    })
    const data = await res.json()
    response.status(200).json(data)
  } catch (e) {
    return response.status(502).json(`Failed to fetch ${url}: ${e.message}`)
  }
}