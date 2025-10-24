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

    // --- FUNCION GUARDADO DE CHAT---

    /**
     * Guarda contenido HTML en local storage.
     */
    function saveChatHistory() {
      const messagesContainer = document.getElementById('messagesContainer');
      localStorage.setItem('chatHistory', messagesContainer.innerHTML);
    }

    /**
     * Mostrar en pantalla
     */
    function loadChatHistory() {
      const savedHistory = localStorage.getItem('chatHistory');
      const messagesContainer = document.getElementById('messagesContainer');
      const chatArea = document.getElementById('chatArea');

      if (savedHistory && savedHistory.trim() !== '') {
        messagesContainer.innerHTML = savedHistory;
        document.getElementById('emptyState').classList.add('hidden');
        messagesContainer.classList.remove('hidden');
        messagesStarted = true;

        // Eliminar cualquier indicador de "escribiendo..." que pudo quedar guardado
        document.getElementById('typing-indicator')?.remove();

        // Scroll hasta el final para ver los últimos mensajes
        setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 100);
      }
    }

    // 

    async function sendMessage() {
      const input = document.getElementById('messageInput');
      const message = input.value.trim();
      
      if (!message) return;

      // Primer mensaje
      if (!messagesStarted) {
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('messagesContainer').classList.remove('hidden');
        messagesStarted = true;
      }

      const messagesContainer = document.getElementById('messagesContainer');

      // Mensaje usuario
      const userMessageHTML = `
        <div class="flex gap-3 justify-end message-bubble mt-8">
          <div class="glass-effect rounded-2xl rounded-tl-none p-4 max-w-xs shadow-lg break-words">
            <p class="text-sm whitespace-pre-wrap">${message}</p>
          </div>
        </div>
      `;
      
      messagesContainer.insertAdjacentHTML('beforeend', userMessageHTML);
      input.value = '';
      saveChatHistory(); // Guardar historial 

      // Scroll 
      const chatArea = document.getElementById('chatArea');
      setTimeout(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
      }, 100);

      // Escribiendo
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

      
      try {
        // 1. Crear el contenedor para la respuesta del bot
        const botMessageContainer = document.createElement('div');
        botMessageContainer.className = "flex gap-3 mt-4 message-bubble";
        botMessageContainer.innerHTML = `
          <div class="rounded-2xl rounded-tl-none p-4 max-w-md break-words">
            <p class="text-sm whitespace-pre-wrap"></p>
          </div>
        `;
        
        // Quitar el indicador de "escribiendo" y añadir el nuevo contenedor de mensaje
        document.getElementById('typing-indicator')?.remove();
        messagesContainer.appendChild(botMessageContainer);
        const botTextElement = botMessageContainer.querySelector('p');
        chatArea.scrollTop = chatArea.scrollHeight;

        // 2. Hacer la petición a la API
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

        // 3. Leer el stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = ''; // Acumularemos el texto aquí
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Reemplaza **texto** con <strong>texto</strong> para renderizar negritas.
          // Usamos innerHTML para que el navegador interprete la etiqueta <strong>.
          const formattedHtml = accumulatedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          botTextElement.innerHTML = formattedHtml;
          chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll
        }

        // Guardar historial después de que el bot termine de responder
        saveChatHistory();

      } catch (error) {
        console.error("Error al obtener respuesta del bot:", error);
        document.getElementById('typing-indicator')?.remove(); 
        // Mostrar un mensaje de error en el chat
        const errorMessageHTML = `
          <div class="flex gap-3 mt-4 message-bubble">
            <div class="glass-effect rounded-2xl rounded-tl-none p-4 max-w-md break-words border border-red-500/50">
              <p class="text-sm text-red-300">Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.</p>
            </div>
          </div>`;
        messagesContainer.insertAdjacentHTML('beforeend', errorMessageHTML);
        saveChatHistory(); // Guardar también el mensaje de error
      } finally {
        setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 100);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      
  // Cargar el historial 
  loadChatHistory();

  // --- INICIO: Delegación de eventos para el menú ---
  // En lugar de usar onclick="toggleMenu()" en el HTML, escuchamos los clics en todo el documento.
  document.addEventListener('click', function(event) {
    // Si el elemento clickeado (o su contenedor) tiene el atributo 'data-action="toggle-menu"'
    if (event.target.closest('[data-action="toggle-menu"]')) {
      toggleMenu();
    }
  });
  // 
  const overlayEl = document.getElementById('overlay');
  if (overlayEl) overlayEl.addEventListener('click', toggleMenu);

  // sidebar
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
