(() => {
  'use strict';

  const root = document.documentElement;
  const config = Object.assign({
    version: '1.0.0',
    minAndroid: '8.0',
    apkSize: '15.7 MB',
    downloadEnabled: true,
    apkUrl: 'downloads/iqraaly-1.0.0.apk'
  }, window.IQRAALY_CONFIG || {});

  const safeGet = (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  };

  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch (e) { /* تجاهل */ }
  };

  /* ---------- السمة (فاتح / داكن) ---------- */
  const themeToggle = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const setTheme = (theme, persist) => {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    if (persist) safeSet('iqraaly-theme', theme);

    if (themeToggle) {
      const dark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن');
      themeToggle.setAttribute('title', dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن');
    }

    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#121212' : '#FBFDFF');
  };

  setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  if (systemTheme) {
    const onSystemChange = (event) => {
      if (!safeGet('iqraaly-theme')) setTheme(event.matches ? 'dark' : 'light', false);
    };
    if (systemTheme.addEventListener) systemTheme.addEventListener('change', onSystemChange);
    else if (systemTheme.addListener) systemTheme.addListener(onSystemChange);
  }

  /* ---------- رقم الإصدار والحد الأدنى للأندرويد ---------- */
  document.querySelectorAll('[data-version]').forEach((el) => {
    el.textContent = config.version;
  });

  document.querySelectorAll('[data-min-android]').forEach((el) => {
    el.textContent = config.minAndroid;
  });

  document.querySelectorAll('[data-apk-size]').forEach((el) => {
    el.textContent = config.apkSize;
  });

  /* ---------- زر التحميل ---------- */
  const downloadBtn = document.getElementById('downloadBtn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4400);
  };

  const syncDownloadButton = () => {
    if (!downloadBtn) return;

    const badge = downloadBtn.querySelector('.btn-badge');
    const label = downloadBtn.querySelector('.btn-label');

    if (config.downloadEnabled) {
      downloadBtn.classList.remove('is-pending');
      downloadBtn.removeAttribute('aria-disabled');
      if (badge) badge.textContent = 'APK';
      if (label) label.textContent = 'تحميل التطبيق';
    } else {
      downloadBtn.classList.add('is-pending');
      downloadBtn.setAttribute('aria-disabled', 'true');
      if (badge) badge.textContent = 'قريبًا';
      if (label) label.textContent = 'تحميل التطبيق';
      /* نص الملاحظة يأتي من index.html حتى يبقى تعديله في مكان واحد. */
    }
  };

  syncDownloadButton();

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (config.downloadEnabled) {
        const link = document.createElement('a');
        link.href = config.apkUrl;
        link.download = config.apkUrl.split('/').pop() || ('iqraaly-' + config.version + '.apk');
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('يبدأ تحميل الإصدار ' + config.version + ' الآن.');
        return;
      }

      showToast('التحميل غير مفعّل بعد — الإصدار ' + config.version + ' قيد التجهيز.');
      downloadBtn.classList.remove('is-shaking');
      void downloadBtn.offsetWidth;
      downloadBtn.classList.add('is-shaking');
    });
  }

  /* ---------- ظل الهيدر عند التمرير ---------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- الظهور التدريجي ---------- */
  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealAll = () => revealItems.forEach((el) => el.classList.add('is-visible'));

  if (!revealItems.length) {
    /* لا شيء */
  } else if (!('IntersectionObserver' in window) || reduceMotion) {
    revealAll();
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach((el) => observer.observe(el));

    /* شبكة أمان: لا يُترك محتوى مخفيًا إن تعذّر المراقب. */
    window.setTimeout(revealAll, 4000);
  }

  /* ---------- السنة الحالية ---------- */
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(year);
  });
})();
