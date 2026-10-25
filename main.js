(function () {
  "use strict";

  var data = window.__BRAND__ || { products: [], shipping: {} };
  var KEY = "caoticco_cart_v1";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var money = function (n) { return "$" + Math.round(n).toLocaleString("es-CO"); };
  var product = function (id) { return data.products.filter(function (p) { return p.id === id; })[0]; };
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn(e); } }

  document.documentElement.classList.add("js");

  /* ---------- carrito (se guarda en el navegador) ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  var memCart = load();
  function save(cart) {
    memCart = cart;
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    renderCart();
  }
  function cart() { return memCart.filter(function (l) { return product(l.id); }); }
  function add(id, size, qty) {
    var c = cart(), found = false;
    c.forEach(function (l) { if (l.id === id && l.size === size) { l.qty += qty; found = true; } });
    if (!found) c.push({ id: id, size: size, qty: qty });
    save(c);
  }
  function totals() {
    var sub = cart().reduce(function (s, l) { return s + product(l.id).price * l.qty; }, 0);
    var sh = data.shipping || {};
    var ship = sub === 0 || sub >= (sh.freeFrom || Infinity) ? 0 : (sh.flat || 0);
    return { sub: sub, ship: ship, total: sub + ship, count: cart().reduce(function (s, l) { return s + l.qty; }, 0) };
  }

  /* ---------- panel del carrito ---------- */
  function renderCart() {
    var t = totals();
    $$(".cart-count").forEach(function (el) { el.textContent = t.count; el.setAttribute("data-n", t.count); });
    var box = $("#cart-items");
    if (!box) return;
    var sh = data.shipping || {};
    var missing = Math.max(0, (sh.freeFrom || 0) - t.sub);
    $("#cart-ship").innerHTML = t.sub === 0
      ? "Envío gratis en compras desde <b>" + money(sh.freeFrom) + "</b>"
      : missing > 0
        ? "Te faltan <b>" + money(missing) + "</b> para el envío gratis"
        : "<b>¡Tienes envío gratis!</b>";
    $("#cart-bar").style.transform = "scaleX(" + Math.min(1, t.sub / (sh.freeFrom || 1)) + ")";

    if (!t.count) {
      box.innerHTML = '<div class="drawer__empty"><p>Tu carrito está vacío.</p><a class="btn btn--bone" href="cape.html">Ver la Cape CCC-0</a></div>';
      $("#cart-foot").hidden = true;
      return;
    }
    $("#cart-foot").hidden = false;
    box.innerHTML = cart().map(function (l, i) {
      var p = product(l.id);
      return '<div class="line">' +
        '<img src="' + esc(p.photo) + '" alt="" loading="lazy" width="72" height="92">' +
        '<div><div class="line__name">' + esc(p.name) + '</div>' +
        '<div class="line__meta">Talla ' + esc(l.size) + (p.status === "preventa" ? " · Preventa" : "") + '</div>' +
        '<div class="line__qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="Quitar uno">−</button><span>' + l.qty + '</span><button type="button" data-q="1" data-i="' + i + '" aria-label="Agregar uno">+</button></div></div>' +
        '<div class="line__right">' + money(p.price * l.qty) + '<button type="button" class="line__rm" data-rm="' + i + '">Eliminar</button></div>' +
        '</div>';
    }).join("");
    $("#cart-sub").textContent = money(t.sub);
    $("#cart-shipv").textContent = t.ship ? money(t.ship) : "Gratis";
    $("#cart-total").textContent = money(t.total);
  }

  function openCart() { document.body.classList.add("cart-open"); }
  function closeCart() { document.body.classList.remove("cart-open"); }

  function initCart() {
    $$("[data-open-cart]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openCart(); }); });
    $$("[data-close-cart]").forEach(function (b) { b.addEventListener("click", closeCart); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });
    var box = $("#cart-items");
    if (box) box.addEventListener("click", function (e) {
      var q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]"), c = cart();
      if (q) {
        var l = c[+q.dataset.i]; l.qty += +q.dataset.q;
        if (l.qty < 1) c.splice(+q.dataset.i, 1);
        save(c);
      } else if (rm) { c.splice(+rm.dataset.rm, 1); save(c); }
    });
    renderCart();
  }

  var toastT;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    $("span", t).textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  /* ---------- botones "agregar" rápidos (tienda) ---------- */
  function initQuickAdd() {
    $$("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = product(b.dataset.add);
        if (!p) return;
        add(p.id, b.dataset.size || p.sizes[0], 1);
        toast(p.name + " agregado al carrito");
        openCart();
      });
    });
    $$("[data-notify]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = product(b.dataset.notify);
        window.open(wa("Hola CAOTICCO ★ Quiero que me avisen cuando vuelva " + (p ? p.name : "el próximo drop") + "."), "_blank", "noopener");
      });
    });
  }

  function wa(text) { return "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent(text); }

  /* ---------- página de producto ---------- */
  function initProduct() {
    var root = $("[data-product]");
    if (!root) return;
    var p = product(root.dataset.product), size = null, qty = 1;
    var hint = $("#size-hint");

    $$("#gallery-thumbs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#gallery-thumbs button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        var img = $("#gallery-main img");
        img.src = b.dataset.src; img.alt = b.dataset.alt || "";
      });
    });

    $$("#sizes button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#sizes button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        size = b.dataset.size;
        hint.classList.remove("is-error");
        hint.textContent = "Talla " + size + " · Corte oversize. Si dudas entre dos, elige tu talla habitual.";
        $$("[data-sel-size]").forEach(function (el) { el.textContent = "Talla " + size; });
      });
    });

    $("#qty-minus").addEventListener("click", function () { qty = Math.max(1, qty - 1); $("#qty").textContent = qty; });
    $("#qty-plus").addEventListener("click", function () { qty = Math.min(5, qty + 1); $("#qty").textContent = qty; });

    function needSize() {
      if (size) return false;
      hint.classList.add("is-error");
      hint.textContent = "Elige tu talla para continuar.";
      $("#sizes").scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    }
    $$("[data-add-current]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (needSize()) return;
        add(p.id, size, qty);
        toast(p.name + " · talla " + size + " agregada");
        openCart();
      });
    });
    $$("[data-buy-now]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (needSize()) return;
        add(p.id, size, qty);
        location.href = "checkout.html";
      });
    });
    $$("[data-wa-product]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        window.open(wa("Hola CAOTICCO ★ Quiero la " + p.name + (size ? " en talla " + size : "") + ". ¿Me ayudan con el pedido?"), "_blank", "noopener");
      });
    });
    $$("[data-open-sizes]").forEach(function (b) {
      b.addEventListener("click", function () { var d = $("#guia-tallas"); if (d) d.scrollIntoView({ behavior: "smooth" }); });
    });

    // barra fija en móvil cuando el bloque de compra sale de pantalla
    var bar = $("#stickybuy"), ctas = $("#buy-ctas");
    if (bar && ctas) {
      var tick = false;
      var upd = function () { tick = false; bar.classList.toggle("is-on", ctas.getBoundingClientRect().bottom < 0); };
      window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    }
  }

  /* ---------- checkout ---------- */
  function initCheckout() {
    var form = $("#checkout");
    if (!form) return;

    function renderSummary() {
      var t = totals();
      var list = $("#sum-items");
      if (!t.count) {
        $("#co-main").hidden = true; $("#co-empty").hidden = false; return;
      }
      list.innerHTML = cart().map(function (l) {
        var p = product(l.id);
        return '<div class="line" style="grid-template-columns:56px 1fr auto"><img src="' + esc(p.photo) + '" alt="" style="width:56px;height:72px">' +
          '<div><div class="line__name">' + esc(p.name) + '</div><div class="line__meta">Talla ' + esc(l.size) + ' · x' + l.qty + '</div></div>' +
          '<div class="line__right">' + money(p.price * l.qty) + '</div></div>';
      }).join("");
      $("#sum-sub").textContent = money(t.sub);
      $("#sum-ship").textContent = t.ship ? money(t.ship) : "Gratis";
      $("#sum-total").textContent = money(t.total);
    }
    renderSummary();

    var payBox = $("#pay");
    payBox.innerHTML = data.payments.map(function (m, i) {
      return '<label><input type="radio" name="pago" value="' + esc(m.id) + '"' + (i === 0 ? " checked" : "") + '><div><b>' + esc(m.label) + '</b><span>' + esc(m.note) + '</span></div></label>';
    }).join("");

    var rules = {
      nombre: function (v) { return v.trim().length > 2 || "Escribe tu nombre completo."; },
      celular: function (v) { return /^\+?[\d\s]{10,15}$/.test(v.trim()) || "Escribe un celular válido (10 dígitos)."; },
      ciudad: function (v) { return v.trim().length > 2 || "¿A qué ciudad enviamos?"; },
      direccion: function (v) { return v.trim().length > 5 || "Escribe la dirección completa."; }
    };
    function check(name) {
      var el = form.elements[name], ok = rules[name](el.value), f = el.closest(".field");
      f.classList.toggle("is-bad", ok !== true);
      $(".err", f).textContent = ok === true ? "" : ok;
      return ok === true;
    }
    Object.keys(rules).forEach(function (n) { form.elements[n].addEventListener("blur", function () { check(n); }); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      var t = totals(), f = form.elements;
      var pay = data.payments.filter(function (m) { return m.id === f.pago.value; })[0];
      var id = "CC-" + Date.now().toString(36).toUpperCase().slice(-6);
      var lines = cart().map(function (l) { var p = product(l.id); return "• " + p.name + " · talla " + l.size + " · x" + l.qty + " = " + money(p.price * l.qty); });
      var msg = [
        "★ NUEVO PEDIDO CAOTICCO · " + id, "",
        lines.join("\n"), "",
        "Subtotal: " + money(t.sub),
        "Envío: " + (t.ship ? money(t.ship) : "Gratis"),
        "TOTAL: " + money(t.total), "",
        "Nombre: " + f.nombre.value.trim(),
        "Celular: " + f.celular.value.trim(),
        "Ciudad: " + f.ciudad.value.trim() + (f.depto.value ? " (" + f.depto.value + ")" : ""),
        "Dirección: " + f.direccion.value.trim(),
        f.correo.value.trim() ? "Correo: " + f.correo.value.trim() : "",
        "Pago: " + (pay ? pay.label : ""),
        f.notas.value.trim() ? "Notas: " + f.notas.value.trim() : ""
      ].filter(function (x, i, a) { return x !== "" || a[i - 1] !== ""; }).join("\n");

      var link = wa(msg);
      $("#order-id").textContent = id;
      $("#order-wa").href = link;
      $("#co-main").hidden = true;
      $("#co-done").hidden = false;
      window.scrollTo(0, 0);
      window.open(link, "_blank", "noopener");
      save([]);
    });
  }

  /* ---------- lista de drops (club) ---------- */
  function initClub() {
    $$("[data-club]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = form.querySelector("input").value.trim();
        window.open(wa("Hola CAOTICCO ★ Quiero entrar a la lista del próximo drop. Mi contacto: " + v), "_blank", "noopener");
        form.querySelector("small").textContent = "¡Listo! Termina de enviar el mensaje en WhatsApp y quedas en la lista.";
      });
    });
  }

  /* ---------- menú móvil ---------- */
  function initMenu() {
    var b = $(".menu-btn"), nav = $(".nav");
    if (!b || !nav) return;
    b.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      b.setAttribute("aria-expanded", open);
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("is-open"); }); });
  }

  /* ---------- aparición suave ---------- */
  function initReveal() {
    var els = $$(".reveal");
    var show = function (el) { el.classList.add("is-in"); };
    if (!("IntersectionObserver" in window)) { els.forEach(show); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { show(x.target); io.unobserve(x.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(show); }, 2500); // red de seguridad
  }

  function init() {
    safe(initMenu);
    safe(initCart);
    safe(initQuickAdd);
    safe(initProduct);
    safe(initCheckout);
    safe(initClub);
    safe(initReveal);
    $$("[data-wa]").forEach(function (a) { a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
