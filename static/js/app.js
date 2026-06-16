document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let releaseNotes = [];
  let currentSelectionText = '';
  let currentSelectionLink = '';

  // DOM elements
  const loader = document.getElementById('loader');
  const errorBox = document.getElementById('error-box');
  const errorMsg = document.getElementById('error-msg');
  const btnRetry = document.getElementById('btn-retry');
  const btnRefresh = document.getElementById('btn-refresh');
  const refreshIcon = document.getElementById('refresh-icon');
  const lastUpdatedTime = document.getElementById('last-updated-time');
  const releaseNotesContainer = document.getElementById('release-notes');
  const emptyState = document.getElementById('empty-state');
  
  // Selection button
  const selectionTweetBtn = document.getElementById('selection-tweet-btn');
  
  // Modal elements
  const tweetModal = document.getElementById('tweet-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const tweetTextarea = document.getElementById('tweet-text');
  const charCounter = document.getElementById('char-counter');
  const btnSendTweet = document.getElementById('btn-send-tweet');

  // Fetch release notes on load
  fetchReleaseNotes();

  // Event Listeners
  btnRefresh.addEventListener('click', fetchReleaseNotes);
  btnRetry.addEventListener('click', fetchReleaseNotes);
  btnCloseModal.addEventListener('click', closeTweetModal);
  tweetTextarea.addEventListener('input', updateCharCount);
  btnSendTweet.addEventListener('click', postTweet);
  
  // Click outside modal to close
  tweetModal.addEventListener('click', (e) => {
    if (e.target === tweetModal) {
      closeTweetModal();
    }
  });

  // Highlight selection listener
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('mousedown', (e) => {
    // Hide floating button when starting a new click, unless clicking the button itself
    if (e.target !== selectionTweetBtn && !selectionTweetBtn.contains(e.target)) {
      selectionTweetBtn.style.display = 'none';
    }
  });

  // Action for the selection floating button
  selectionTweetBtn.addEventListener('click', () => {
    if (currentSelectionText) {
      const hashtags = ' #BigQuery #GoogleCloud';
      const linkPart = currentSelectionLink ? ` ${currentSelectionLink}` : '';
      let tweetContent = `"${currentSelectionText}"${linkPart}${hashtags}`;
      
      // If it exceeds 280, let's truncate the selected text part to fit
      if (tweetContent.length > 280) {
        const overhead = linkPart.length + hashtags.length + 5; // 5 for quotes and ellipsis
        const maxSelectedLength = 280 - overhead;
        const truncatedSelect = currentSelectionText.slice(0, maxSelectedLength) + '...';
        tweetContent = `"${truncatedSelect}"${linkPart}${hashtags}`;
      }
      
      openTweetModal(tweetContent);
      selectionTweetBtn.style.display = 'none';
    }
  });

  // Fetch API function
  async function fetchReleaseNotes() {
    showLoading();
    try {
      const response = await fetch('/api/release-notes');
      const data = await response.json();
      
      if (data.success) {
        releaseNotes = data.notes;
        renderReleaseNotes(data.notes);
        
        // Update last updated timestamp
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lastUpdatedTime.textContent = `Last updated: ${timeStr}`;
        
        showContent();
      } else {
        showError(data.error || 'Failed to retrieve release notes.');
      }
    } catch (err) {
      showError('Network error. Please check if the backend server is running.');
      console.error(err);
    }
  }

  function showLoading() {
    loader.style.display = 'flex';
    errorBox.style.display = 'none';
    releaseNotesContainer.style.display = 'none';
    emptyState.style.display = 'none';
    
    // Disable button & animate icon
    btnRefresh.disabled = true;
    refreshIcon.classList.add('icon-spin');
  }

  function showContent() {
    loader.style.display = 'none';
    
    // Enable button & stop animation
    btnRefresh.disabled = false;
    refreshIcon.classList.remove('icon-spin');
    
    if (releaseNotes.length === 0) {
      emptyState.style.display = 'block';
      releaseNotesContainer.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      releaseNotesContainer.style.display = 'flex';
    }
  }

  function showError(msg) {
    loader.style.display = 'none';
    releaseNotesContainer.style.display = 'none';
    emptyState.style.display = 'none';
    
    errorMsg.textContent = msg;
    errorBox.style.display = 'block';
    
    // Enable button & stop animation
    btnRefresh.disabled = false;
    refreshIcon.classList.remove('icon-spin');
  }

  // Format HTML content to replace release note type headers with nice badges
  function formatContent(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Google release notes usually use <h3> or <h2> for types like "Feature", "Changed", etc.
    const headers = doc.querySelectorAll('h2, h3, h4');
    headers.forEach(header => {
      const text = header.textContent.trim().toLowerCase();
      let tagClass = 'default';
      
      if (text.includes('feature')) tagClass = 'feature';
      else if (text.includes('deprecat')) tagClass = 'deprecated';
      else if (text.includes('change')) tagClass = 'changed';
      else if (text.includes('fix')) tagClass = 'fixed';
      
      const span = doc.createElement('span');
      span.className = `release-tag ${tagClass}`;
      span.textContent = header.textContent;
      
      // Replace header element with the span
      header.parentNode.replaceChild(span, header);
    });

    // Make all external links open in a new tab
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
    
    return doc.body.innerHTML;
  }

  // Render cards
  function renderReleaseNotes(notes) {
    releaseNotesContainer.innerHTML = '';
    
    notes.forEach((note, index) => {
      const card = document.createElement('article');
      card.className = 'note-card';
      card.dataset.index = index;
      
      const formattedHtml = formatContent(note.content);
      
      card.innerHTML = `
        <div class="note-header">
          <div class="note-date-title">
            <span class="note-date">${note.title}</span>
          </div>
          <div class="note-actions">
            <button class="btn-tweet card-tweet-trigger" data-index="${index}">
              <i class="fa-brands fa-x-twitter"></i> Tweet
            </button>
          </div>
        </div>
        <div class="note-content">
          ${formattedHtml}
        </div>
      `;
      
      releaseNotesContainer.appendChild(card);
    });

    // Add listeners to card tweet triggers
    document.querySelectorAll('.card-tweet-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.currentTarget.dataset.index;
        const note = releaseNotes[index];
        const tweetText = generateTweetText(note);
        openTweetModal(tweetText);
      });
    });
  }

  // Generate a neat Tweet text for a card
  function generateTweetText(note) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    
    // Clean text
    let text = tempDiv.textContent || tempDiv.innerText || "";
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove initial Category keywords if any (e.g. "Feature", "Changed")
    text = text.replace(/^(Feature|Changed|Deprecated|Fixed|Resolved|Note|Information)\s+/i, '');
    
    const dateStr = note.title;
    const url = note.link || "https://cloud.google.com/bigquery/docs/release-notes";
    
    const prefix = `BigQuery Update (${dateStr}): `;
    const hashtags = ` #BigQuery #GoogleCloud`;
    const urlSpace = ` ${url}`;
    
    const maxDescLength = 280 - prefix.length - urlSpace.length - hashtags.length;
    
    if (text.length > maxDescLength) {
      text = text.slice(0, maxDescLength - 3) + '...';
    }
    
    return `${prefix}${text}${urlSpace}${hashtags}`;
  }

  // Handle highlighted text selection
  function handleTextSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 5) {
      // Find if selection is within a release note card
      const range = selection.getRangeAt(0);
      const containerNode = range.commonAncestorContainer;
      const card = containerNode.nodeType === 1 ? containerNode.closest('.note-card') : containerNode.parentElement.closest('.note-card');
      
      if (card) {
        const index = card.dataset.index;
        const note = releaseNotes[index];
        
        currentSelectionText = selectedText;
        currentSelectionLink = note.link || "https://cloud.google.com/bigquery/docs/release-notes";
        
        // Position the tooltip button
        const rect = range.getBoundingClientRect();
        
        // Account for scroll offset
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        selectionTweetBtn.style.left = `${rect.left + scrollX + (rect.width / 2) - 60}px`;
        selectionTweetBtn.style.top = `${rect.top + scrollY - 45}px`;
        selectionTweetBtn.style.display = 'flex';
      }
    } else {
      // Don't hide immediately on mouseup if clicking the tooltip button itself
      if (e.target !== selectionTweetBtn && !selectionTweetBtn.contains(e.target)) {
        selectionTweetBtn.style.display = 'none';
      }
    }
  }

  // Modal UI Controls
  function openTweetModal(initialText) {
    tweetTextarea.value = initialText;
    updateCharCount();
    tweetModal.classList.add('active');
    tweetTextarea.focus();
  }

  function closeTweetModal() {
    tweetModal.classList.remove('active');
  }

  function updateCharCount() {
    const length = tweetTextarea.value.length;
    const remaining = 280 - length;
    
    charCounter.textContent = remaining;
    
    if (remaining < 0) {
      charCounter.className = 'char-counter error';
      btnSendTweet.disabled = true;
    } else if (remaining < 20) {
      charCounter.className = 'char-counter warning';
      btnSendTweet.disabled = false;
    } else {
      charCounter.className = 'char-counter';
      btnSendTweet.disabled = length === 0;
    }
  }

  function postTweet() {
    const text = tweetTextarea.value;
    if (text.length > 0 && text.length <= 280) {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      closeTweetModal();
    }
  }
});
