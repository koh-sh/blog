document.addEventListener('DOMContentLoaded', async function() {
    const previews = document.querySelectorAll('.link-preview');
    
    for (const preview of previews) {
        const url = preview.dataset.url;
        if (!url) continue;

        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            
            const text = await response.text();
            const doc = new DOMParser().parseFromString(text, 'text/html');
            
            // タイトルを取得
            const titleElement = preview.querySelector('.link-preview-title');
            if (titleElement && titleElement.textContent === url) {
                const ogTitle = doc.querySelector('meta[property="og:title"]')?.content;
                const pageTitle = doc.querySelector('title')?.textContent;
                if (ogTitle || pageTitle) {
                    titleElement.textContent = ogTitle || pageTitle;
                }
            }

            // 説明文を取得
            const description = doc.querySelector('meta[property="og:description"]')?.content;
            if (description && !preview.querySelector('.link-preview-description')) {
                const descElement = document.createElement('p');
                descElement.className = 'link-preview-description';
                descElement.textContent = description;
                preview.querySelector('.link-preview-text').insertBefore(
                    descElement,
                    preview.querySelector('.link-preview-url')
                );
            }

            // 画像を取得
            const ogImage = doc.querySelector('meta[property="og:image"]')?.content;
            if (ogImage && !preview.querySelector('.link-preview-image')) {
                const container = preview.querySelector('.link-preview-content');
                const img = document.createElement('img');
                img.src = ogImage;
                img.alt = titleElement.textContent;
                img.className = 'link-preview-image';
                img.loading = 'lazy';
                container.appendChild(img);
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        }
    }
});