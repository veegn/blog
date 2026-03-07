<!-- Google Translate Widget -->
<div id="google_translate_element" style="position: fixed; top: 20px; right: 20px; z-index: 9999; opacity: 0.8; transition: opacity 0.3s;"></div>
<style>
.goog-te-banner-frame.skiptranslate, 
.goog-te-gadget iframe, 
.goog-logo-link, 
.goog-te-gadget, 
.goog-te-gadget .goog-te-combo, 
.goog-te-combo, 
.goog-te-combo option, 
.goog-te-footer, 
.goog-te-ftab, 
.goog-te-ftab-frame {
  display: none !important;
}

body {
  top: 0 !important;
  position: unset !important;
}
</style>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'zh-CN',
    includedLanguages: 'en,ja,ko,fr,de,es,ru,it,pt,ar,hi',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: true,
    multilanguage: true
  }, 'google_translate_element');
}

// Add mouseover effect to make the translate element visible
document.addEventListener('DOMContentLoaded', function() {
  var translateElement = document.getElementById('google_translate_element');
  
  translateElement.addEventListener('mouseenter', function() {
    this.style.opacity = '1';
  });
  
  translateElement.addEventListener('mouseleave', function() {
    this.style.opacity = '0.8';
  });
});
</script>
<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>