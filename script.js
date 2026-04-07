document.addEventListener("DOMContentLoaded", function () {
    
    // HTML'deki id="darkModeBtn" ile buradaki isim aynı olmalı!
    const darkBtn = document.getElementById("darkModeBtn"); 
    const body = document.body;

    // Sayfa yüklendiğinde hafızadaki temayı kontrol et
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
    
    // ... Diğer form ve lightbox kodların aşağıda devam etsin
});

    // ===== FORM VALIDATION (GELİŞMİŞ) =====
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
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
                if (hata) hata.textContent = "";
            }
        });

        if (gecerli) {
            alert("Mesajınız başarıyla gönderildi! 🎉");
            iletisimForm.reset();
            alanlar.forEach(id => document.getElementById(id).classList.remove("is-valid"));
        }
    }

    function hataGoster(input, hata, mesaj) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        if (hata) hata.textContent = mesaj;
    }

    // ===== LIGHTBOX (GELİŞMİŞ GALERİ) =====
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

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) lightboxKapat();
    });

    document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("aktif")) return;
        if (e.key === "Escape") lightboxKapat();
        if (e.key === "ArrowRight") sonraki();
        if (e.key === "ArrowLeft") onceki();
    });
