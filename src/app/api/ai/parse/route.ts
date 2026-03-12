import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const API_KEY = process.env.GEMINI_API_KEY

    // If no API key is provided, we use a robust mockup for demonstration purposes
    if (!API_KEY) {
      console.warn('No GEMINI_API_KEY found. Using fallback mock parsing.')
      
      // Simple mockup logic
      const sentences = text.split(/(?<=[.?!;])\s+/).filter((s: string) => s.length > 5)
      const tasks = sentences.map((s: string, i: number) => ({
        title: s.replace(/^[-*]\s*/, '').trim(),
        duration_min: Math.max(15, Math.ceil((s.length / 50) * 15)), // arbitrary mockup logic
        priority: (i === 0 ? 1 : i === 1 ? 2 : 3) as 1|2|3,
        energy: (i === 0 ? 'high' : 'medium') as 'high'|'medium'|'low'
      })).slice(0, 5)

      if (tasks.length === 0) {
        tasks.push({
          title: text.trim(),
          duration_min: 30,
          priority: 2,
          energy: 'medium'
        })
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      return NextResponse.json({ tasks })
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "Você é um assistente de produtividade especializado em analisar 'brain dumps' (despejo mental) e transformar isso em tarefas estruturadas e práticas. Quebre pedidos grandes em até 7 subtarefas. A duration_min deve ser múltiplos de 5 (min 5, padrão 30). Priority: 1 alta, 2 média, 3 baixa. Energy: high (mentalmente exigente), medium (operacional), low (simples/rápida). Retorne EXATAMENTE UM JSON com o shape: { \"tasks\": [ { \"title\": \"string\", \"duration_min\": number, \"priority\": number, \"energy\": \"string\" } ] }. Não inclua marcação markdown como ```json."
            }]
          },
          contents: [{ parts: [{ text: text }] }]
        })
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from Gemini')
    }

    const responseText = data.candidates[0].content.parts[0].text
    
    // Clean potential markdown just in case
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    
    const parsed = JSON.parse(cleanJson)
    
    return NextResponse.json(parsed)

  } catch (error: any) {
    console.error('AI Parse Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
