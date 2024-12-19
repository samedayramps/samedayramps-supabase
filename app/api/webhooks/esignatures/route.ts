import { getServiceSupabase } from "@/lib/supabase/service-role"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const headersList = await headers()
    const secret_token = headersList.get("secret-token")

    // Verify webhook authenticity
    if (secret_token !== process.env.ESIGNATURES_API_TOKEN) {
      return new Response("Unauthorized", { status: 401 })
    }

    const supabase = getServiceSupabase()

    // Handle different webhook events
    switch (body.status) {
      case "signer-viewed-the-contract":
        await supabase
          .from("rental_agreements")
          .update({
            status: "viewed",
            viewed_at: new Date().toISOString()
          })
          .eq("contract_id", body.data.contract.id)
        break

      case "signer-signed":
        await supabase
          .from("rental_agreements")
          .update({
            status: "signed",
            signed_at: new Date().toISOString()
          })
          .eq("contract_id", body.data.contract.id)

        // Get job ID to revalidate the page
        const { data: agreement } = await supabase
          .from("rental_agreements")
          .select("job_id")
          .eq("contract_id", body.data.contract.id)
          .single()

        if (agreement?.job_id) {
          revalidatePath(`/admin/jobs/${agreement.job_id}`)
        }
        break

      case "contract-withdrawn":
        await supabase
          .from("rental_agreements")
          .update({
            status: "withdrawn"
          })
          .eq("contract_id", body.data.contract.id)
        break

      case "error":
        console.error("eSignatures webhook error:", body.data)
        // You might want to store or handle errors differently
        break
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 