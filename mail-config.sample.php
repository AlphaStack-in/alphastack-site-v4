<?php
/**
 * Copy this file to mail-config.php on the server (same folder) and fill in
 * the real mailbox password there. mail-config.php is gitignored — it must
 * never be committed, and the password should never be sent through chat/AI.
 *
 * These are GoDaddy's standard Workspace Email SMTP settings (the ones
 * matching alphastack.in's MX records, smtp.secureserver.net). If GoDaddy's
 * own docs show different values for your account, use those instead.
 */
return [
    'host'       => 'smtpout.secureserver.net',
    'port'       => 465,      // 465 = implicit SSL, 587 = STARTTLS
    'encryption' => 'ssl',    // 'ssl' for port 465, 'tls' for port 587
    'username'   => 'info@alphastack.in',
    'password'   => 'REPLACE_WITH_MAILBOX_PASSWORD',
];
