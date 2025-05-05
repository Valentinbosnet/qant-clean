import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { TABLES } from "@/lib/db/schema"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: Request) {
  try {
    // Validate authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract the token
    const token = authHeader.substring(7)

    // Verify the token with Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData?.session?.access_token) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get the user from the session
    const userId = sessionData.session.user.id

    // Get request data
    const { symbol, timeframe = "1d", historicalData } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      return NextResponse.json({ error: "Valid historical data is required" }, { status: 400 })
    }

    // Check user's subscription status and API quota
    const { data: userData, error: userError } = await supabase
      .from(TABLES.USERS)
      .select("subscription_tier, api_quota, api_usage")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 })
    }

    // Check if the user has exceeded their API quota
    if (userData.api_usage >= userData.api_quota) {
      return NextResponse.json({ error: "API quota exceeded. Please upgrade your subscription." }, { status: 403 })
    }

    // Format historical data for prediction
    const formattedData = historicalData
      .map(
        (item) =>
          `Date: ${item.date}, Open: ${item.open}, High: ${item.high}, Low: ${item.low}, Close: ${item.close}, Volume: ${item.volume}`,
      )
      .join("\n")

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI service is not configured" }, { status: 500 })
    }

    // Generate AI prediction using OpenAI
    const prompt = `
      You are a stock market analysis AI. Based on the following historical data for ${symbol}, 
      predict the likely market direction over the next ${timeframe === "1d" ? "day" : timeframe === "1w" ? "week" : "month"}.
      
      Historical data:
      ${formattedData}
      
      Provide a JSON response with the following structure:
      {
        "prediction": "up" or "down" or "neutral",
        "confidence": a number between 0 and 1,
        "explanation": "brief explanation of your reasoning",
        "predictedChange": estimated percentage change (positive or negative number)
      }
    `

    // Use the AI SDK to generate the prediction
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.5,
      maxTokens: 500,
    })

    let prediction
    try {
      prediction = JSON.parse(text)
    } catch (e) {
      console.error("Failed to parse AI response:", e)
      return NextResponse.json({ error: "Failed to parse AI prediction" }, { status: 500 })
    }

    // Update user's API usage
    await supabase
      .from(TABLES.USERS)
      .update({ api_usage: userData.api_usage + 1 })
      .eq("id", userId)

    // Save the prediction to the database
    const expiresAt = new Date()
    if (timeframe === "1d") {
      expiresAt.setDate(expiresAt.getDate() + 1)
    } else if (timeframe === "1w") {
      expiresAt.setDate(expiresAt.getDate() + 7)
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    }

    const { data: predictionRecord, error: predictionError } = await supabase
      .from(TABLES.PREDICTIONS)
      .insert({
        user_id: userId,
        symbol,
        prediction_type: "ai",
        prediction_direction: prediction.prediction,
        prediction_value: prediction.predictedChange,
        confidence: prediction.confidence,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "active",
      })
      .select()
      .single()

    if (predictionError) {
      console.error("Failed to save prediction:", predictionError)
    }

    return NextResponse.json({
      success: true,
      prediction: {
        symbol,
        direction: prediction.prediction,
        confidence: prediction.confidence,
        explanation: prediction.explanation,
        predictedChange: prediction.predictedChange,
        timeframe,
        id: predictionRecord?.id,
      },
    })
  } catch (error) {
    console.error("AI prediction error:", error)
    return NextResponse.json({ error: "Failed to generate AI prediction" }, { status: 500 })
  }
}
