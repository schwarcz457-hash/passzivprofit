import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const rawData = await req.json();
    const { name, email, lang, type } = rawData;
    const referer = req.headers.get("referer") || "";
    
    const cleanType = typeof type === "string" ? type.trim().toLowerCase() : "";
    const cleanEmail = typeof email === "string" ? email.toLowerCase() : "";
    const cleanReferer = referer.toLowerCase();
    
    let finalType = cleanType;
    if (
      cleanType === "mobile" || 
      cleanReferer.includes("mobilpiac") || 
      cleanEmail.includes("+netfone")
    ) {
      finalType = "mobile";
    }

    const listId = finalType === "mobile" ? 8 : 2;

    console.log(`>>> [API LEAD - ${requestId}] Incoming request absolute diagnostics:
      Email: ${email} (cleanEmail: ${cleanEmail})
      Body Type: ${type} (cleanType: ${cleanType})
      Referer Header: ${referer} (cleanReferer: ${cleanReferer})
      Final Resolved Type: ${finalType}
      Target Brevo List ID: ${listId}
    `, JSON.stringify(rawData, null, 2));

    const validLocales = ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'];
    const safeLang = (lang && validLocales.includes(lang.toLowerCase())) ? lang.toUpperCase() : 'EN';
    
    let brevoSuccess = false;
    let resendSuccess = false;

    let brevoResponseData: any = null;
    let resendResponseData: any = null;

    const apiKey = process.env.BREVO_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    const operations: Promise<void>[] = [];

    // 1. Brevo Contact Sync (Wrapped in safety try/catch and won't crash the endpoint)
    if (apiKey) {
      const maskedKey = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`;
      console.log(`>>> [API LEAD - ${requestId}] BREVO_API_KEY is present (Masked: ${maskedKey})`);

      operations.push((async () => {
        try {
          const brevoAttributes: any = {
            FIRSTNAME: name || "Érdeklődő",
            LANG: safeLang || "EN",
            REQUEST_ID: requestId || "unknown",
          };

          // listId is resolved defensively at the top level of the POST function

          const brevoPayload: any = {
            email: email,
            listIds: [listId],
            updateEnabled: true,
            attributes: brevoAttributes
          };

          const jsonBody = JSON.stringify(brevoPayload);
          console.log(`>>> [API LEAD - ${requestId}] Brevo Payload (listId: ${listId}):`, JSON.stringify(brevoPayload, null, 2));

          const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": apiKey,
              "content-type": "application/json"
            },
            body: jsonBody
          });

          console.log(`>>> [API LEAD - ${requestId}] Brevo API Status: ${brevoRes.status} ${brevoRes.statusText}`);

          const contentType = brevoRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
             brevoResponseData = await brevoRes.json().catch(() => null);
          }
          
          if (brevoRes.ok) {
            brevoSuccess = true;
            console.log(`>>> [API LEAD - ${requestId}] Brevo Sync SUCCESS`, brevoResponseData ? JSON.stringify(brevoResponseData, null, 2) : "(No body)");
          } else if (
            brevoResponseData?.code === "duplicate_parameter" || 
            (brevoResponseData?.message && brevoResponseData.message.toLowerCase().includes("already exist"))
          ) {
            console.log(`>>> [API LEAD - ${requestId}] Contact already exists in Brevo. Triggering PUT list subscription update for list ${listId}.`);
            
            try {
              const brevoUpdatePayload = {
                listIds: [listId],
                attributes: brevoAttributes
              };
              
              const updateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
                method: "PUT",
                headers: {
                  "accept": "application/json",
                  "api-key": apiKey,
                  "content-type": "application/json"
                },
                body: JSON.stringify(brevoUpdatePayload)
              });

              console.log(`>>> [API LEAD - ${requestId}] Brevo PUT Update Status: ${updateRes.status} ${updateRes.statusText}`);

              let updateResponseData: any = null;
              const updateContentType = updateRes.headers.get("content-type");
              if (updateContentType && updateContentType.includes("application/json")) {
                updateResponseData = await updateRes.json().catch(() => null);
              }

              if (updateRes.ok) {
                brevoSuccess = true;
                console.log(`>>> [API LEAD - ${requestId}] Brevo Contact update and list ${listId} subscription SUCCESS.`);
              } else {
                console.error(`>>> [API LEAD - ${requestId}] Brevo Contact update and list ${listId} subscription FAILED! Status: ${updateRes.status}`, JSON.stringify(updateResponseData, null, 2));
                brevoSuccess = true;
              }
            } catch (updateErr) {
              console.error(`>>> [API LEAD - ${requestId}] Brevo PUT Update Exception:`, updateErr);
              brevoSuccess = true;
            }
          } else {
            // Logs error details but does NOT crash the route or throw an unhandled exception
            console.error(`>>> [API LEAD - ${requestId}] Brevo Sync FAILED! Status: ${brevoRes.status}`);
            console.error(`>>> [API LEAD - ${requestId}] Brevo Error Detail:`, JSON.stringify(brevoResponseData, null, 2));
          }
        } catch (brevoErr) {
          // Soft-catches exception to keep other operations running smoothly
          console.error(`>>> [API LEAD - ${requestId}] Brevo Fetch Exception:`, brevoErr);
          brevoResponseData = { error: String(brevoErr) };
        }
      })());
    } else {
      console.warn(`>>> [API LEAD - ${requestId}] BREVO_API_KEY is missing from environment variables.`);
    }

    // 2. Resend Admin Notification Email
    if (resendApiKey) {
      console.log(`>>> [API LEAD - ${requestId}] RESEND_API_KEY is present, sending admin email.`);
      operations.push((async () => {
        try {
          const isMobile = finalType === "mobile";
          const subject = isMobile
            ? `Új Mobilpiac Érdeklődő: ${name || "Nincs megadva"} [ID:${requestId}]`
            : `Új Arany Érdeklődő: ${name || "Nincs megadva"} [ID:${requestId}]`;

          const emailBody = isMobile
            ? `
              <p>Új érdeklődő érkezett a Passzív Profit Mobil oldalról!</p>
              <p><strong>Név:</strong> ${name || "Nincs megadva"}</p>
              <p><strong>Email:</strong> ${email || "Nincs megadva"}</p>
              <p><strong>Nyelv:</strong> ${safeLang}</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
            `
            : `
              <p>Új érdeklődő érkezett a Passzív Profit Gold oldalról!</p>
              <p><strong>Név:</strong> ${name || "Nincs megadva"}</p>
              <p><strong>Email:</strong> ${email || "Nincs megadva"}</p>
              <p><strong>Nyelv:</strong> ${safeLang}</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
            `;

          const resendPayload = {
            from: "Passzív Profit | Rendszer <system@passzivprofit.com>",
            to: "schwarcz457@gmail.com",
            subject: subject,
            html: emailBody
          };

          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(resendPayload)
          });

          console.log(`>>> [API LEAD - ${requestId}] Resend Status: ${resendRes.status} ${resendRes.statusText}`);
          resendResponseData = await resendRes.json().catch(() => null);

          if (resendRes.ok) {
            resendSuccess = true;
            console.log(`>>> [API LEAD - ${requestId}] Resend Email SUCCESS:`, JSON.stringify(resendResponseData));
          } else {
            console.error(`>>> [API LEAD - ${requestId}] Resend Email FAILED! Detail:`, JSON.stringify(resendResponseData));
          }
        } catch (resendErr) {
          console.error(`>>> [API LEAD - ${requestId}] Resend Email Exception:`, resendErr);
          resendResponseData = { error: String(resendErr) };
        }
      })());
    } else {
      console.warn(`>>> [API LEAD - ${requestId}] RESEND_API_KEY is missing from environment variables.`);
    }

    // Wait for all channels to settle concurrently
    await Promise.allSettled(operations);

    // Return success: true with status details (Brevo and Resend only)
    console.log(`>>> [API LEAD - ${requestId}] Lead submission processed. brevo=${brevoSuccess}, resend=${resendSuccess}`);
    
    return NextResponse.json({ 
      success: true, 
      requestId,
      status: {
        brevo: brevoSuccess,
        resend: resendSuccess
      },
      diagnostics: {
        brevo: brevoResponseData || "Skipped or failed"
      }
    });

  } catch (error) {
    console.error(`[API LEAD - ${requestId}] Critical Route Error:`, error);
    // Returns 200 Success to frontend as a final fallback, so users are never blocked, 
    // but prints the stack trace for admins.
    return NextResponse.json({ 
      success: true, 
      requestId,
      status: {
        brevo: false,
        resend: false
      },
      error: "Service Unavailable (Handled)"
    });
  }
}
