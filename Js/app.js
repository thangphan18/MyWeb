/* ========================================================
   FILE: Js/app.js
   MÔ TẢ: File điều phối trung tâm (Main Application Controller)
          Khởi chạy toàn bộ các module & xử lý chuyển đổi Tab
======================================================== */

// Chức năng chuyển đổi giữa các Tab (Về Tôi & Playlist)
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    const tablinks = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    const target = document.getElementById(tabName);
    if (target) {
        target.classList.add("active");
    }

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Khởi tạo toàn bộ hệ thống khi DOM đã sẵn sàng
function initApp() {
    // 1. Khởi tạo hiệu ứng bầu trời sao & sao băng
    if (typeof initSpaceBackground === 'function') {
        initSpaceBackground();
    }

    // 2. Kiểm tra trạng thái đăng nhập cổng bảo mật
    if (typeof checkAuthStatus === 'function') {
        checkAuthStatus();
    }

    // 3. Khởi tạo sự kiện trình phát nhạc Audio Player
    if (typeof initPlayerEvents === 'function') {
        initPlayerEvents();
    }

    // 4. Khởi tạo thanh tìm kiếm và hiển thị danh sách bài hát
    if (typeof initSearchEvents === 'function') {
        initSearchEvents();
    }
    if (typeof filterSongs === 'function') {
        filterSongs('');
    }

    // 5. Nạp sẵn bài hát đầu tiên vào trình phát
    if (typeof loadSong === 'function') {
        loadSong(0, false);
    }
}

// Lắng nghe sự kiện tải trang hoàn tất
window.addEventListener('DOMContentLoaded', initApp);
