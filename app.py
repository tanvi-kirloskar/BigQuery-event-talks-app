import xml.etree.ElementTree as ET
import requests
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/release-notes')
def get_release_notes():
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(FEED_URL, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch feed from Google Docs, status code: {response.status_code}'
            }), 500
            
        root = ET.fromstring(response.content)
        
        # Atom namespaces
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        feed_title = root.find('atom:title', ns)
        feed_title_text = feed_title.text if feed_title is not None else 'BigQuery Release Notes'
        
        notes = []
        for entry in root.findall('atom:entry', ns):
            # Title
            title_elem = entry.find('atom:title', ns)
            title = title_elem.text if title_elem is not None else ''
            
            # ID
            id_elem = entry.find('atom:id', ns)
            entry_id = id_elem.text if id_elem is not None else ''
            
            # Updated
            updated_elem = entry.find('atom:updated', ns)
            updated = updated_elem.text if updated_elem is not None else ''
            
            # Link
            link_elem = entry.find('atom:link', ns)
            link = link_elem.get('href') if link_elem is not None else ''
            
            # Content
            content_elem = entry.find('atom:content', ns)
            content = content_elem.text if content_elem is not None else ''
            
            notes.append({
                'id': entry_id,
                'title': title,
                'link': link,
                'published': updated,
                'content': content
            })
            
        return jsonify({
            'success': True,
            'title': feed_title_text,
            'notes': notes
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
