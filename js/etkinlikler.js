/**
 * Ana sayfa — Etkinlikler ve etkinlik fotoğrafları
 *
 * Yönetim panelinden girilen etkinlikler GET /events ucundan çekilir:
 *   - Etkinlik kartları (kapak görseli, kategori, tarih, yer, açıklama)
 *   - Etkinliklerin kapak ve galeri fotoğrafları
 *
 * Görseller "lightbox-trigger" sınıfıyla eklenir; script.js içindeki
 * lightbox sonradan eklenen görselleri de tanır.
 *
 * Backend'e ulaşılamazsa ya da hiç etkinlik yoksa bölüm olduğu gibi kalır.
 */
document.addEventListener('DOMContentLoaded', function () {
  var bolum = document.getElementById('etkinlik-fotograflari');
  if (!bolum || typeof HsdApi === 'undefined') return;

  var kap = bolum.querySelector('.max-w-7xl');
  // Fotoğraf ızgarası kimliğiyle bulunur: bölümde yedek kartların ızgarası da
  // var, sadece ".grid" aransa yanlış öğe seçilirdi.
  var galeri = bolum.querySelector('#etkinlik-galerisi') || bolum.querySelector('.grid');
  if (!kap || !galeri) return;

  function tarihFormatla(iso) {
    try {
      return new Date(iso).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  function kisaltma(metin, uzunluk) {
    var m = (metin || '').replace(/\s+/g, ' ').trim();
    return m.length <= uzunluk ? m : m.slice(0, uzunluk).trim() + '…';
  }

  function etkinlikKarti(etkinlik, sira) {
    var gecmisMi = new Date(etkinlik.startDate).getTime() < Date.now();

    var kart = document.createElement('div');
    kart.className =
      'bg-white rounded-2xl overflow-hidden border border-blue-100 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col shadow-sm';
    kart.setAttribute('data-aos', 'fade-up');
    kart.setAttribute('data-aos-delay', String(Math.min(sira * 100, 300)));

    if (etkinlik.coverImage) {
      var gorselKap = document.createElement('div');
      gorselKap.className = 'h-48 overflow-hidden';

      var gorsel = document.createElement('img');
      gorsel.className = 'lightbox-trigger w-full h-full object-cover cursor-zoom-in';
      gorsel.alt = etkinlik.title;
      gorsel.setAttribute('data-caption', etkinlik.title + ' - ' + tarihFormatla(etkinlik.startDate));
      HsdApi.gorseliYukle(gorsel, HsdApi.mediaUrl(etkinlik.coverImage), function () {
        gorselKap.remove();
      });

      gorselKap.appendChild(gorsel);
      kart.appendChild(gorselKap);
    }

    var govde = document.createElement('div');
    govde.className = 'p-5 flex flex-col flex-1';

    var rozetler = document.createElement('div');
    rozetler.className = 'flex flex-wrap gap-2 mb-3';

    if (etkinlik.category) {
      var kategori = document.createElement('span');
      kategori.className = 'bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full';
      kategori.textContent = etkinlik.category;
      rozetler.appendChild(kategori);
    }

    var durum = document.createElement('span');
    durum.className =
      'text-xs font-bold px-3 py-1 rounded-full ' +
      (etkinlik.isCancelled
        ? 'bg-red-100 text-red-700'
        : gecmisMi
          ? 'bg-gray-100 text-gray-600'
          : 'bg-green-100 text-green-700');
    durum.textContent = etkinlik.isCancelled ? 'İptal edildi' : gecmisMi ? 'Gerçekleşti' : 'Yaklaşan';
    rozetler.appendChild(durum);

    govde.appendChild(rozetler);

    var baslik = document.createElement('h3');
    baslik.className = 'font-bold text-gray-800 text-lg mb-2';
    // textContent: içerik HTML olarak yorumlanmaz (XSS koruması)
    baslik.textContent = etkinlik.title;
    govde.appendChild(baslik);

    var aciklama = document.createElement('p');
    aciklama.className = 'text-gray-500 text-sm flex-1';
    aciklama.textContent = kisaltma(etkinlik.description, 140);
    govde.appendChild(aciklama);

    var alt = document.createElement('div');
    alt.className = 'mt-4 pt-3 border-t border-gray-100 text-gray-400 text-xs space-y-1';

    var tarih = document.createElement('p');
    tarih.textContent = '📅 ' + tarihFormatla(etkinlik.startDate);
    alt.appendChild(tarih);

    if (etkinlik.location) {
      var yer = document.createElement('p');
      yer.textContent = '📍 ' + etkinlik.location;
      alt.appendChild(yer);
    }

    govde.appendChild(alt);
    kart.appendChild(govde);

    return kart;
  }

  function galeriGorseli(url, altyazi, sira) {
    var img = document.createElement('img');
    img.alt = altyazi;
    img.className =
      'lightbox-trigger w-full h-56 rounded-xl object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300';
    img.setAttribute('data-caption', altyazi);
    img.setAttribute('data-aos', 'zoom-in');
    img.setAttribute('data-aos-delay', String((sira % 3) * 100));
    HsdApi.gorseliYukle(img, HsdApi.mediaUrl(url), function () {
      img.remove();
    });
    return img;
  }

  function altBaslik(metin) {
    var h = document.createElement('h3');
    h.className = 'text-xl font-bold text-gray-800 mb-6';
    h.textContent = metin;
    return h;
  }

  HsdApi.getEvents()
    .then(function (etkinlikler) {
      if (!Array.isArray(etkinlikler) || etkinlikler.length === 0) return;

      // Sayfadaki yedek içerik (sunucuya ulaşılamadığında görünen sabit
      // kartlar ve fotoğraflar) kaldırılır; yoksa aynı etkinlik iki kez çıkar.
      document.querySelectorAll('[data-yedek="etkinlik"]').forEach(function (dugum) {
        dugum.remove();
      });

      // En yeni etkinlik en başta
      etkinlikler.sort(function (a, b) {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      // --- Etkinlik kartları ---
      var kartlarKap = document.createElement('div');
      kartlarKap.className = 'mb-14';
      kartlarKap.appendChild(altBaslik('Etkinliklerimiz'));

      var kartIzgarasi = document.createElement('div');
      kartIzgarasi.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      etkinlikler.forEach(function (e, i) {
        kartIzgarasi.appendChild(etkinlikKarti(e, i));
      });
      kartlarKap.appendChild(kartIzgarasi);

      kap.insertBefore(kartlarKap, galeri);

      // --- Fotoğraf galerisi ---
      var fotograflar = [];
      etkinlikler.forEach(function (e) {
        var altyazi = e.title + ' - ' + tarihFormatla(e.startDate);
        (e.photos || []).forEach(function (f) {
          fotograflar.push({ url: f.url, altyazi: f.caption ? f.caption + ' · ' + altyazi : altyazi });
        });
      });

      if (fotograflar.length > 0) {
        kap.insertBefore(altBaslik('Fotoğraflar'), galeri);
        galeri.innerHTML = '';
        fotograflar.forEach(function (f, i) {
          galeri.appendChild(galeriGorseli(f.url, f.altyazi, i));
        });
      }

      if (typeof AOS !== 'undefined') AOS.refresh();
    })
    .catch(function (error) {
      console.warn('Etkinlikler yüklenemedi, sayfadaki içerik gösteriliyor:', error.message);
    });
});
