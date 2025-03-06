import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email"

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = subscribeSchema.parse(json)

    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: body.email,
      },
    })

    // Send welcome email
    await sendWelcomeEmail(body.email)

    return NextResponse.json(
      { message: "Subscribed successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "You're already subscribed" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
