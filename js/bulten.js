/**
 * HSD Bülten — site tarafı
 *
 * Bültenler yönetim panelinden yazılır. İçerik backend'de blok listesi
 * olarak tutulur (paragraf, başlık, alıntı, liste, kod, görsel, ayraç) ve
 * burada DOM'a çizilir. Metinler her yerde textContent ile yazılır; içerik
 * HTML olarak yorumlanmaz (XSS koruması).
 *
 * Sayfada hangi alan varsa o çalışır:
 *   #bulten-listesi        bulten.html       tüm bültenler
 *   #bu-hafta-bultenler    index.html        son 3 bülten
 *   #bulten-yazi           bulten-detay.html tek bülten
 */
(function () {
  'use strict';

  function el(etiket, sinif, metin) {
    var d = document.createElement(etiket);
    if (sinif) d.className = sinif;
    if (metin !== undefined && metin !== null) d.textContent = metin;
    return d;
  }

  function tarih(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  function basHarf(ad) {
    return (ad || '?').trim().charAt(0).toLocaleUpperCase('tr-TR') || '?';
  }

  function guvenliBaglanti(href) {
    return /^(https?:\/\/|mailto:)/i.test(href || '') ? href : null;
  }

  function detayAdresi(b) {
    return 'bulten-detay.html?id=' + encodeURIComponent(b.id);
  }

  function gorsel(src, sinif, alt, hataOlursa) {
    var img = el('img', sinif);
    img.alt = alt || '';
    img.loading = 'lazy';
    HsdApi.gorseliYukle(img, HsdApi.mediaUrl(src), hataOlursa);
    return img;
  }

  // ------------------------------------------------------------------
  // İçerik çizimi
  // ------------------------------------------------------------------

  function spanlar(hedef, liste) {
    (liste || []).forEach(function (s) {
      var dugum = document.createDocumentFragment();
      String(s.t || '').split('\n').forEach(function (parca, i) {
        if (i > 0) dugum.appendChild(el('br'));
        if (parca) dugum.appendChild(document.createTextNode(parca));
      });

      if (s.i) {
        var em = el('em');
        em.appendChild(dugum);
        dugum = em;
      }
      if (s.b) {
        var strong = el('strong');
        strong.appendChild(dugum);
        dugum = strong;
      }
      var href = guvenliBaglanti(s.href);
      if (href) {
        var a = el('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.appendChild(dugum);
        dugum = a;
      }
      hedef.appendChild(dugum);
    });
  }

  function icerikCiz(bloklar) {
    var parca = document.createDocumentFragment();

    (bloklar || []).forEach(function (b) {
      var d = null;

      if (b.type === 'p' || b.type === 'h2' || b.type === 'h3') {
        d = el(b.type);
        spanlar(d, b.spans);
      } else if (b.type === 'quote') {
        d = el('blockquote');
        spanlar(d, b.spans);
      } else if (b.type === 'ul' || b.type === 'ol') {
        d = el(b.type);
        (b.items || []).forEach(function (m) {
          var li = el('li');
          spanlar(li, m);
          d.appendChild(li);
        });
      } else if (b.type === 'code') {
        d = el('pre');
        d.appendChild(el('code', null, b.text));
      } else if (b.type === 'img') {
        d = el('figure');
        var fig = d;
        var img = gorsel(b.src, '', b.caption || '', function () {
          fig.remove();
        });
        d.appendChild(img);
        if (b.caption) d.appendChild(el('figcaption', null, b.caption));
      } else if (b.type === 'hr') {
        d = el('hr');
      }

      if (d) parca.appendChild(d);
    });

    return parca;
  }

  // ------------------------------------------------------------------
  // Kartlar
  // ------------------------------------------------------------------

  function yazarSatiri(b, kucuk) {
    var satir = el('div', 'flex items-center gap-2 ' + (kucuk ? 'text-xs' : 'text-sm'));
    var av = el('span', 'bulten-avatar', basHarf(b.authorName));
    av.style.width = av.style.height = kucuk ? '22px' : '26px';
    av.style.fontSize = kucuk ? '11px' : '12px';
    satir.appendChild(av);
    satir.appendChild(el('span', 'font-semibold text-gray-800 dark:text-gray-200', b.authorName));
    return satir;
  }

  function meta(b) {
    return [tarih(b.publishedAt || b.createdAt), (b.readingTime || 1) + ' dk okuma'].filter(Boolean).join(' · ');
  }

  // Liste sayfası: Medium akışına benzer yatay satır
  function satirKart(b, oneCikan) {
    var a = el('a', 'bulten-satir block py-8 group');
    a.href = detayAdresi(b);

    if (oneCikan && b.coverImage) {
      var kapakKap = el('div', 'mb-6 overflow-hidden rounded-2xl aspect-[2/1] bg-gray-100 dark:bg-gray-800');
      kapakKap.appendChild(
        gorsel(b.coverImage, 'w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500', b.title, function () {
          kapakKap.remove();
        }),
      );
      a.appendChild(kapakKap);
    }

    var satir = el('div', 'flex gap-6 items-start');
    var sol = el('div', 'flex-1 min-w-0');

    sol.appendChild(yazarSatiri(b));
    sol.appendChild(
      el(
        'h2',
        'bulten-satir-baslik font-extrabold tracking-tight mt-3 ' + (oneCikan ? 'text-3xl md:text-4xl leading-tight' : 'text-xl md:text-2xl leading-snug') + ' satir-kes-2',
        b.title,
      ),
    );
    var aciklama = b.subtitle || b.excerpt;
    if (aciklama) {
      sol.appendChild(el('p', 'serif text-gray-500 dark:text-gray-400 mt-2 ' + (oneCikan ? 'text-lg satir-kes-3' : 'satir-kes-2'), aciklama));
    }
    sol.appendChild(el('p', 'text-xs text-gray-400 mt-4', meta(b)));
    satir.appendChild(sol);

    if (!oneCikan && b.coverImage) {
      var kucuk = el('div', 'w-28 h-20 md:w-40 md:h-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 mt-1');
      kucuk.appendChild(
        gorsel(b.coverImage, 'w-full h-full object-cover', '', function () {
          kucuk.remove();
        }),
      );
      satir.appendChild(kucuk);
    }

    a.appendChild(satir);
    return a;
  }

  // Ana sayfa ve "diğer bültenler": dikey kart
  function dikeyKart(b) {
    var a = el('a', 'bulten-kart group rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300');
    a.href = detayAdresi(b);

    var kapak = el('div', 'h-44 overflow-hidden bg-gradient-to-br from-[#04067c] to-[#0d6efd]');
    if (b.coverImage) {
      kapak.appendChild(
        gorsel(b.coverImage, 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500', b.title, function () {
          kapak.innerHTML = '';
        }),
      );
    }
    a.appendChild(kapak);

    var govde = el('div', 'p-5 flex flex-col flex-1');
    govde.appendChild(yazarSatiri(b, true));
    govde.appendChild(el('h3', 'bulten-satir-baslik font-bold text-lg leading-snug mt-3 satir-kes-2', b.title));
    var aciklama = b.subtitle || b.excerpt;
    if (aciklama) govde.appendChild(el('p', 'serif text-gray-500 dark:text-gray-400 text-sm mt-2 satir-kes-3 flex-1', aciklama));
    govde.appendChild(el('p', 'text-xs text-gray-400 mt-4', meta(b)));
    a.appendChild(govde);

    return a;
  }

  function iskeletKartlar(kap, adet, sinif) {
    for (var i = 0; i < adet; i++) kap.appendChild(el('div', 'iskelet ' + sinif));
  }

  // ------------------------------------------------------------------
  // Sayfalar
  // ------------------------------------------------------------------

  function listeSayfasi(kap) {
    iskeletKartlar(kap, 3, 'h-40 my-6');

    HsdApi.getNewsletters()
      .then(function (liste) {
        kap.innerHTML = '';
        if (!liste || !liste.length) {
          kap.appendChild(el('p', 'text-center text-gray-400 py-20', 'Henüz yayımlanmış bülten yok. Yakında burada!'));
          return;
        }
        liste.forEach(function (b, i) {
          kap.appendChild(satirKart(b, i === 0));
        });
      })
      .catch(function (e) {
        kap.innerHTML = '';
        kap.appendChild(el('p', 'text-center text-red-500 py-20', e.message || 'Bültenler yüklenemedi.'));
      });
  }

  // Ana sayfa: sunucuya ulaşılamazsa bölüm bugünkü hâliyle kalır.
  function anaSayfa(kap) {
    HsdApi.getNewsletters()
      .then(function (liste) {
        if (!liste || !liste.length) return;
        kap.innerHTML = '';
        liste.slice(0, 3).forEach(function (b) {
          var kart = dikeyKart(b);
          kart.classList.add('w-full', 'md:w-[calc(33.333%-1rem)]');
          kap.appendChild(kart);
        });
        kap.classList.remove('hidden');
        var tumu = document.getElementById('bu-hafta-tumu');
        if (tumu) tumu.classList.remove('hidden');
      })
      .catch(function () {
        /* bölüm statik metniyle kalır */
      });
  }

  function detaySayfasi(kap) {
    var yukleniyor = document.getElementById('yukleniyor');
    var hata = document.getElementById('hata');

    function hataGoster(m) {
      if (yukleniyor) yukleniyor.classList.add('hidden');
      hata.textContent = m;
      hata.classList.remove('hidden');
    }

    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      hataGoster('Bülten bulunamadı: adreste bülten kimliği eksik.');
      return;
    }

    HsdApi.getNewsletter(id)
      .then(function (b) {
        document.title = b.title + ' — HSD Bülten';

        document.getElementById('baslik').textContent = b.title;

        var alt = document.getElementById('altBaslik');
        if (b.subtitle) {
          alt.textContent = b.subtitle;
          alt.classList.remove('hidden');
        }

        document.getElementById('yazarAvatar').textContent = basHarf(b.authorName);
        document.getElementById('yazarAdi').textContent = b.authorName;
        document.getElementById('yaziMeta').textContent = meta(b);
        document.getElementById('sonYazarAvatar').textContent = basHarf(b.authorName);
        document.getElementById('sonYazarAdi').textContent = b.authorName;

        if (b.coverImage) {
          var kapak = document.getElementById('kapak');
          var img = gorsel(b.coverImage, 'w-full max-h-[520px] object-cover md:rounded-2xl', b.title, function () {
            kapak.classList.add('hidden');
          });
          img.loading = 'eager';
          kapak.appendChild(img);
          kapak.classList.remove('hidden');
        }

        document.getElementById('govde').appendChild(icerikCiz(b.content));

        if (yukleniyor) yukleniyor.classList.add('hidden');
        kap.classList.remove('hidden');
      })
      .catch(function (e) {
        hataGoster(e.status === 404 ? 'Bu bülten bulunamadı ya da henüz yayımlanmamış.' : e.message || 'Bülten yüklenemedi.');
      });
  }

  // Bülten sayfaları script.js'i (animasyon kütüphaneleri) yüklemiyor;
  // tema ve mobil menü burada.
  function sayfaKabugu() {
    if (!document.body.hasAttribute('data-bulten-sayfa')) return;

    var html = document.documentElement;
    var dugmeler = [document.getElementById('darkModeBtn'), document.getElementById('darkModeBtnMobile')];

    function tema(koyu) {
      html.classList.toggle('dark', koyu);
      dugmeler.forEach(function (d) {
        if (d) d.textContent = koyu ? '☀️' : '🌙';
      });
      try {
        localStorage.setItem('tema', koyu ? 'dark' : 'light');
      } catch (e) {}
    }

    var kayitli = null;
    try {
      kayitli = localStorage.getItem('tema');
    } catch (e) {}
    tema(kayitli === 'dark');

    dugmeler.forEach(function (d) {
      if (d)
        d.addEventListener('click', function () {
          tema(!html.classList.contains('dark'));
        });
    });

    var menuBtn = document.getElementById('menuBtn');
    var menu = document.getElementById('mobileMenu');
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', function () {
        menu.classList.toggle('hidden');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof HsdApi === 'undefined') return;

    sayfaKabugu();

    var liste = document.getElementById('bulten-listesi');
    if (liste) listeSayfasi(liste);

    var ana = document.getElementById('bu-hafta-bultenler');
    if (ana) anaSayfa(ana);

    var yazi = document.getElementById('bulten-yazi');
    if (yazi) detaySayfasi(yazi);
  });
})();
