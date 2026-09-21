/**
 * HSD Gelişim - Site yapılandırması
 *
 * ---------------------------------------------------------------
 *  YAYINA ALIRKEN SADECE AŞAĞIDAKİ SATIRI DEĞİŞTİRİN
 * ---------------------------------------------------------------
 *
 * Backend'in (API) genel adresi. Sonunda eğik çizgi olmasın.
 *
 *   Yerel geliştirme : "http://localhost:3000"
 *   Yayın            : "https://api.hsd-gelisim.com"   (kendi adresiniz)
 *
 * Yayında API istekleri sitenin kendi adresindeki /api yoluna gider;
 * Vercel bunları backend'e iletir (vercel.json > rewrites). Böylece site
 * hangi domainden açılırsa açılsın CORS engeline takılmaz.
 *
 * HSD_MEDIA_URL: panelden yüklenen görseller (/uploads/...) doğrudan
 * backend'den gelir.
 */
window.HSD_API_URL = '/api';
window.HSD_MEDIA_URL = 'https://hsd-backend.onrender.com';
