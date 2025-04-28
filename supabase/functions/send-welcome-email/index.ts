
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WelcomeEmailRequest = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending welcome email to ${email} for user ${name}`);

    const emailResponse = await resend.emails.send({
      from: "Trading Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to our Trading Platform!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #3B82F6; margin-bottom: 20px;">Welcome to our Trading Platform, ${name}!</h1>
          
          <p style="margin-bottom: 15px;">Thank you for joining our platform. We're excited to help you on your trading journey!</p>
          
          <p style="margin-bottom: 15px;">With our platform, you can:</p>
          
          <ul style="margin-bottom: 20px;">
            <li>Track real-time market data across cryptocurrencies, stocks, and forex</li>
            <li>Analyze price movements with advanced charts</li>
            <li>Build and manage your investment portfolio</li>
            <li>Stay informed with the latest financial news</li>
          </ul>
          
          <p style="margin-bottom: 15px;">If you have any questions or need assistance, our support team is always ready to help.</p>
          
          <div style="background-color: #3B82F6; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 15px;">
            <a href="${Deno.env.get("SITE_URL") || "https://yourplatform.com"}/dashboard" style="color: white; text-decoration: none;">Go to Dashboard</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Best regards,<br>
            The Trading Platform Team
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
