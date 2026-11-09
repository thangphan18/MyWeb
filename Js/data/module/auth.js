/* ========================================================
   FILE: Js/data/module/auth.js
   MÔ TẢ: Module xử lý xác thực người dùng, đăng nhập,
          đăng xuất và cổng khóa bảo mật (Cosmic Gate)
======================================================== */

const gateScreen = document.getElementById('cosmicGateScreen');
const webAppMain = document.getElementById('webAppMain');
const userNameDisplay = document.getElementById('userNameDisplay');

// Kiểm tra trạng thái đăng nhập hiện tại
function checkAuthStatus() {
    localStorage.removeItem('galaxySessionUser');

    const savedSession = sessionStorage.getItem('galaxyGateAuth') || localStorage.getItem('galaxyGateAuth');
    if (savedSession) {
        try {
            const user = JSON.parse(savedSession);
            unlockWebsite(user, false);
            return;
        } catch (e) {
            lockWebsite();
        }
    }
    lockWebsite();
}

// Khóa website, bắt buộc đăng nhập
function lockWebsite() {
    document.body.classList.add('is-locked');
    if (gateScreen) {
        gateScreen.style.display = 'flex';
        gateScreen.classList.remove('fade-out');
    }
    if (webAppMain) {
        webAppMain.style.display = 'none';
    }
}

// Mở khóa website khi đăng nhập thành công
function unlockWebsite(user, animate = true) {
    if (userNameDisplay) {
        userNameDisplay.innerText = user.username || 'Chỉ Huy';
    }

    if (animate && gateScreen && webAppMain) {
        gateScreen.classList.add('fade-out');
        setTimeout(() => {
            gateScreen.style.display = 'none';
            webAppMain.style.display = 'block';
            document.body.classList.remove('is-locked');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
    } else if (gateScreen && webAppMain) {
        gateScreen.style.display = 'none';
        webAppMain.style.display = 'block';
        document.body.classList.remove('is-locked');
    }
}

// Xử lý sự kiện nhấn nút Đăng nhập
function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const rememberMe = document.getElementById('rememberMeCheckbox').checked;
    const loginBtn = document.getElementById('loginBtn');

    if (!username || !password) {
        showAlert('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!', 'error');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ĐANG XÁC THỰC DANH TÍNH...`;

    setTimeout(() => {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
            <span class="btn-text">XÁC THỰC & MỞ KHÓA WEB</span>
            <span class="btn-flare"></span>
            <i class="fa-solid fa-door-open"></i>
        `;

        const user = {
            username: username,
            loginTime: new Date().toLocaleTimeString()
        };

        if (rememberMe) {
            localStorage.setItem('galaxyGateAuth', JSON.stringify(user));
        } else {
            sessionStorage.setItem('galaxyGateAuth', JSON.stringify(user));
            localStorage.removeItem('galaxyGateAuth');
        }

        showAlert(`Xác thực thành công! Đang giải mã cổng vào hệ thống...`, 'success');

        setTimeout(() => {
            unlockWebsite(user, true);
        }, 800);
    }, 800);
}

// Điền nhanh thông tin tài khoản mẫu
function autofillDemo() {
    document.getElementById('usernameInput').value = 'CosmicCommander';
    document.getElementById('passwordInput').value = 'Galaxy2026@Pass';
    showAlert('Đã nạp thông tin tài khoản mẫu! Nhấn MỞ KHÓA để truy cập.', 'info');
}

// Hiển thị thông báo trên cổng đăng nhập
function showAlert(msg, type = 'success') {
    const alertBox = document.getElementById('loginAlert');
    if (!alertBox) return;
    alertBox.style.display = 'flex';
    alertBox.className = `alert-box alert-${type} fade-in`;
    alertBox.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info')}"></i>
        <span>${msg}</span>
    `;
}

// Ẩn / Hiện mật khẩu
function togglePasswordVisibility() {
    const pwdInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eyeIcon');
    if (!pwdInput || !eyeIcon) return;

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// Xử lý Đăng xuất & khóa lại website
function handleLogout() {
    localStorage.removeItem('galaxyGateAuth');
    sessionStorage.removeItem('galaxyGateAuth');
    localStorage.removeItem('galaxySessionUser');

    // Tạm dừng nhạc nếu đang phát khi đăng xuất
    if (typeof audio !== 'undefined' && audio && !audio.paused) {
        audio.pause();
    }

    const form = document.getElementById('galaxyLoginForm');
    if (form) form.reset();

    const alertBox = document.getElementById('loginAlert');
    if (alertBox) alertBox.style.display = 'none';

    lockWebsite();
}
