/* ========================================================
   FILE: Js/data/module/space.js
   MÔ TẢ: Module xử lý hiệu ứng bầu trời sao lấp lánh
          và sao băng (Shooting Stars) bằng HTML5 Canvas
======================================================== */

const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let stars = [];
let shootingStars = [];
let width = canvas ? (canvas.width = window.innerWidth) : 0;
let height = canvas ? (canvas.height = window.innerHeight) : 0;

// Khởi tạo các hạt sao ngẫu nhiên
function initStars() {
    if (!canvas) return;
    stars = [];
    const starCount = Math.floor((width * height) / 2800);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.8 + 0.3,
            alpha: Math.random() * 0.8 + 0.2,
            speed: Math.random() * 0.02 + 0.005,
            hue: Math.random() > 0.8 ? 270 : (Math.random() > 0.5 ? 200 : 0)
        });
    }
}

// Tạo sao băng ngẫu nhiên trên bầu trời
function createShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.4,
            length: Math.random() * 80 + 40,
            speed: Math.random() * 7 + 4,
            angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
            opacity: 1
        });
    }
}

// Vòng lặp vẽ hiệu ứng thiên hà (60fps)
function renderGalaxy() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Vẽ các vì sao lấp lánh
    for (let star of stars) {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        if (star.hue === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
        } else {
            ctx.fillStyle = `hsla(${star.hue}, 80%, 75%, ${Math.abs(star.alpha)})`;
        }
        ctx.fill();
    }

    // Vẽ vệt sao băng
    createShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(180, 220, 255, ${s.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.015;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
            shootingStars.splice(i, 1);
        }
    }

    requestAnimationFrame(renderGalaxy);
}

// Hàm khởi chạy nền vũ trụ
function initSpaceBackground() {
    if (!canvas) return;
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initStars();
    });
    initStars();
    renderGalaxy();
}
