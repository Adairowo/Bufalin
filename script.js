let messagesStarted = false;

    function toggleMenu() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      
      const isOpen = !sidebar.classList.contains('-translate-x-full');
      
      if (isOpen) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        setTimeout(() => overlay.classList.add('opacity-0'), 10);
      } else {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
      }
    }

    function showHotels() {
      document.getElementById('chatArea').classList.add('hidden');
      document.getElementById('hotelsSection').classList.remove('hidden');
      toggleMenu(); // Cerrar el menú
    }

    function backToChat() {
      document.getElementById('hotelsSection').classList.add('hidden');
      document.getElementById('chatArea').classList.remove('hidden');
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    }

    function sendMessage() {
      const input = document.getElementById('messageInput');
      const message = input.value.trim();
      
      if (!message) return;

      // First message - hide empty state and show messages
      if (!messagesStarted) {
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('messagesContainer').classList.remove('hidden');
        messagesStarted = true;
      }

      const messagesContainer = document.getElementById('messagesContainer');
      const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      // User message
      const userMessageHTML = `
        <div class="flex gap-3 justify-end message-bubble">
          <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-none p-4 max-w-xs shadow-lg">
            <p class="text-sm">${message}</p>
            <span class="text-xs text-gray-200 mt-2 block text-right">${time}</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-lg flex-shrink-0">
            👤
          </div>
        </div>
      `;
      
      messagesContainer.insertAdjacentHTML('beforeend', userMessageHTML);
      input.value = '';

      // Scroll to bottom
      const chatArea = document.getElementById('chatArea');
      setTimeout(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
      }, 100);

      // Bot response (simulated)
      setTimeout(() => {
        const botMessageHTML = `
          <div class="flex gap-3 message-bubble">
            <div class="w-8 h-8 rounded-full glass-effect flex items-center justify-center text-lg flex-shrink-0">
              <img src="img/bufaliiin.png" alt="Bot" class="w-6 h-6 rounded-full"> </img>
            </div>
            <div class="glass-effect rounded-2xl rounded-tl-none p-4 max-w-xs shadow-lg">
              <p class="text-sm">¡Claro! Déjame ayudarte con eso. ¿Podrías darme más detalles sobre lo que buscas?</p>
              <span class="text-xs text-gray-400 mt-2 block">${time}</span>
            </div>
          </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', botMessageHTML);
        
        setTimeout(() => {
          chatArea.scrollTop = chatArea.scrollHeight;
        }, 100);
      }, 1000);
    }

    document.addEventListener('DOMContentLoaded', () => {
  // safe overlay hookup
  const overlayEl = document.getElementById('overlay');
  if (overlayEl) overlayEl.addEventListener('click', toggleMenu);

  // Load sidebar (with basic error handling)
  fetch('sidebar.html')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(html => {
      const container = document.getElementById('sidebar-container');
      if (container) container.innerHTML = html;
    })
    .catch(err => {
      console.error('Failed to load sidebar:', err);
      const container = document.getElementById('sidebar-container');
      if (container) {
        container.innerHTML = `
          <div class="p-6 glass-effect rounded-xl text-sm">
            No se pudo cargar el menú. Si abres los archivos con file:// es posible que fetch falle. Ejecuta un servidor local (por ejemplo Live Server en VSCode o <code>npx http-server</code>) y recarga la página.
          </div>
        `;
      }
    });
});
