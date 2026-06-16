# BigQuery Release Notes Tracker (BigQuery-event-talks-app)

A modern, high-performance web application built with **Python Flask** and plain **vanilla HTML, JavaScript, and CSS** that tracks Google Cloud BigQuery updates, features, and fixes in real time. It fetches the official BigQuery Release Notes feed, formats category headers on the fly, and allows you to easily tweet specific updates or custom-highlighted text.

## 💎 Features

- **Rich Dark Aesthetics**: Designed with slate backgrounds, glowing neon-cyan borders, and custom micro-animations.
- **Dynamic Badging**: Categorizes and badges updates (e.g., `Feature`, `Changed`, `Deprecated`, `Fixed`) dynamically in the UI.
- **Refresh Details**: Sync button with loading spinner animations to fetch updates on demand.
- **Tweet Selection Tooltip**: Select any text block on the page, and a floating tooltip will appear letting you tweet the specific selection.
- **Tweet Modal Composer**: An editor to review, edit, and count characters (up to 280 limits) before pushing directly to X/Twitter Web Intents.
- **Robust Built-in Parsing**: Uses Python's native `xml.etree.ElementTree` parser to eliminate fragile external feed parser dependencies.

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, Flask, Requests
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (custom variables, keyframe animations, glassmorphism), Vanilla JavaScript (ES6, DOMParser, text selection API)
- **Typography & Icons**: Google Font (Outfit), FontAwesome 6.4.0

## 🚀 Setup & Run Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tanvi-kirloskar/BigQuery-event-talks-app.git
   cd BigQuery-event-talks-app
   ```

2. **Install Dependencies**:
   Install the necessary packages:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Web App**:
   Run the Flask server:
   ```bash
   python app.py
   ```

4. **View Application**:
   Open your browser and visit [http://127.0.0.1:5000](http://127.0.0.1:5000).

## 📄 License
Open source under the MIT License.
