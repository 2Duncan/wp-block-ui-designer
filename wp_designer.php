<?php
/**
 * Plugin Name: WP Designer
 * Description: LLM-based Autonomous UI Architect using Gemini.
 * Version: 1.2.1
 * Author: Crafty Height
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Inject the Shadow DOM Host into the admin footer
add_action( 'admin_footer', 'wpd_inject_chat_host' );
function wpd_inject_chat_host() {
    // Ensuring it only loads on the block editor screen is better for performance
    $screen = get_current_screen();
    if ( ! $screen || $screen->base !== 'post' ) return;
    if ( ! current_user_can( 'edit_posts' ) ) return;

    echo '<div id="chatbot-host" 
               data-id="4" 
               data-color="green" 
               data-name="WP UI Designer">
          </div>';
}

// 2. Enqueue the Chat Logic and Localize Data
add_action( 'admin_enqueue_scripts', 'wpd_enqueue_assets' );
function wpd_enqueue_assets() {
    // Fix: Pointing to the 'assets' subfolder
    wp_enqueue_script(
        'wpd-chat-js',
        plugins_url( 'assets/chat.js', __FILE__ ), 
        array('wp-blocks', 'wp-data', 'wp-edit-post'),
        '1.2.1',
        true
    );

    wp_localize_script( 'wpd-chat-js', 'wpd_settings', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'wpd_designer_nonce' )
    ));
}

// 3. The AJAX Receiver & Gemini API Integration
add_action( 'wp_ajax_wpd_process_design', 'wpd_handle_design_request' );

function wpd_handle_design_request() {
    check_ajax_referer( 'wpd_designer_nonce', 'nonce' );
    
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }

    $new_chat     = sanitize_textarea_field( $_POST['new_chat'] );
    $page_context = $_POST['page_context']; 
    $chat_history = isset($_POST['chat_history']) ? $_POST['chat_history'] : '[]';

    // PORTFOLIO TIP: Don't hardcode keys! Use a constant or get_option.
    // define('GEMINI_API_KEY', 'your_key_here'); in wp-config.php
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : ''; 
    
    if (empty($apiKey)) {
        wp_send_json_success(['reply' => 'Error: API Key missing. Please configure GEMINI_API_KEY.']);
    }

    $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;

    $system_instructions = "You are a Senior WordPress Modern Block UI Designer. 
    You are given the current block-based HTML of a page.
    
    TASK:
    Redesign the [PAGE CONTEXT] based on the [USER REQUEST].
    
    RULES:
    1. Return ONLY a JSON object. No markdown formatting.
    2. Format: {\"reply\": \"Description\", \"new_body_html\": \"BLOCK_HTML\"}
    3. MANDATORY: The 'new_body_html' MUST consist of valid WordPress Gutenberg blocks.
    4. You MUST include the block comments.
    5. Use modern Core blocks (wp:columns, wp:group, wp:buttons, wp:heading, etc.).
    6. Do not add header and footer.
    7. Add hints where plugin might be needed with plugin behavior description";

    $full_prompt = "[SYSTEM]: $system_instructions\n[HISTORY]: $chat_history\n[CONTEXT]: $page_context\n[USER]: $new_chat";

    $data = ["contents" => [["role" => "user", "parts" => [["text" => $full_prompt]]]]];

    $response = wp_remote_post($apiUrl, [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode($data),
        'timeout' => 45,
    ]);

    if (is_wp_error($response)) {
        wp_send_json_success(['reply' => 'Server Error: ' . $response->get_error_message()]);
    }

    $cleanResponse = json_decode(wp_remote_retrieve_body($response), true);

    if (!isset($cleanResponse['candidates'])) {
        wp_send_json_success(['reply' => 'Gemini API Error: Check your key or quota.']);
    }

    $botReplyRaw = $cleanResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Safety check for markdown code blocks
    $botReplyRaw = preg_replace('/^```json\s+|
```$/', '', trim($botReplyRaw));
    
    $decodedReply = json_decode($botReplyRaw, true);

    if (json_last_error() === JSON_ERROR_NONE && isset($decodedReply['new_body_html'])) {
        wp_send_json_success([
            'reply'         => $decodedReply['reply'],
            'new_body_html' => $decodedReply['new_body_html']
        ]);
    } else {
        wp_send_json_success(['reply' => $botReplyRaw, 'new_body_html' => null]);
    }
}
