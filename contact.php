<?php
/**
 * AlphaStack contact form handler
 *
 * Sends via authenticated SMTP (PHPMailer) through GoDaddy's own mail
 * server, using the info@alphastack.in mailbox. Plain PHP mail() was tried
 * first, but alphastack.in's SPF ("-all") and DMARC ("p=reject") policies
 * only authorize secureserver.net to send as this domain — mail() sends
 * from the shared web-hosting server instead, so it was silently rejected
 * downstream even though mail() itself reported success.
 */

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

// ── CONFIG ──────────────────────────────────────────────
$recipientEmail = "info@alphastack.in";
$siteName       = "AlphaStack";
$allowedOrigin  = "https://alphastack.in";
$mailConfigFile = __DIR__ . '/mail-config.php';
// ────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Method not allowed"]);
    exit;
}

header("Access-Control-Allow-Origin: $allowedOrigin");
header("Content-Type: application/json");

// Frontend sends JSON (fetch with Content-Type: application/json), not form-encoded data
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = [];
}

// Honeypot check — bots fill hidden fields, humans don't (field name: "website")
if (!empty($data['website'])) {
    echo json_encode(["ok" => true]);
    exit;
}

function clean($value) {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

$name     = clean($data['name'] ?? '');
$company  = clean($data['company'] ?? '');
$email    = clean($data['email'] ?? '');
$interest = clean($data['interest'] ?? '');
$message  = clean($data['message'] ?? '');

$errors = [];

if ($name === '' || strlen($name) < 2) {
    $errors[] = "Name is required.";
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "A valid email is required.";
}

$allowedInterests = ["SignalFlow", "Trade Boost", "Custom"];
if ($interest !== '' && !in_array($interest, $allowedInterests, true)) {
    $errors[] = "Invalid interest value.";
}

if ($message === '' || strlen($message) < 5) {
    $errors[] = "Message is too short.";
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => implode(" ", $errors)]);
    exit;
}

if (!file_exists($mailConfigFile)) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Mail is not configured on the server yet. Please email us directly."]);
    exit;
}
$mailConfig = require $mailConfigFile;

$subject = "$siteName — New enquiry from $name" . ($interest ? " ($interest)" : "");

$body  = "New contact form submission on $siteName\n\n";
$body .= "Name:      $name\n";
$body .= "Company:   " . ($company !== '' ? $company : '—') . "\n";
$body .= "Email:     $email\n";
$body .= "Interest:  " . ($interest !== '' ? $interest : '—') . "\n";
$body .= "Message:\n$message\n\n";
$body .= "---\nSent: " . date('Y-m-d H:i:s') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $mailConfig['host'];
    $mail->Port       = $mailConfig['port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $mailConfig['username'];
    $mail->Password   = $mailConfig['password'];
    $mail->SMTPSecure = $mailConfig['encryption']; // 'ssl' (port 465) or 'tls' (port 587)

    $mail->setFrom($mailConfig['username'], $siteName);
    $mail->addAddress($recipientEmail);
    $mail->addReplyTo($email, $name !== '' ? $name : $email);

    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();
    echo json_encode(["ok" => true]);
} catch (PHPMailerException $e) {
    error_log("Contact form mail failed: " . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Message could not be sent. Please try again or email us directly."]);
}
