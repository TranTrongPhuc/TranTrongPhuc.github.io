document.addEventListener("DOMContentLoaded", function() {
    const albums = document.querySelectorAll('.album-content');

    albums.forEach(album => {
        const images = Array.from(album.querySelectorAll('img'));
        
        if (images.length > 5) {
            // Shuffle and pick the first 10 images
            const shuffledImages = shuffle(images).slice(0, 5);
            album.innerHTML = ''; // Clear existing images
            shuffledImages.forEach(img => {
                album.appendChild(img);
            });
        }
    });

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const caption = document.getElementById('caption');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    let currentImageIndex = 0;
    let currentAlbumImages = [];

    albums.forEach(album => {
        album.addEventListener('click', (event) => {
            if (event.target.tagName === 'IMG') {
                currentAlbumImages = Array.from(album.querySelectorAll('img'));
                currentImageIndex = currentAlbumImages.indexOf(event.target);

                lightbox.style.display = 'block';
                updateLightboxImage();
            }
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : currentAlbumImages.length - 1;
        updateLightboxImage();
    });

    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex < currentAlbumImages.length - 1) ? currentImageIndex + 1 : 0;
        updateLightboxImage();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg) {
            lightbox.style.display = 'none';
        }
    });

    function updateLightboxImage() {
        const currentImage = currentAlbumImages[currentImageIndex];
        lightboxImg.src = currentImage.src;
        caption.textContent = currentImage.alt;
    }
});
