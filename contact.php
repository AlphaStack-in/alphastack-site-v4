<?php
/**
 * AlphaStack contact form handler
 * Drop-in replacement for /api/contact.js (Vercel serverless function)
 * Works on any standard cPanel/shared PHP hosting (GoDaddy included)
 */

// ── CONFIG ──────────────────────────────────────────────
$recipientEmail = "info@alphastack.in";
$siteName       = "AlphaStack";
$allowedOrigin  = "https://alphastack.in";
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

$subject = "$siteName — New enquiry from $name" . ($interest ? " ($interest)" : "");

$body = "New contact form submission on $siteName\n\n";
$body .= "Name:      $name\n";
$body .= "Company:   " . ($company !== '' ? $company : '—') . "\n";
$body .= "Email:     $email\n";
$body .= "Interest:  " . ($interest !== '' ? $interest : '—') . "\n";
$body .= "Message:\n$message\n\n";
$body .= "---\nSent: " . date('Y-m-d H:i:s') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$fromAddress = "info@alphastack.in";
$headers  = "From: $siteName Website <$fromAddress>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($recipientEmail, $subject, $body, $headers);

if ($sent) {
    echo json_encode(["ok" => true]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Message could not be sent. Please try again or email us directly."]);
}
