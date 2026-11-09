/* ========================================================
   FILE: Js/data/module/player.js
   MÔ TẢ: Module xử lý trình phát nhạc (Audio Player),
          thanh tiến trình, âm lượng và đồng bộ lời bài hát (Lyrics Sync)
======================================================== */

let currentSongIndex = 0;

const audio = document.getElementById('galaxyAudio');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const curTimeEl = document.getElementById('curTime');
const durTimeEl = document.getElementById('durTime');
const seekBarWrapper = document.getElementById('seekBarWrapper');
const seekProgress = document.getElementById('seekProgress');
const volSlider = document.getElementById('volSlider');
const volIcon = document.getElementById('volIcon');

const playerPanel = document.getElementById('playerPanel');
const playlistBanner = document.getElementById('playlistBanner');
const lyricsDisplay = document.getElementById('lyricsDisplay');
const playingSongTitle = document.getElementById('playingSongTitle');

// Định dạng thời gian từ giây sang mm:ss
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Tải bài hát theo chỉ số và tùy chọn phát ngay
function loadSong(index, shouldPlay = false) {
    if (typeof songs === 'undefined' || !songs[index]) return;

    currentSongIndex = index;
    const song = songs[currentSongIndex];

    // Gán đường dẫn file nhạc vào thẻ audio
    if (audio) {
        audio.src = song.src;
    }

    // Cập nhật tiêu đề bài hát đang chọn
    if (playingSongTitle) {
        playingSongTitle.innerText = song.title;
    }

    // Cập nhật trạng thái active trên danh sách bên trái
    const items = document.querySelectorAll('.song-item');
    items.forEach((item) => {
        const itemIdx = parseInt(item.dataset.index, 10);
        const icon = item.querySelector('.play-icon');
        if (itemIdx === currentSongIndex) {
            item.classList.add('active-song');
            if (icon) {
                icon.className = (shouldPlay && audio && !audio.paused)
                    ? 'fa-solid fa-pause play-icon'
                    : 'fa-solid fa-play play-icon';
            }
        } else {
            item.classList.remove('active-song');
            if (icon) icon.className = 'fa-solid fa-play play-icon';
        }
    });

    // Hiển thị các dòng lời bài hát
    if (lyricsDisplay) {
        lyricsDisplay.innerHTML = `
            <div class="lyrics-content" id="lyricsContent">
                ${song.lyrics.map((line, idx) => `<p class="lyric-line" id="lyric-${idx}">${line}</p>`).join('')}
            </div>
        `;
    }

    // Phát nhạc nếu được yêu cầu
    if (shouldPlay && audio) {
        audio.play().catch(err => {
            console.log("Chưa thể phát nhạc hoặc chưa tìm thấy file mp3:", err);
        });
    }
}

// Bật / Tạm dừng bài hát hiện tại
function togglePlay() {
    if (!audio) return;

    if (!audio.src || audio.src === window.location.href) {
        loadSong(currentSongIndex, true);
        return;
    }

    if (audio.paused) {
        audio.play().catch(err => {
            alert("Không thể phát file nhạc. Hãy đảm bảo bạn đã đặt file .mp3 vào đúng thư mục audio/ !");
        });
    } else {
        audio.pause();
    }
}

// Khởi tạo các sự kiện điều khiển trình phát nhạc
function initPlayerEvents() {
    if (!audio) return;

    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            loadSong(currentSongIndex, true);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            loadSong(currentSongIndex, true);
        });
    }

    // Khi nhạc bắt đầu phát
    audio.addEventListener('play', () => {
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
        if (playerPanel) playerPanel.classList.add('is-playing');
        if (playlistBanner) playlistBanner.classList.add('is-playing');

        const activeItem = document.querySelector(`.song-item[data-index="${currentSongIndex}"] .play-icon`);
        if (activeItem) activeItem.className = 'fa-solid fa-pause play-icon';
    });

    // Khi nhạc tạm dừng
    audio.addEventListener('pause', () => {
        if (playIcon) playIcon.className = 'fa-solid fa-play';
        if (playerPanel) playerPanel.classList.remove('is-playing');
        if (playlistBanner) playlistBanner.classList.remove('is-playing');

        const activeItem = document.querySelector(`.song-item[data-index="${currentSongIndex}"] .play-icon`);
        if (activeItem) activeItem.className = 'fa-solid fa-play play-icon';
    });

    // Cập nhật tiến trình & tự động cuộn dòng lời bài hát theo nhạc
    audio.addEventListener('timeupdate', () => {
        const current = audio.currentTime;
        const duration = audio.duration;

        if (curTimeEl) curTimeEl.innerText = formatTime(current);

        if (duration && !isNaN(duration)) {
            if (durTimeEl) durTimeEl.innerText = formatTime(duration);
            const percent = (current / duration) * 100;
            if (seekProgress) seekProgress.style.width = percent + '%';

            // Đồng bộ sáng câu hát và tự cuộn mượt mà
            const song = songs[currentSongIndex];
            if (song && song.lyrics && song.lyrics.length > 0) {
                const totalLines = song.lyrics.length;
                const lineIndex = Math.min(Math.floor((current / duration) * totalLines), totalLines - 1);

                document.querySelectorAll('.lyric-line').forEach((el, idx) => {
                    if (idx === lineIndex) {
                        if (!el.classList.contains('active')) {
                            el.classList.add('active');
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        el.classList.remove('active');
                    }
                });
            }
        }
    });

    // Khi nạp xong metadata của file âm thanh
    audio.addEventListener('loadedmetadata', () => {
        if (durTimeEl) durTimeEl.innerText = formatTime(audio.duration);
    });

    // Tự động chuyển sang bài tiếp theo khi kết thúc
    audio.addEventListener('ended', () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex, true);
    });

    // Tua nhạc khi click vào thanh tiến trình
    if (seekBarWrapper) {
        seekBarWrapper.addEventListener('click', (e) => {
            const rect = seekBarWrapper.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            if (audio.duration) {
                audio.currentTime = (clickX / width) * audio.duration;
            }
        });
    }

    // Điều chỉnh âm lượng
    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            audio.volume = val;
            if (!volIcon) return;
            if (val === 0) {
                volIcon.className = 'fa-solid fa-volume-xmark';
            } else if (val < 0.5) {
                volIcon.className = 'fa-solid fa-volume-low';
            } else {
                volIcon.className = 'fa-solid fa-volume-high';
            }
        });
    }
}
