document.addEventListener("DOMContentLoaded", function () {

    // ===== DARK MODE =====
    const darkBtn = document.getElementById("darkModeBtn");
    const body = document.body;

    if (localStorage.getItem("tema") === "dark") {
        body.classList.add("dark-mode");
        if (darkBtn) darkBtn.textContent = "☀️";
    } else {
        if (darkBtn) darkBtn.textContent = "🌙";
    }

    if (darkBtn) {
        darkBtn.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            if (body.classList.contains("dark-mode")) {
                darkBtn.textContent = "☀️";
                localStorage.setItem("tema", "dark");
            } else {
                darkBtn.textContent = "🌙";
                localStorage.setItem("tema", "light");
            }
        });
    }

    // ===== MOBİL MENÜ =====
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // ===== FORM VALIDATION =====
    const iletisimForm = document.getElementById("iletisimForm");
    if (iletisimForm) {
        iletisimForm.addEventListener("submit", function (e) {
            e.preventDefault();
            formKontrol();
        });
    }

    function formKontrol() {
        let gecerli = true;
        const alanlar = ["adSoyad", "email", "konu", "mesaj"];
        const emailKurali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        alanlar.forEach(id => {
            const input = document.getElementById(id);
            const hata = document.getElementById(id + "Hata");
            const deger = input.value.trim();

            if (deger === "") {
                hataGoster(input, hata, "Bu alan boş bırakılamaz!");
                gecerli = false;
            } else if (id === "email" && !emailKurali.test(deger)) {
                hataGoster(input, hata, "Geçerli bir e-posta adresi giriniz!");
                gecerli = false;
            } else {
                input.classList.remove("border-red-500");
                input.classList.add("border-green-500");
                if (hata) {
                    hata.textContent = "";
                    hata.classList.add("hidden");
                }
            }
        });

        if (gecerli) {
            alert("Mesajınız başarıyla gönderildi! 🎉");
            iletisimForm.reset();
            alanlar.forEach(id => document.getElementById(id).classList.remove("border-green-500"));
        }
    }

    function hataGoster(input, hata, mesaj) {
        input.classList.add("border-red-500");
        input.classList.remove("border-gray-300");
        if (hata) {
            hata.textContent = mesaj;
            hata.classList.remove("hidden");
        }
    }

    // ===== LIGHTBOX =====
    const overlay = document.getElementById("lightbox-overlay");
    const lightboxImg = document.getElementById("lightbox-img");
    const caption = document.getElementById("lightbox-caption");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    let triggers = Array.from(document.querySelectorAll(".lightbox-trigger"));
    let aktifIndex = 0;

    function lightboxAc(index) {
        if (!triggers[index]) return;
        aktifIndex = index;
        lightboxImg.src = triggers[index].src;
        caption.textContent = triggers[index].dataset.caption || "";
        overlay.classList.add("aktif");
        document.body.style.overflow = "hidden";
    }

    function lightboxKapat() {
        overlay.classList.remove("aktif");
        document.body.style.overflow = "";
    }

    function sonraki() {
        aktifIndex = (aktifIndex + 1) % triggers.length;
        lightboxAc(aktifIndex);
    }

    function onceki() {
        aktifIndex = (aktifIndex - 1 + triggers.length) % triggers.length;
        lightboxAc(aktifIndex);
    }

    triggers.forEach((img, i) => {
        img.addEventListener("click", () => lightboxAc(i));
    });

    if (closeBtn) closeBtn.addEventListener("click", lightboxKapat);
    if (nextBtn) nextBtn.addEventListener("click", sonraki);
    if (prevBtn) prevBtn.addEventListener("click", onceki);

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) lightboxKapat();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (!overlay || !overlay.classList.contains("aktif")) return;
        if (e.key === "Escape") lightboxKapat();
        if (e.key === "ArrowRight") sonraki();
        if (e.key === "ArrowLeft") onceki();
    });

});

const darkBtnMobile = document.getElementById("darkModeBtnMobile");
if (darkBtnMobile) {
    // Başlangıç ikonunu ayarla
    darkBtnMobile.textContent = body.classList.contains("dark-mode") ? "☀️" : "🌙";
    
    darkBtnMobile.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        darkBtnMobile.textContent = isDark ? "☀️" : "🌙";
        if (darkBtn) darkBtn.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("tema", isDark ? "dark" : "light");
    });
}