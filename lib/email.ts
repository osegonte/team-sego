import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface InviteEmailParams {
  to: string
  inviterName: string
  workspaceName: string
  role: string
  inviteUrl: string
  expiresAt: string
}

export async function sendInviteEmail({
  to,
  inviterName,
  workspaceName,
  role,
  inviteUrl,
  expiresAt,
}: InviteEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Team Sego <onboarding@resend.dev>', // Use resend.dev domain for testing
      to: [to],
      subject: `You've been invited to join ${workspaceName} on Team Sego`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #24292f; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefaf5;">
            
            <div style="background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 600; color: #0969da;">
                  Team Sego
                </h1>
                <p style="margin: 0; font-size: 14px; color: #8c959f;">
                  Project Scaffolding Platform
                </p>
              </div>

              <!-- Invitation Card -->
              <div style="background: #f6f8fa; border-radius: 12px; padding: 32px; margin-bottom: 32px; border-left: 4px solid #0969da;">
                <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #24292f;">
                  You've been invited! 🎉
                </h2>
                <p style="margin: 0; font-size: 16px; color: #57606a; line-height: 1.6;">
                  <strong>${inviterName}</strong> has invited you to join <strong style="color: #0969da;">${workspaceName}</strong> on Team Sego.
                </p>
              </div>

              <!-- Details Table -->
              <div style="margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d0d7de;">
                      <strong style="color: #24292f;">Workspace:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d0d7de; text-align: right; color: #57606a;">
                      ${workspaceName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d0d7de;">
                      <strong style="color: #24292f;">Your Role:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #d0d7de; text-align: right; color: #57606a; text-transform: capitalize;">
                      ${role}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <strong style="color: #24292f;">Expires:</strong>
                    </td>
                    <td style="padding: 12px 0; text-align: right; color: #57606a;">
                      ${new Date(expiresAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${inviteUrl}" 
                   style="background-color: #0969da; color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 1px 3px rgba(9, 105, 218, 0.3);">
                  Accept Invitation
                </a>
              </div>

              <!-- Alternative Link -->
              <div style="background: #f6f8fa; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="font-size: 13px; color: #57606a; text-align: center; margin: 0 0 8px 0;">
                  Or copy and paste this link in your browser:
                </p>
                <p style="margin: 0; text-align: center;">
                  <code style="background: white; padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #0969da; border: 1px solid #d0d7de; word-break: break-all; display: inline-block; max-width: 100%;">${inviteUrl}</code>
                </p>
              </div>

              <!-- Role Descriptions -->
              <div style="background: #fff8c5; border-left: 4px solid #bf8700; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #57606a;">
                  <strong style="color: #24292f;">About the ${role} role:</strong><br/>
                  ${role === 'owner' ? '• Full access including workspace deletion<br/>• Can manage all members and settings' : 
                    role === 'admin' ? '• Can manage members and settings<br/>• Can invite and remove members' :
                    role === 'editor' ? '• Can create and edit projects<br/>• Cannot manage members or settings' :
                    '• Can only view projects<br/>• Cannot edit or manage anything'}
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding: 20px;">
              <p style="font-size: 13px; color: #8c959f; margin: 0 0 8px 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="font-size: 13px; color: #8c959f; margin: 0;">
                This invitation will expire in 7 days.
              </p>
            </div>

          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { error: error.message }
    }

    console.log('✅ Invite email sent successfully:', { to, messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('❌ Email sending error:', error)
    return { error: error.message || 'Failed to send email' }
  }
}