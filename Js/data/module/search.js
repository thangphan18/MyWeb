/* ========================================================
   FILE: Js/data/module/search.js
   MÔ TẢ: Module xử lý tìm kiếm bài hát thời gian thực
          (hỗ trợ cả tiếng Việt có dấu và không dấu)
======================================================== */

const songListContainer = document.getElementById('songList');
const songCountBadge = document.getElementById('songCountBadge');
const songSearchInput = document.getElementById('songSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Chuẩn hóa chuỗi tiếng Việt về không dấu để so khớp chính xác
function removeVietnameseTones(str) {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Làm nổi bật từ khóa tìm kiếm trên tên bài hát
function highlightMatch(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const safeKey = escapeRegex(keyword.trim());
    if (!safeKey) return escapeHtml(text);
    const regex = new RegExp(`(${safeKey})`, 'gi');
    return escapeHtml(text).replace(regex, '<span class="highlight-text">$1</span>');
}

// Render danh sách bài hát ra khung HTML
function renderSongsList(listItems, keyword = "") {
    if (!songListContainer) return;
    songListContainer.innerHTML = '';

    if (listItems.length === 0) {
        if (songCountBadge) songCountBadge.innerText = `0 / ${songs.length} bài`;
        songListContainer.innerHTML = `
            <div class="no-results-state">
                <i class="fa-solid fa-satellite-dish"></i>
                <p class="no-res-title">Không tìm thấy bài hát</p>
                <span class="no-res-sub">Không có bài hát nào khớp với từ khóa "<strong>${escapeHtml(keyword)}</strong>"</span>
                <button type="button" class="clear-filter-btn" onclick="clearSongSearch()">
                    <i class="fa-solid fa-rotate-left"></i> Xem tất cả bài hát
                </button>
            </div>
        `;
        return;
    }

    if (songCountBadge) {
        if (keyword) {
            songCountBadge.innerText = `Tìm thấy ${listItems.length} / ${songs.length} bài`;
        } else {
            songCountBadge.innerText = `${songs.length} bài`;
        }
    }

    listItems.forEach(({ song, originalIdx }, displayIndex) => {
        const div = document.createElement('div');
        const isPlayingThis = (originalIdx === currentSongIndex);
        div.className = 'song-item' + (isPlayingThis ? ' active-song' : '');
        div.dataset.index = originalIdx;

        const displayNum = (displayIndex + 1 < 10) ? `0${displayIndex + 1}` : `${displayIndex + 1}`;
        const isPaused = audio ? audio.paused : true;
        const iconClass = (isPlayingThis && !isPaused) ? 'fa-solid fa-pause play-icon' : 'fa-solid fa-play play-icon';

        div.innerHTML = `
            <div class="song-meta">
                <span class="track-number">${displayNum}</span>
                <div class="song-info">
                    <span class="song-name">${highlightMatch(song.title, keyword)}</span>
                    <span class="song-sub">Stereo • Hi-Fi Cosmic</span>
                </div>
            </div>
            <i class="${iconClass}"></i>
        `;

        div.onclick = function() {
            if (currentSongIndex === originalIdx) {
                togglePlay();
            } else {
                loadSong(originalIdx, true);
            }
        };

        songListContainer.appendChild(div);
    });
}

// Lọc danh sách bài hát theo từ khóa
function filterSongs(keyword) {
    if (typeof songs === 'undefined') return;
    const rawKey = keyword ? keyword.trim() : "";
    const cleanKey = removeVietnameseTones(rawKey);

    if (!cleanKey) {
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        const allItems = songs.map((s, idx) => ({ song: s, originalIdx: idx }));
        renderSongsList(allItems, "");
        return;
    }

    if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    const matches = [];
    songs.forEach((s, idx) => {
        const titleClean = removeVietnameseTones(s.title);
        if (titleClean.includes(cleanKey)) {
            matches.push({ song: s, originalIdx: idx });
        }
    });

    renderSongsList(matches, rawKey);
}

// Xóa từ khóa tìm kiếm và hiển thị lại toàn bộ danh sách
function clearSongSearch() {
    if (songSearchInput) {
        songSearchInput.value = '';
        songSearchInput.focus();
    }
    filterSongs('');
}

// Khởi tạo sự kiện thanh tìm kiếm
function initSearchEvents() {
    if (songSearchInput) {
        songSearchInput.addEventListener('input', (e) => {
            filterSongs(e.target.value);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSongSearch);
    }
}
