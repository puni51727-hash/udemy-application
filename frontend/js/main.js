// Change this to your live Render API URL once deployed:
// Example: const API_BASE_URL = 'https://skillnest-backend.onrender.com';
const API_BASE_URL = 'http://localhost:5000';

function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (isAuthenticated()) {
        navLinks.innerHTML = `
            <li><button onclick="toggleChat()" class="nav-btn" style="color: var(--primary-color); border: none; display: flex; align-items: center; gap: 5px;" title="AI Assistant"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Ask AI</button></li>
            <li><a href="courses.html">Find Courses</a></li>
            <li><a href="dashboard.html" style="font-weight: 600;">My Learning</a></li>
            <li><button onclick="logout()" class="nav-btn login">Log out</button></li>
        `;
    } else {
        navLinks.innerHTML = `
            <li><button onclick="toggleChat()" class="nav-btn" style="color: var(--primary-color); border: none; display: flex; align-items: center; gap: 5px;" title="AI Assistant"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Ask AI</button></li>
            <li><a href="courses.html">Explore</a></li>
            <li><a href="login.html" class="nav-btn login">Log in</a></li>
            <li><a href="register.html" class="btn">Sign up</a></li>
        `;
    }
}

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alert-box');
    if (!alertBox) {
        alert(message);
        return;
    }
    
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 4000);
}

// ---- AI Chatbot Integration ----

function initChatbot() {
    if (document.getElementById('skillnest-chatbot')) return;

    const chatHTML = `
        <div id="skillnest-chat-window" class="chat-window">
            <div class="chat-header">
                <div style="display:flex; align-items:center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    SkillNest Assistant
                </div>
                <span class="chat-close" onclick="toggleChat()">&times;</span>
            </div>
            <div class="chat-body" id="chat-body">
                <div class="chat-msg bot">Hi! I'm your AI learning assistant. How can I help you today?</div>
            </div>
            <div class="chat-footer">
                <form id="chat-form" class="chat-form-inner">
                    <input type="text" id="chat-input" class="chat-input" placeholder="Ask me anything..." required autocomplete="off">
                    <button type="submit" class="chat-send">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const msg = input.value.trim();
        if (!msg) return;

        addChatMessage(msg, 'user');
        input.value = '';

        const typingId = 'typing-' + Date.now();
        addChatMessage('Typing...', 'bot', typingId);

        try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            
            document.getElementById(typingId).remove();
            addChatMessage(data.reply, 'bot');
            
        } catch (error) {
            if(document.getElementById(typingId)) {
                document.getElementById(typingId).remove();
            }
            addChatMessage('Sorry, I am having trouble connecting to the brain servers right now.', 'bot');
        }
    });
}

function toggleChat() {
    const chatWindow = document.getElementById('skillnest-chat-window');
    chatWindow.classList.toggle('active');
}

function addChatMessage(msg, sender, id = null) {
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    if (id) div.id = id;
    div.textContent = msg;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    initChatbot();

    // Global Search Bar Functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        // Pre-fill the search bar if there's a search parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            searchInput.value = decodeURIComponent(searchQuery);
        }

        // Search on 'Enter' key press
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                
                // Only redirect if we are NOT on courses.html, since courses.js has live search
                // But if they hit enter on any page, redirect them to courses.html anyway
                if (query) {
                    window.location.href = `courses.html?search=${encodeURIComponent(query)}`;
                } else {
                    window.location.href = 'courses.html';
                }
            }
        });
    }
});
