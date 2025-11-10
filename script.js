document.addEventListener('DOMContentLoaded', () => {
    const wsUrlInput = document.getElementById('wsUrl');
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesList = document.getElementById('messagesList');

    const passthroughModeBtn = document.getElementById('passthroughModeBtn');
    const aiChatModeBtn = document.getElementById('aiChatModeBtn');
    const aiControlModeBtn = document.getElementById('aiControlModeBtn');

    let ws;
    let currentMode = 'passthrough'; // 默认模式

    const appendMessage = (message) => {
        const li = document.createElement('li');
        li.textContent = message;
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight; // Auto-scroll to the latest message
    };

    const setConnectedState = (isConnected) => {
        wsUrlInput.disabled = isConnected;
        connectBtn.disabled = isConnected;
        disconnectBtn.disabled = !isConnected;
        messageInput.disabled = !isConnected;
        sendBtn.disabled = !isConnected;
    };

    function switchMode(mode) {
        currentMode = mode;
        passthroughModeBtn.classList.remove('active');
        aiChatModeBtn.classList.remove('active');
        aiControlModeBtn.classList.remove('active');

        if (mode === 'passthrough') {
            passthroughModeBtn.classList.add('active');
            messageInput.placeholder = '在此输入您的消息...';
        } else if (mode === 'aiChat') {
            aiChatModeBtn.classList.add('active');
            messageInput.placeholder = '向 AI 提问...';
        } else if (mode === 'aiControl') {
            aiControlModeBtn.classList.add('active');
            messageInput.placeholder = '向 AI 发送控制指令...';
        }
    }

    passthroughModeBtn.addEventListener('click', () => switchMode('passthrough'));
    aiChatModeBtn.addEventListener('click', () => switchMode('aiChat'));
    aiControlModeBtn.addEventListener('click', () => switchMode('aiControl'));

    connectBtn.addEventListener('click', () => {
        console.log('连接按钮被点击。');
        const url = wsUrlInput.value;
        if (!url) {
            alert('请输入 WebSocket 地址。');
            return;
        }

        console.log(`尝试连接 WebSocket: ${url}`);
        ws = new WebSocket(url);

        ws.onopen = () => {
            appendMessage('已连接到 WebSocket 服务器。');
            setConnectedState(true);
            console.log('WebSocket 连接已打开。');
        };

        ws.onmessage = (event) => {
            const message = event.data;
            if (message.startsWith('AI_CONTROL: ')) {
                try {
                    let jsonString = message.substring('AI_CONTROL: '.length);
                    // 移除可能的 Markdown 代码块标记
                    jsonString = jsonString.replace(/^```json\s*|\s*```$/g, '');
                    const controlData = JSON.parse(jsonString);
                    displayControlCard(controlData);
                } catch (e) {
                    appendMessage(`收到 AI 控制消息 (JSON 解析失败): ${message}`);
                    console.error('Error parsing AI_CONTROL JSON:', e);
                }
            } else {
                appendMessage(`收到: ${message}`);
            }
            console.log(`WebSocket 收到消息: ${message}`);
        };

        ws.onclose = () => {
            appendMessage('已从 WebSocket 服务器断开连接。');
            setConnectedState(false);
            console.log('WebSocket 连接已关闭。');
        };

        ws.onerror = (error) => {
            appendMessage(`WebSocket 错误: ${error.message}`);
            console.error('WebSocket 错误:', error);
        };
    });

    disconnectBtn.addEventListener('click', () => {
        console.log('断开按钮被点击。');
        if (ws) {
            ws.close();
        }
    });

    sendBtn.addEventListener('click', () => {
        console.log('发送按钮被点击。');
        let message = messageInput.value;
        if (ws && ws.readyState === WebSocket.OPEN && message) {
            if (currentMode === 'aiChat') {
                messageToSend = `/ai ${message}`;
            } else if (currentMode === 'aiControl') {
                messageToSend = `/aicontrol ${message}`;
            }
            ws.send(messageToSend);
            appendMessage(`已发送: ${messageToSend}`); // 修改这里，显示实际发送的消息
            messageInput.value = '';
            console.log(`WebSocket 消息已发送: ${messageToSend}`); // 修改这里，记录实际发送的消息
        } else if (!message) {
            alert('请输入要发送的消息。');
        } else {
            console.warn('无法发送消息: WebSocket 未打开或消息为空。');
        }
    });

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            console.log('按下回车键。');
            sendBtn.click();
        }
    });

    function displayControlCard(data) {
        const li = document.createElement('li');
        li.classList.add('control-card');

        let cardContent = '<h3>AI 控制指令</h3>';

        if (data.风扇) {
            cardContent += `<div class="device-control"><h4>风扇</h4><p>开关: ${data.风扇.开关}</p><p>风速: ${data.风扇.风速}</p><p>理由: ${data.风扇.理由}</p></div>`;
        }
        if (data.LED灯) {
            cardContent += `<div class="device-control"><h4>LED灯</h4><p>开关: ${data.LED灯.开关}</p><p>色温: ${data.LED灯.色温}</p><p>理由: ${data.LED灯.理由}</p></div>`;
        }
        if (data.窗帘) {
            cardContent += `<div class="device-control"><h4>窗帘</h4><p>开关: ${data.窗帘.开关}</p><p>理由: ${data.窗帘.理由}</p></div>`;
        }

        li.innerHTML = cardContent;
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    // Initial state
    setConnectedState(false);
    switchMode('passthrough'); // 初始化为透传模式
    console.log('初始状态设置: 未连接。');
});