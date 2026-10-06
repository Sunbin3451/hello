const giftBox = document.getElementById('giftBox');
const giftSection = document.getElementById('giftSection');
const cardSection = document.getElementById('cardSection');
const replayBtn = document.getElementById('replayBtn'); // Nút "Xem tiếp đi" ở màn hình chú mèo
const cakeSection = document.getElementById('cakeSection'); // Màn hình bánh kem
const hornAudio = document.getElementById('hornAudio');
const songAudio = document.getElementById('songAudio');
const balloonsContainer = document.getElementById('balloonsContainer');
const pageTitle = document.getElementById('pageTitle');
const bodyElement = document.body;

let songTimer = null;
let fadeInterval = null;
let balloonsCreated = false;

function fadeInAudio(audioElement, targetVolume = 0.7, duration = 2000) {
    // Xóa interval fade cũ nếu có
    if (fadeInterval) clearInterval(fadeInterval);

    audioElement.volume = 0;
    const stepTime = 50;
    const stepAmount = targetVolume / (duration / stepTime);

    fadeInterval = setInterval(() => {
        if (audioElement.volume + stepAmount < targetVolume) {
            audioElement.volume += stepAmount;
        } else {
            audioElement.volume = targetVolume;
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
    }, stepTime);
}

// Hàm tạo hiệu ứng bóng bay (chỉ gọi khi mở quà)
function createBalloons() {
    if (balloonsCreated) return; // Chỉ tạo 1 lần
    balloonsCreated = true;

    const colors = ['#ff4d4d', '#ffeb3b', '#19DD89', '#f472b6', '#34d399', '#facc15', '#f97316', '#3b82f6', '#8b5cf6', '#E9E9E9', '#FF3940', '#F237FF'];
    const balloonCount = window.innerWidth < 768 ? 25 : 45;

    for (let i = 0; i < balloonCount; i++) {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');

        const step = 100 / balloonCount;
        const randomOffset = (Math.random() - 0.5) * (step * 0.8);
        const leftPosition = Math.max(2, Math.min(96, (i * step) + (step / 2) + randomOffset));

        balloon.style.left = `${leftPosition}vw`;

        balloon.style.animationDuration = `${12 + Math.random() * 10}s`;
        balloon.style.animationDelay = `${Math.random() * 8}s`;
        balloon.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        balloonsContainer.appendChild(balloon);
    }
}

// Xử lý mở quà
function openGift() {
    if (giftBox.classList.contains('open')) return;

    // 1. Đổi title và background
    pageTitle.innerText = "Chúc Mừng Sinh Nhật";
    bodyElement.classList.remove('dark-mode');
    bodyElement.classList.add('party-mode');

    // 2. Tạo hiệu ứng bóng bay
    createBalloons();

    // 3. Mở nắp hộp quà
    giftBox.classList.add('open');

    // 4. Phát tiếng còi tiệc NGAY LẬP TỨC
    hornAudio.currentTime = 0;
    hornAudio.volume = 0.5;
    hornAudio.play().catch(err => console.log("Lỗi phát còi tiệc:", err));

    // 5. Trì hoãn bài hát sinh nhật 1.5 giây (1500ms)
    clearTimeout(songTimer);
    songTimer = setTimeout(() => {
        songAudio.currentTime = 0;
        songAudio.volume = 0; // Khởi đầu bằng 0
        songAudio.play().then(() => {
            // Tăng dần âm lượng lên 0.2 trong vòng 3.5 giây (3500ms)
            fadeInAudio(songAudio, 0.2, 3500);
        }).catch(err => console.log("Lỗi phát bài hát sinh nhật:", err));
    }, 1500);

    // 6. Bắn pháo hoa giấy (Confetti)
    triggerConfetti();

    // 7. Chuyển sang màn hình thiệp chúc mừng
    setTimeout(() => {
        giftSection.classList.add('hidden');
        cardSection.classList.remove('hidden');
    }, 600);
}

giftBox.addEventListener('click', openGift);
giftBox.addEventListener('touchstart', (e) => {
    e.preventDefault();
    openGift();
});

// Bấm nút "Xem tiếp đi" -> Ẩn thiệp chú mèo, hiện bánh kem giữa màn hình
replayBtn.addEventListener('click', () => {
    cardSection.classList.add('hidden');
    if (cakeSection) {
        cakeSection.classList.remove('hidden');
        triggerConfetti();
    }
});

// Nút xem lại từ đầu ở màn hình bánh kem (nếu người xem muốn quay về hộp quà & nền tối ban đầu)
const restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        cakeSection.classList.add('hidden');
        giftSection.classList.remove('hidden');
        giftBox.classList.remove('open');

        clearTimeout(songTimer);
        if (fadeInterval) clearInterval(fadeInterval);
        hornAudio.pause();
        hornAudio.currentTime = 0;
        songAudio.pause();
        songAudio.currentTime = 0;
        songAudio.volume = 0;

        pageTitle.innerText = "???";
        bodyElement.classList.remove('party-mode');
        bodyElement.classList.add('dark-mode');

        balloonsContainer.innerHTML = '';
        balloonsCreated = false;
    });
}

// Bắt sự kiện cho nút quay lại ở màn hình bánh kem (nếu có)
if (cakeSection) {
    const finalReplayBtn = cakeSection.querySelector('.replay-btn');
    if (finalReplayBtn) {
        finalReplayBtn.addEventListener('click', resetToBeginning);
    }
}

function triggerConfetti() {
    var duration = 2.5 * 1000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}