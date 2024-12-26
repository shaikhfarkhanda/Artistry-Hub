// main.js - Main functionality

// Slideshow functionality
let slideIndex = 0;
showSlides();

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    if (!slides.length) return;

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        if (dots[i]) dots[i].classList.remove("active");
    }

    // Increment slideIndex
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;

    // Show current slide
    slides[slideIndex - 1].style.display = "block";
    if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add("active");

    // Auto change slide
    setTimeout(showSlides, 3000);
}

// Manual slide navigation
function currentSlide(n) {
    showSlideNumber(n);
}

function plusSlides(n) {
    showSlideNumber(slideIndex + n);
}

function showSlideNumber(n) {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    if (!slides.length) return;

    // Adjust slideIndex
    if (n > slides.length) n = 1;
    if (n < 1) n = slides.length;
    slideIndex = n - 1;

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        if (dots[i]) dots[i].classList.remove("active");
    }

    // Show selected slide
    slides[slideIndex].style.display = "block";
    if (dots[slideIndex]) dots[slideIndex].classList.add("active");
}

// Search functionality
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const searchText = searchInput.value.trim();
    if (searchText === '') {
        alert('Please enter a search term.');
        return;
    }

    // Call API with search term
    fetch(`http://localhost:3000/api/art/artworks?search=${encodeURIComponent(searchText)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayArtworks(data.artworks);
            } else {
                console.error('No artworks found:', data.message);
                alert('No artworks found for the given search term.');
            }
        })
        .catch(error => console.error('Error fetching search results:', error));
}

// Display artworks in gallery
function displayArtworks(artworks) {
    const galleryContainer = document.getElementById('gallery');
    if (!galleryContainer) return;

    if (!artworks?.length) {
        galleryContainer.innerHTML = '<p>No artworks found.</p>';
        return;
    }

    galleryContainer.innerHTML = artworks.map(artwork => `
        <div class="artwork-card">
            <img src="${artwork.image_url}" alt="${artwork.title}">
            <div class="artwork-info">
                <h3>${artwork.title}</h3>
                <p>${artwork.description || ''}</p>
                <p class="price">Price: ₹${artwork.price.toFixed(2)}</p>
                <button onclick="viewArtwork(${artwork.artwork_id})" class="view-btn">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Add event listeners when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize slideshow if exists
    if (document.getElementsByClassName("mySlides").length) {
        showSlides();
    }

    // Setup search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', debounce((e) => {
            if (e.key === 'Enter') handleSearch();
        }, 300));
    }
});