/* Reporting features: example tabs and animated league table bars */
document.addEventListener("DOMContentLoaded", function () {
  [].forEach.call(document.querySelectorAll("[data-tabs]"), function (box) {
    var tabs = box.querySelectorAll('[role="tab"]');
    [].forEach.call(tabs, function (t) {
      t.addEventListener("click", function () {
        [].forEach.call(tabs, function (o) {
          var on = o === t;
          o.setAttribute("aria-selected", on);
          document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
        });
        grow(box);
      });
    });
  });
  function grow(scope) { [].forEach.call(scope.querySelectorAll(".track"), function (el) { if (el.offsetParent) el.classList.add("go"); }); }
  if (!("IntersectionObserver" in window)) return grow(document);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { grow(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.3 });
  [].forEach.call(document.querySelectorAll(".league"), function (el) { io.observe(el); });
});
