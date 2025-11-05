document.addEventListener('DOMContentLoaded', () => {
    const serverAddressInput = document.getElementById('serverAddress');
    const connectButton = document.getElementById('connectButton');
    const disconnectButton = document.getElementById('disconnectButton');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesList = document.getElementById('messagesList');

    let ws;

    function appendMessage(message) {
        const li = document.createElement('li');
        li.textContent = message;
        messagesList.appendChild(li);
    }

    connectButton.addEventListener('click', () => {
        const serverAddress = serverAddressInput.value;
        ws = new WebSocket(serverAddress);

        ws.onopen = () => {
            appendMessage('已连接到 WebSocket 服务器');
            connectButton.disabled = true;
            disconnectButton.disabled = false;
            messageInput.disabled = false;
            sendButton.disabled = false;
            serverAddressInput.disabled = true;
        };

        ws.onmessage = event => {
            appendMessage(`收到: ${event.data}`);
        };

        ws.onclose = () => {
            appendMessage('已从 WebSocket 服务器断开连接');
            connectButton.disabled = false;
            disconnectButton.disabled = true;
            messageInput.disabled = true;
            sendButton.disabled = true;
            serverAddressInput.disabled = false;
        };

        ws.onerror = error => {
            appendMessage(`WebSocket 错误: ${error.message}`);
            console.error('WebSocket error:', error);
        };
    });

    disconnectButton.addEventListener('click', () => {
        if (ws) {
            ws.close();
        }
    });

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            appendMessage(`已发送: ${message}`);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
});