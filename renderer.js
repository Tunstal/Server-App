const serverContainer = document.getElementById('servers');
const logArea = document.getElementById('logs');
let serverStatus = {};

function renderServers(configs) {
  serverContainer.innerHTML = '';
  configs.forEach(cfg => {
    const div = document.createElement('div');
    div.classList.add('server-card');
    div.innerHTML = `
      <h3>${cfg.name}</h3>
      <button data-id="${cfg.id}" class="start">Start</button>
      <button data-id="${cfg.id}" class="stop">Stop</button>
      <span id="status-${cfg.id}">Stopped</span>
    `;
    serverContainer.appendChild(div);
  });

  document.querySelectorAll('.start').forEach(btn =>
    btn.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      const msg = await window.api.startServer(id);
      setStatus(id, 'Running');
      appendLog(`[${id}] ${msg}`);
    })
  );

  document.querySelectorAll('.stop').forEach(btn =>
    btn.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      const msg = await window.api.stopServer(id);
      setStatus(id, 'Stopped');
      appendLog(`[${id}] ${msg}`);
    })
  );
}

function appendLog(text) {
  logArea.textContent += text + '\n';
  logArea.scrollTop = logArea.scrollHeight;
}

function setStatus(id, status) {
  document.getElementById(`status-${id}`).textContent = status;
}

window.api.getConfigs().then(renderServers);

window.api.onLog(({ id, log }) => {
  appendLog(`[${id}] ${log.trim()}`);
});

window.api.onStopped(({ id, code }) => {
  setStatus(id, 'Stopped');
  appendLog(`[${id}] exited with code ${code}`);
});
