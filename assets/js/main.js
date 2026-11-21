(() => {
  'use strict';

  const root = document.documentElement;
  const config = Object.assign({
    version: '1.0.1',
    minAndroid: '8.0',
    apkSize: '15.8 MB',
    downloadEnabled: true,
    apkUrl: 'downloads/iqraaly-1.0.1.apk'
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

  /* ---------- تثبيت الموقع كتطبيق ويب ---------- */
  const installBadge = document.getElementById('installBadge');
  const installHelp = document.getElementById('installBadgeHelp');
  const installDismiss = document.querySelector('[data-install-dismiss]');
  const installButtons = Array.from(document.querySelectorAll('[data-install-app]'));
  const standaloneQuery = window.matchMedia ? window.matchMedia('(display-mode: standalone)') : null;
  let deferredInstall = null;
  let badgeHideTimer = 0;

  const sessionDismissed = () => {
    try { return sessionStorage.getItem('iqraaly-install-dismissed') === '1'; } catch (e) { return false; }
  };

  const rememberDismiss = () => {
    try { sessionStorage.setItem('iqraaly-install-dismissed', '1'); } catch (e) { /* تجاهل */ }
  };

  const isInstalled = () => Boolean(
    (standaloneQuery && standaloneQuery.matches) || window.navigator.standalone === true
  );

  const hideInstallBadge = (remember) => {
    if (remember) rememberDismiss();
    if (!installBadge) return;
    window.clearTimeout(badgeHideTimer);
    installBadge.classList.remove('is-visible');
    badgeHideTimer = window.setTimeout(() => { installBadge.hidden = true; }, 280);
  };

  const showInstallBadge = (force) => {
    if (!installBadge || isInstalled() || (!force && sessionDismissed())) return;
    window.clearTimeout(badgeHideTimer);
    installBadge.hidden = false;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => installBadge.classList.add('is-visible'));
    });
  };

  const installHelpText = () => {
    const ua = window.navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua)
      || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    if (ios) {
      return 'في سفاري: اضغط زر «مشاركة» في شريط المتصفح، ثم «إضافة إلى الشاشة الرئيسية»، ثم «إضافة».';
    }

    if (/Android/i.test(ua)) {
      return 'من قائمة المتصفح (⋮) اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».';
    }

    return 'من قائمة المتصفح (⋮ أو ⋯) اختر «تثبيت التطبيق» أو «تثبيت هذا الموقع كتطبيق».';
  };

  installButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (isInstalled()) {
        showToast('الموقع مثبت بالفعل على جهازك.');
        hideInstallBadge(true);
        return;
      }

      if (deferredInstall) {
        deferredInstall.prompt();
        try {
          const choice = await deferredInstall.userChoice;
          if (choice && choice.outcome === 'accepted') hideInstallBadge(false);
        } catch (e) { /* تجاهل إغلاق نافذة التثبيت */ }
        deferredInstall = null;
        return;
      }

      if (installHelp) {
        installHelp.textContent = installHelpText();
        installHelp.hidden = false;
        showInstallBadge(true);
      }
      showToast('لتثبيت الموقع اتبع إرشادات المتصفح الظاهرة في الشارة.');
    });
  });

  if (installDismiss) {
    installDismiss.addEventListener('click', () => hideInstallBadge(true));
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstall = event;
    showInstallBadge();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstall = null;
    hideInstallBadge(true);
    showToast('تم تثبيت الموقع كتطبيق بنجاح.');
  });

  showInstallBadge();

  /* ---------- نافذة خطوات التحميل ---------- */
  const stepsModal = document.getElementById('stepsModal');
  const stepsOpeners = Array.from(document.querySelectorAll('[data-steps-open]'));
  const stepsClosers = Array.from(document.querySelectorAll('[data-steps-close]'));
  const stepsDownload = document.querySelector('[data-steps-download]');
  let stepsOpener = null;

  const openSteps = (opener) => {
    if (!stepsModal) return;
    stepsOpener = opener || document.activeElement;

    if (typeof stepsModal.showModal === 'function') {
      if (!stepsModal.open) stepsModal.showModal();
    } else {
      stepsModal.setAttribute('open', '');
    }

    document.body.classList.add('is-modal-open');

    const closeButton = stepsModal.querySelector('[data-steps-close]');
    if (closeButton) window.setTimeout(() => closeButton.focus(), 30);
  };

  const closeSteps = () => {
    if (!stepsModal) return;
    if (typeof stepsModal.close === 'function' && stepsModal.open) stepsModal.close();
    else stepsModal.removeAttribute('open');
    document.body.classList.remove('is-modal-open');
  };

  stepsOpeners.forEach((button) => {
    button.addEventListener('click', () => openSteps(button));
  });

  stepsClosers.forEach((button) => {
    button.addEventListener('click', closeSteps);
  });

  if (stepsModal) {
    stepsModal.addEventListener('click', (event) => {
      if (event.target === stepsModal) closeSteps();
    });

    stepsModal.addEventListener('close', () => {
      document.body.classList.remove('is-modal-open');
      if (stepsOpener && typeof stepsOpener.focus === 'function') stepsOpener.focus();
    });
  }

  if (stepsDownload && downloadBtn) {
    stepsDownload.addEventListener('click', () => {
      closeSteps();
      window.setTimeout(() => downloadBtn.click(), 80);
    });
  }

  /* ---------- عامل الخدمة (تثبيت الموقع) ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* التثبيت غير متاح */ });
    });
  }
})();
