// Simple, accessible slider & basic interactions for Can Perde & Mefruşat

document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
    initContactButtons();
    initNavigationToggle();
    initBlogCarousel();
    initBlogModal();
});

function initHeroSlider() {
    const slider = document.querySelector(".slider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll("img"));
    if (slides.length <= 1) {
        // If only one image, just show it
        slides.forEach((img) => img.classList.add("is-active"));
        return;
    }

    let currentIndex = 0;
    const intervalMs = 5000;

    // Ensure one active at start BEFORE enabling enhanced layered mode
    slides.forEach((img, index) => {
        const isActive = index === 0;
        img.classList.toggle("is-active", isActive);
        img.classList.toggle("active", isActive);
    });

    // Mark slider as enhanced so CSS can switch to layered/animated mode
    // Doing this after setting the first active slide avoids any initial flash/layout jump.
    slider.classList.add("is-enhanced");

    // Respect prefers-reduced-motion for users who opt out of animation
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        return;
    }

    setInterval(() => {
        slides[currentIndex].classList.remove("is-active");
        slides[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add("is-active");
        slides[currentIndex].classList.add("active");
    }, intervalMs);
}

function initContactButtons() {
    const phoneContainer = document.querySelector(".phone");
    if (!phoneContainer) return;

    const buttons = phoneContainer.querySelectorAll("button");
    if (buttons.length === 0) return;

    // Button order in HTML:
    // 1. Phone
    // 2. WhatsApp
    // 3. Instagram

    const [phoneBtn, whatsappBtn, instagramBtn] = buttons;

    if (phoneBtn) {
        phoneBtn.addEventListener("click", () => {
            // Replace with your real phone number
            window.location.href = "tel:+905535242773";
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", () => {
            // Replace with your real WhatsApp number if needed
            const phone = "905535242773";
            const message = encodeURIComponent("Merhaba, Can Perde & Mefruşat için bilgi almak istiyorum.");
            window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
        });
    }

    if (instagramBtn) {
        instagramBtn.addEventListener("click", () => {
            // Replace with your real Instagram handle
            window.open("https://www.instagram.com/can.mefrusatkeremunal/", "_blank", "noopener");

        });
    }
}

function initNavigationToggle() {
    const header = document.querySelector(".header");
    const menuLogo = document.querySelector(".menu-logo");
    const menu = document.querySelector(".menu");

    if (!header || !menuLogo || !menu) return;

    // Create a dedicated hamburger button without changing the HTML file
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-label", "Menüyü aç/kapat");
    toggle.setAttribute("aria-expanded", "false");

    // Inner span used for the middle bar (other bars are via ::before/::after)
    const bar = document.createElement("span");
    toggle.appendChild(bar);

    // Insert toggle between logo and menu for natural layout
    menuLogo.insertBefore(toggle, menu);

    const closeMenu = () => {
        if (header.classList.contains("nav-open")) {
            header.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
        }
    };

    toggle.addEventListener("click", () => {
        const isOpen = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when a nav link is clicked (on small screens)
    menu.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.matches("a")) {
            closeMenu();
        }
    });

    // Ensure menu is closed again when resizing back to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
}

function initBlogCarousel() {
    const carousel = document.querySelector(".blog-carousel");
    const track = document.querySelector(".blog-track");
    if (!carousel || !track) return;

    const cards = Array.from(track.querySelectorAll(".blog-card"));
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = 5000;

    let currentIndex = 0;
    let intervalId = null;
    let cleanupScrollSnap = null;

    function getMode() {
        // Mobile: native horizontal swipe + CSS scroll-snap
        return window.innerWidth < 768 ? "scroll" : "transform";
    }

    function getVisibleBlogCount() {
        return window.innerWidth >= 900 ? 3 : 1;
    }

    function stopAutoplay() {
        if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    }

    function enableTransformCarousel() {
        if (cleanupScrollSnap) {
            cleanupScrollSnap();
            cleanupScrollSnap = null;
        }

        const visibleCount = getVisibleBlogCount();
        track.style.setProperty("--blog-visible", String(visibleCount));

        const updateCarousel = () => {
            const total = cards.length;
            const maxIndex = Math.max(0, total - visibleCount);

            if (currentIndex > maxIndex) {
                currentIndex = 0;
            }

            // Translate track based on current index and visible count
            const offsetPercent = (100 / visibleCount) * currentIndex;
            track.style.transform = `translateX(-${offsetPercent}%)`;
        };

        updateCarousel();

        stopAutoplay();
        if (!prefersReducedMotion) {
            intervalId = window.setInterval(() => {
                const total = cards.length;
                const maxIndex = Math.max(0, total - visibleCount);
                currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
                updateCarousel();
            }, intervalMs);
        }
    }

    function enableScrollSnapCarousel() {
        stopAutoplay();

        // Ensure transform-based positioning is not fighting with native scrolling
        track.style.transform = "none";
        track.style.setProperty("--blog-visible", "1");

        const getNearestIndex = () => {
            const targetCenter = carousel.scrollLeft + carousel.clientWidth / 2;
            let bestIndex = 0;
            let bestDistance = Number.POSITIVE_INFINITY;

            for (let i = 0; i < cards.length; i += 1) {
                const card = cards[i];
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(cardCenter - targetCenter);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = i;
                }
            }
            return bestIndex;
        };

        const scrollCardToCenter = (index, behavior = "smooth") => {
            const card = cards[index];
            if (!card) return;

            const left = card.offsetLeft + card.offsetWidth / 2 - carousel.clientWidth / 2;
            carousel.scrollTo({
                left,
                behavior: prefersReducedMotion ? "auto" : behavior,
            });
        };

        // Center the first card on load (after layout settles)
        requestAnimationFrame(() => {
            scrollCardToCenter(currentIndex, "auto");
        });

        // Debounced "snap to nearest" to make the centered state feel crisp on all browsers
        let snapTimer = null;
        const onScroll = () => {
            if (snapTimer) window.clearTimeout(snapTimer);
            snapTimer = window.setTimeout(() => {
                const nearest = getNearestIndex();
                currentIndex = nearest;
                scrollCardToCenter(nearest, "smooth");
            }, 140);
        };

        carousel.addEventListener("scroll", onScroll, { passive: true });

        cleanupScrollSnap = () => {
            if (snapTimer) window.clearTimeout(snapTimer);
            carousel.removeEventListener("scroll", onScroll);
        };
    }

    // Initial setup
    if (getMode() === "scroll") {
        enableScrollSnapCarousel();
    } else {
        enableTransformCarousel();
    }

    // Adapt to viewport changes (desktop/tablet: transform carousel, mobile: scroll snap)
    window.addEventListener("resize", () => {
        const mode = getMode();
        if (mode === "scroll") {
            enableScrollSnapCarousel();
        } else {
            enableTransformCarousel();
        }
    });
}

function initBlogModal() {
    const modalOverlay = document.getElementById("blog-modal");
    if (!modalOverlay) return;

    const dialog = modalOverlay.querySelector(".blog-modal-dialog");
    const closeBtn = modalOverlay.querySelector(".blog-modal-close");
    const imgEl = modalOverlay.querySelector("#blog-modal-image");
    const titleEl = modalOverlay.querySelector("#blog-modal-title");
    const textEl = modalOverlay.querySelector("#blog-modal-text");

    if (!dialog || !closeBtn || !imgEl || !titleEl || !textEl) return;

    const openModal = (imageSrc, imageAlt, title, text) => {
        imgEl.src = imageSrc;
        imgEl.alt = imageAlt || title || "";
        titleEl.textContent = title || "";
        textEl.textContent = text || "";

        modalOverlay.classList.add("is-visible");
        document.body.classList.add("blog-modal-open");
        modalOverlay.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
        modalOverlay.classList.remove("is-visible");
        document.body.classList.remove("blog-modal-open");
        modalOverlay.setAttribute("aria-hidden", "true");
    };

    // Wire up all "Devamını Oku" buttons
    const readMoreButtons = document.querySelectorAll(".blog-read-more");
    readMoreButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".blog-card");
            if (!card) return;

            const img = card.querySelector("img");
            const title = card.querySelector("h3");
            const paragraph = card.querySelector("p");

            const imageSrc = img ? img.src : "";
            const imageAlt = img ? img.alt : "";
            const titleText = title ? title.textContent || "" : "";
            const bodyText = paragraph ? paragraph.textContent || "" : "";

            openModal(imageSrc, imageAlt, titleText, bodyText);
        });
    });

    // Close button
    closeBtn.addEventListener("click", () => {
        closeModal();
    });

    // Click outside dialog to close
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // Optional: Escape key to close
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modalOverlay.classList.contains("is-visible")) {
            closeModal();
        }
    });
}

function initSearchBar() {
    const searchInput = document.querySelector(".footer-search input[type='search']");
    const searchBtn = document.querySelector(".footer-search .search-btn");
    
    if (!searchInput || !searchBtn) return;

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            // Simple search implementation - you can enhance this later
            // For now, it will search within the page content
            const searchTerms = query.toLowerCase().split(/\s+/);
            const allText = document.body.innerText.toLowerCase();
            const found = searchTerms.every(term => allText.includes(term));
            
            if (found) {
                // Scroll to first match or show results
                // This is a basic implementation - can be enhanced with highlighting
                alert(`"${query}" için arama yapılıyor...`);
            } else {
                alert(`"${query}" için sonuç bulunamadı.`);
            }
        }
    };

    searchBtn.addEventListener("click", performSearch);
    
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            performSearch();
        }
    });
}
