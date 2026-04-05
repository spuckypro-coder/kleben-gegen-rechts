/**
 * Shared HTML email template — matches klebengegenrechts.de design.
 * Uses inline styles only (email client compatibility).
 */
export function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#111111;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111111;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Outer card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#000000;border:1px solid #222222;">

          <!-- HEADER -->
          <tr>
            <td style="background:#000000;padding:0;">
              <!-- Red top bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#cc0000;height:4px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <!-- Logo row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 24px 32px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <!-- Logo text -->
                          <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:3px;text-transform:uppercase;line-height:1;">
                            <span style="color:#ffffff;">KLEBEN&nbsp;</span><span style="color:#f97316;">GEGEN</span><span style="color:#ffffff;">&nbsp;RECHTS</span>
                          </p>
                          <p style="margin:6px 0 0 0;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:2px;">Kunst ist Widerstand</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#1a1a1a;height:1px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:36px 32px;color:#e0e0e0;font-size:15px;line-height:1.8;">
              ${content}
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#1a1a1a;height:1px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 32px 28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 8px 0;font-size:11px;color:#444444;text-transform:uppercase;letter-spacing:1px;">
                      Kleben Gegen Rechts · <a href="https://www.klebengegenrechts.de" style="color:#444444;text-decoration:none;">klebengegenrechts.de</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#333333;">
                      Du erhältst diese E-Mail, weil du den Newsletter abonniert hast. &nbsp;·&nbsp;
                      <a href="https://www.klebengegenrechts.de/newsletter/abmelden" style="color:#cc0000;text-decoration:none;">Abmelden</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Red bottom bar -->
          <tr>
            <td style="background:#cc0000;height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
        <!-- /outer card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/** Red CTA button for emails */
export function emailButton(label: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="background:#cc0000;">
          <a href="${url}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>
  `;
}
