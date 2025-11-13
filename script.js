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

    async function sendMessage() {
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

      // User message
      const userMessageHTML = `
        <div class="flex gap-3 justify-end message-bubble mt-8">
          <div class="glass-effect rounded-2xl rounded-tr-none p-4 max-w-xs shadow-lg break-words">
            <p class="text-sm whitespace-pre-wrap">${message}</p>
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

      // Show typing indicator
      const typingIndicatorHTML = `
        <div id="typing-indicator" class="flex gap-3 mt-8">
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <img src="img/bufaliiin.png" alt="Bufalín" class="w-8 h-8 rounded-full object-cover" />
            <span>Bufalín está escribiendo...</span>
            <div class="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-.3s]"></div>
            <div class="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-.15s]"></div>
            <div class="w-2 h-2 rounded-full bg-white animate-bounce"></div>
          </div>
        </div>
      `;
      messagesContainer.insertAdjacentHTML('beforeend', typingIndicatorHTML);
      setTimeout(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
      }, 100);

      // Bot response from our API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message }),
        });
        
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue correcta.');
        }

        // Quitar el indicador de "escribiendo" una vez que la respuesta comienza
        document.getElementById('typing-indicator')?.remove();

        // 1. Crear el contenedor para la respuesta del bot
        const botMessageContainer = document.createElement('div');
        botMessageContainer.className = "flex gap-3 mt-4 message-bubble";
        botMessageContainer.innerHTML = `
          <div class="rounded-2xl rounded-tl-none p-4 max-w-md break-words">
            <p class="text-sm whitespace-pre-wrap"></p>
          </div>
        `;
        
        messagesContainer.appendChild(botMessageContainer);
        const botTextElement = botMessageContainer.querySelector('p');
        chatArea.scrollTop = chatArea.scrollHeight;

        // 2. Leer el stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          const formattedHtml = accumulatedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          botTextElement.innerHTML = formattedHtml;
          chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll
        }

      } catch (error) {
        console.error("Error al obtener respuesta del bot:", error);
        document.getElementById('typing-indicator')?.remove(); // Asegurarse de quitarlo en caso de error
        // Mostrar un mensaje de error en el chat
        const errorMessageHTML = `
          <div class="flex gap-3 mt-4 message-bubble">
            <div class="glass-effect rounded-2xl rounded-tl-none p-4 max-w-md break-words border border-red-500/50">
              <p class="text-sm text-red-300">Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.</p>
            </div>
          </div>`;
        messagesContainer.insertAdjacentHTML('beforeend', errorMessageHTML);
      } finally {
        setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 100);
      }
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
 