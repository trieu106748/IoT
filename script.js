// ===== Cấu hình MQTT (EMQX Serverless) =====
const BROKER_URL = 'wss://s1a21d21.ala.asia-southeast1.emqxsl.com:8084/mqtt'; // cổng WSS, đổi nếu EMQX hiển thị số khác
const USERNAME = 'hanvantrieu';
const PASSWORD = 'Hanvantrieu';
const TOPIC = 'led'; // phải giống topic trong code ESP32

const lamp = document.getElementById('lamp');
const label = document.getElementById('label');
const dot = document.getElementById('dot');
const connText = document.getElementById('conn');

let isOn = false;

// Cập nhật giao diện theo trạng thái đèn
function render() {
  lamp.classList.toggle('on', isOn);
  document.body.classList.toggle('on', isOn);
  label.textContent = isOn ? 'BẬT' : 'TẮT';
}

function setStatus(text, cls, enabled) {
  connText.textContent = text;
  dot.className = 'dot ' + cls;
  lamp.disabled = !enabled;
}

// Kết nối tới broker, clientId ngẫu nhiên
const client = mqtt.connect(BROKER_URL, {
  username: USERNAME,
  password: PASSWORD,
  clientId: 'web_' + Math.random().toString(16).slice(2),
  reconnectPeriod: 3000
});

client.on('connect', () => {
  setStatus('Đã kết nối', 'ok', true);
  client.subscribe(TOPIC); // nghe lệnh để đồng bộ khi có thiết bị khác (MQTTX) gửi ON/OFF
});
client.on('reconnect', () => setStatus('Đang kết nối lại...', '', false));
client.on('close', () => setStatus('Mất kết nối', 'err', false));
client.on('error', (e) => {
  console.error('Lỗi MQTT:', e);
  setStatus('Lỗi kết nối', 'err', false);
});

// Đồng bộ trạng thái khi nhận lệnh từ nơi khác
client.on('message', (topic, payload) => {
  const msg = payload.toString().replace(/"/g, '').trim().toUpperCase();
  if (msg === 'ON') { isOn = true; render(); }
  if (msg === 'OFF') { isOn = false; render(); }
});

// Bấm vào bóng đèn: đảo trạng thái và gửi lệnh
lamp.addEventListener('click', () => {
  isOn = !isOn;
  render();
  client.publish(TOPIC, isOn ? 'ON' : 'OFF', { qos: 0 });
});

render();
