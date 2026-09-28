/* جسر التطبيق الأصلي (Android) — لا يعمل إلا داخل تطبيق Capacitor، وفي المتصفح العادي لا يفعل شيئًا.
   1) يحوّل استدعاءات OneSignal (نسخة الويب) إلى OneSignal الأصلي (onesignal-cordova-plugin)
   2) يوفّر كائن Notification غير موجود في Android WebView
   3) يحفظ/يشارك الملفات المُصدَّرة (Excel/CSV/JSON) لأن التحميل عبر blob لا يعمل في WebView
   4) يفتح الروابط الخارجية (واتساب...) في المتصفح/التطبيق الخارجي */
(function(){
  var C = window.Capacitor;
  if(!(C && C.isNativePlatform && C.isNativePlatform())) return;
  window.MR_NATIVE = true;
  var APP_ID = window.MR_ONESIGNAL_APP_ID || "698e7216-d4b9-4805-8481-08293be3572b";
  var st = { perm:false, subId:null };

  var ready = new Promise(function(res){
    var n = 0;
    (function wait(){
      if(window.plugins && window.plugins.OneSignal) return res(window.plugins.OneSignal);
      if(++n > 150) return res(null);
      setTimeout(wait, 100);
    })();
  }).then(async function(OS){
    if(!OS){ console.warn('OneSignal native plugin not found'); return null; }
    try{ OS.initialize(APP_ID); }catch(e){ console.warn(e); }
    try{ st.perm = !!(await OS.Notifications.getPermissionAsync()); }catch(e){}
    try{ st.subId = await OS.User.pushSubscription.getIdAsync(); }catch(e){}
    try{ OS.User.pushSubscription.addEventListener('change', function(ev){ st.subId = (ev && ev.current && ev.current.id) || null; }); }catch(e){}
    try{ OS.Notifications.addEventListener('permissionChange', function(g){ st.perm = !!g; }); }catch(e){}
    return OS;
  });

  var W = {
    init: async function(){},
    login: async function(id){ var OS = await ready; if(OS) OS.login(String(id)); },
    logout: async function(){ var OS = await ready; if(OS) OS.logout(); },
    User: {
      addTags: async function(tags){ var OS = await ready; if(OS) OS.User.addTags(tags); },
      PushSubscription: { get id(){ return st.subId; } }
    },
    Notifications: {
      requestPermission: async function(){
        var OS = await ready; if(!OS) return false;
        try{ st.perm = !!(await OS.Notifications.requestPermission(true)); }catch(e){}
        try{ st.subId = await OS.User.pushSubscription.getIdAsync(); }catch(e){}
        return st.perm;
      },
      get permission(){ return st.perm; }
    }
  };
  window.OneSignalDeferred = { push: function(fn){ ready.then(function(){ try{ return fn(W); }catch(e){ console.warn(e); } }); return 0; } };

  if(typeof window.Notification === 'undefined'){
    window.Notification = {
      get permission(){ return st.perm ? 'granted' : 'default'; },
      requestPermission: function(){ return W.Notifications.requestPermission().then(function(g){ return g ? 'granted' : 'denied'; }); }
    };
  }

  /* حفظ ومشاركة الملفات المُصدَّرة */
  var FS = C.registerPlugin('Filesystem'), Share = C.registerPlugin('Share'), Browser = C.registerPlugin('Browser');
  function blobToB64(b){ return new Promise(function(r,j){ var fr = new FileReader(); fr.onload = function(){ r(String(fr.result).split(',')[1]); }; fr.onerror = j; fr.readAsDataURL(b); }); }
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function(){
    var a = this;
    if(a.download && a.href && a.href.indexOf('blob:') === 0){
      fetch(a.href).then(function(r){ return r.blob(); }).then(blobToB64).then(function(data){
        var name = a.download.replace(/[\\\/:*?"<>|]/g, '_');
        return FS.writeFile({ path: name, data: data, directory: 'CACHE' }).then(function(f){
          return Share.share({ title: name, url: f.uri, dialogTitle: 'حفظ / مشاركة الملف' });
        });
      }).catch(function(e){ if(!e || !/cancel/i.test(String(e.message||e))) alert('تعذر حفظ الملف: ' + (e && e.message || e)); });
      return;
    }
    return origClick.apply(a, arguments);
  };
  var origOpen = window.open;
  window.open = function(url){
    if(url && /^https?:/i.test(url)){ Browser.open({ url: url }); return null; }
    return origOpen ? origOpen.apply(window, arguments) : null;
  };
})();
