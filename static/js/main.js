document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-btn');
    const tiktokUrl = document.getElementById('tiktok-url');
    const resultContainer = document.getElementById('result-container');
    const errorBox = document.getElementById('error-box');
    const errorText = document.getElementById('error-text');
    const pasteBtn = document.getElementById('paste-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    downloadBtn.addEventListener('click', async () => {
        const url = tiktokUrl.value.trim();

        if (!url) {
            showError("Please paste a TikTok URL first!");
            return;
        }

        // Start loading
        setLoading(true);
        hideError();
        resultContainer.innerHTML = '';

        try {
            const response = await fetch('/api/v1/tiktok/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle API error structure
                const errorMsg = data.detail ? (typeof data.detail === 'string' ? data.detail : data.detail.message) : 'Failed to extract video';
                throw new Error(errorMsg);
            }

            // Success! Render video card
            renderResult(data.video);

        } catch (error) {
            showError(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    });

    // Paste Functionality
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                tiktokUrl.value = text;
                // Add a small animation effect
                pasteBtn.style.transform = 'scale(0.9)';
                setTimeout(() => pasteBtn.style.transform = 'scale(1)', 100);
            } catch (err) {
                showError("Unable to paste. Please allow clipboard access.");
            }
        });
    }

    // Theme Toggle Functionality
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            downloadBtn.classList.add('btn-loading');
            downloadBtn.disabled = true;
        } else {
            downloadBtn.classList.remove('btn-loading');
            downloadBtn.disabled = false;
        }
    }

    function showError(msg) {
        errorText.innerText = msg;
        errorBox.style.display = 'flex';
    }

    function hideError() {
        errorBox.style.display = 'none';
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    }

    function renderResult(video) {
        const firstChar = video.author.charAt(0).toUpperCase();
        // Generate proxy URL with fallback support
        let proxyUrl = `/api/v1/tiktok/proxy?url=${encodeURIComponent(video.mp4_url)}&filename=tiktok_${video.video_id}.mp4`;

        if (video.alternative_urls && video.alternative_urls.length > 0) {
            const altStr = video.alternative_urls.join(',');
            proxyUrl += `&alt_urls=${encodeURIComponent(altStr)}`;
        }

        if (video.cookies) {
            proxyUrl += `&cookies=${encodeURIComponent(video.cookies)}`;
        }

        const html = `
            <div class="video-card">
                <div class="card-header">
                    <div class="author-avatar">${firstChar}</div>
                    <div class="author-info">
                        <h4>@${video.author}</h4>
                        <p>TikTok Creator</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="caption">${video.caption || 'No caption provided.'}</div>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <i class="fas fa-play" style="color: var(--secondary); font-size: 0.8rem; margin-bottom: 0.5rem; display: block;"></i>
                            <span>${formatNumber(video.play_count || 0)}</span>
                            <label>Plays</label>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-heart" style="color: var(--primary); font-size: 0.8rem; margin-bottom: 0.5rem; display: block;"></i>
                            <span>${formatNumber(video.like_count || 0)}</span>
                            <label>Likes</label>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-share" style="color: #7c3aed; font-size: 0.8rem; margin-bottom: 0.5rem; display: block;"></i>
                            <span>${formatNumber(video.share_count || 0)}</span>
                            <label>Shares</label>
                        </div>
                    </div>

                    <a href="${proxyUrl}" class="download-link">
                        <i class="fas fa-download"></i> Download Video
                    </a>
                    <p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 1rem;">
                        High quality MP4 ready for download.
                    </p>
                </div>
            </div>
        `;

        resultContainer.innerHTML = html;

        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
