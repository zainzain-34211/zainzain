/* Infinitum Boxing — SEO page 6: FAQ single-open behaviour + header shadow */
(function () {
  var details = document.querySelectorAll(".faq6 details");
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) {
        details.forEach(function (o) { if (o !== d) o.open = false; });
      }
    });
  });
  var header = document.querySelector(".top");
  if (header) {
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 8 ? "0 6px 18px rgba(28,26,23,.08)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
