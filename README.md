## ⚙️ Installation & Setup

1.  **Download/Clone:** Place the `wp-designer` folder into your `/wp-content/plugins/` directory.
2.  **API Configuration:** 
    *   For security, this plugin retrieves your API key from a PHP constant.
    *   Add the following line to your `wp-config.php` file:
    ```php
    define('GEMINI_API_KEY', 'your-api-key-here');
    ```
3.  **Activate:** Go to the WordPress Dashboard > Plugins and activate **WP Designer**.
4.  **Use:** Open any Page or Post. Look for the 💬 icon in the bottom right corner of the editor.

---

## 🧪 AI Logic Workflow

1.  **Context Capture:** The script serializes the current Gutenberg blocks into raw HTML comments.
2.  **The Handshake:** The HTML and User Request are sent via AJAX to the backend.
3.  **Gemini Processing:** The LLM processes the layout and returns a JSON object containing a description and a `new_body_html` string.
4.  **Block Hydration:** `wp.blocks.rawHandler` parses the AI's string back into block objects, and `wp.data.dispatch` instantly updates the editor UI.

---

## 🛡️ Security & Best Practices

*   **Nonce Verification:** All AJAX requests are secured with WordPress nonces to prevent CSRF attacks.
*   **Capability Checks:** Only users with `edit_posts` permissions can trigger the AI Architect.
*   **Data Sanitization:** Uses `sanitize_textarea_field` and strict JSON parsing to ensure safe handling of LLM outputs.

---

## 👨‍💻 Author

**Duncan Danful**  
*Self-taught Software Developer & AI Automation Enthusiast.*  
[GitHub](https://github.com/your-username) | [Portfolio](https://your-portfolio-link.com)

---

### 💡 Portfolio Note
*This project was built to demonstrate the bridge between Generative AI and legacy CMS platforms. ItThis is the "handshake" your repo gives to the world. For a portfolio, your README needs to highlight the technical sophistication of using **Shadow DOM** and **Gutenberg Data Stores**, as these are high-level concepts that differentiate a "beginner" from a "senior" developer.

Save this as `README.md` in your root folder.

---

# ⚡ WP Designer: Autonomous AI UI Architect

**WP Designer** is a professional-grade WordPress plugin that leverages the **Gemini 2.0 Flash API** to act as a Senior UI Designer. It doesn't just suggest changes—it autonomously redesigns pages by directly manipulating the WordPress Gutenberg Block Editor state.

---

## 🚀 Key Features

*   **Shadow DOM Encapsulation:** The chat interface is injected via a Shadow Root, ensuring zero CSS leakage or conflicts with WordPress Admin styles.
*   **Gutenberg State Management:** Uses `wp.data` and `wp.blocks` to read current page context and programmatically "reset" the editor with AI-generated layouts.
*   **Agentic Prompting:** Optimized system instructions ensure the LLM returns strictly valid WordPress block comments (`<!-- wp:group -->`) and JSON structures.
*   **Modern Fetch API:** Implements a clean, asynchronous handshake with the WordPress AJAX API using `fetch` and `URLSearchParams`.

---

## 🛠️ Technical Stack

*   **Backend:** PHP (WordPress Plugin API, HTTP API)
*   **Frontend:** Vanilla JavaScript (ES6+), Shadow DOM API
*   **AI Engine:** Google Gemini 2.0 Flash
*   **Editor Integration:** WordPress `@wordpress/data` & `@wordpress/blocks`

---

## 📁 Repository Structure
```text
wp-designer/
├── assets/
│   └── chat.js          # Core UI logic & Gutenberg State Management
├── wp_designer.php      # Plugin entry point & Gemini API Bridge
├── README.md            # Project Documentation
└── .gitignore           # Prevents API keys from being leaked
```

---

## ⚙️ Installation & Setup

1.  **Download/Clone:** Place the `wp-designer` folder into your `/wp-content/plugins/` directory.
2.  **API Configuration:** 
    *   For security, this plugin retrieves your API key from a PHP constant.
    *   Add the following line to your `wp-config.php` file:
    ```php
    define('GEMINI_API_KEY', 'your-api-key-here');
    ```
3.  **Activate:** Go to the WordPress Dashboard > Plugins and activate **WP Designer**.
4.  **Use:** Open any Page or Post. Look for the 💬 icon in the bottom right corner of the editor.

---

## 🧪 AI Logic Workflow

1.  **Context Capture:** The script serializes the current Gutenberg blocks into raw HTML comments.
2.  **The Handshake:** The HTML and User Request are sent via AJAX to the backend.
3.  **Gemini Processing:** The LLM processes the layout and returns a JSON object containing a description and a `new_body_html` string.
4.  **Block Hydration:** `wp.blocks.rawHandler` parses the AI's string back into block objects, and `wp.data.dispatch` instantly updates the editor UI.

---

## 🛡️ Security & Best Practices

*   **Nonce Verification:** All AJAX requests are secured with WordPress nonces to prevent CSRF attacks.
*   **Capability Checks:** Only users with `edit_posts` permissions can trigger the AI Architect.
*   **Data Sanitization:** Uses `sanitize_textarea_field` and strict JSON parsing to ensure safe handling of LLM outputs.

---

## 👨‍💻 Author

**Duncan Danful**  
*Self-taught Software Developer & AI Automation Enthusiast.*  
[GitHub](https://github.com/your-username) | [Portfolio](https://your-portfolio-link.com)

---

### 💡 Portfolio Note
*This project was built to demonstrate the bridge between Generative AI and legacy CMS platforms. It focuses on solving the 'blank page' problem for designers by providing a reactive, agentic assistant directly within the native WordPress editing experience.*
