(function(){

  /* ---------------- datos de la gira ---------------- */
  var FLIGHTS = [
    { id:0, code:'CR226', city:'Buenos Aires', cityCode:'BUE', date:'12 Sep 2026', venue:'Movistar Arena', gate:'P7', status:'Pocos lugares', statusClass:'status--low', currency:'$', priceGeneral:45000, priceVip:78000 },
    { id:1, code:'CR227', city:'Córdoba', cityCode:'COR', date:'26 Sep 2026', venue:'Studio Theater', gate:'P3', status:'A tiempo', statusClass:'status--ok', currency:'$', priceGeneral:38000, priceVip:65000 },
    { id:2, code:'CR228', city:'Rosario', cityCode:'ROS', date:'03 Oct 2026', venue:'Metropolitano', gate:'P5', status:'A tiempo', statusClass:'status--ok', currency:'$', priceGeneral:38000, priceVip:65000 },
    { id:3, code:'CR229', city:'Madrid', cityCode:'MAD', date:'17 Oct 2026', venue:'La Riviera', gate:'P1', status:'Últimos lugares', statusClass:'status--soon', currency:'€', priceGeneral:42, priceVip:70 },
    { id:4, code:'CR230', city:'Ciudad de México', cityCode:'MEX', date:'07 Nov 2026', venue:'Pepsi Center WTC', gate:'P9', status:'A tiempo', statusClass:'status--ok', currency:'$', priceGeneral:1200, priceVip:1900 }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- estrellas de fondo ---------------- */
  var bgFx = document.getElementById('bgFx');
  for (var i = 0; i < 46; i++){
    var s = document.createElement('span');
    s.className = 'star';
    s.style.left = Math.random()*100 + '%';
    s.style.top = Math.random()*70 + '%';
    s.style.animationDelay = (Math.random()*4).toFixed(2) + 's';
    var size = (Math.random()*1.6 + 1).toFixed(1);
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    bgFx.appendChild(s);
  }

  /* ---------------- luces de pista ---------------- */
  var runway = document.getElementById('runway');
  for (var r = 0; r < 22; r++){
    var d = document.createElement('span');
    d.style.animationDelay = (r * 0.12) + 's';
    runway.appendChild(d);
  }

  /* ---------------- nav on scroll ---------------- */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  });

  /* ---------------- año en footer ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- render del tablero ---------------- */
  var boardBody = document.getElementById('boardBody');
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function randomStr(len){
    var out = '';
    for (var k = 0; k < len; k++) out += chars[Math.floor(Math.random()*chars.length)];
    return out;
  }

  function flap(el, finalText){
    if (reduceMotion){ el.textContent = finalText; return; }
    var ticks = 8;
    var count = 0;
    var timer = setInterval(function(){
      el.textContent = randomStr(finalText.length);
      el.classList.add('flap-tick');
      setTimeout(function(){ el.classList.remove('flap-tick'); }, 70);
      count++;
      if (count >= ticks){
        clearInterval(timer);
        el.textContent = finalText;
      }
    }, 55);
  }

  FLIGHTS.forEach(function(f){
    var row = document.createElement('div');
    row.className = 'board__row';
    row.innerHTML =
      '<span class="board__city flap" data-label="Destino" data-final="' + f.city + '"></span>' +
      '<span class="flap" data-label="Fecha" data-final="' + f.date + '"></span>' +
      '<span class="board__venue flap" data-label="Venue" data-final="' + f.venue + '"></span>' +
      '<span class="flap" data-label="Puerta" data-final="' + f.gate + '"></span>' +
      '<span class="board__status ' + f.statusClass + ' flap" data-label="Estado" data-final="' + f.status + '"></span>' +
      '<span class="board__action"><button class="board-btn" data-flight="' + f.id + '">Abordar</button></span>';
    boardBody.appendChild(row);
  });

  /* animación split-flap al entrar en viewport */
  var boardSection = document.getElementById('vuelos');
  var flapped = false;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting && !flapped){
        flapped = true;
        var cells = boardBody.querySelectorAll('.flap');
        cells.forEach(function(cell, idx){
          setTimeout(function(){
            flap(cell, cell.getAttribute('data-final'));
          }, idx * 60);
        });
      }
    });
  }, { threshold: 0.2 });
  observer.observe(boardSection);

  /* ---------------- formato de moneda ---------------- */
  function money(currency, value){
    var formatted = value.toLocaleString('es-AR');
    return currency === '€' ? '€ ' + formatted : currency + formatted;
  }

  /* ---------------- estado del modal de compra ---------------- */
  var modal = document.getElementById('modal');
  var currentFlight = null;
  var currentFare = 'general';
  var qty = 1;

  var steps = modal.querySelectorAll('.modal__step');
  function showStep(name){
    steps.forEach(function(s){ s.classList.toggle('is-active', s.getAttribute('data-step') === name); });
  }

  function openModal(flightId){
    currentFlight = FLIGHTS.filter(function(f){ return f.id === flightId; })[0];
    currentFare = 'general';
    qty = 1;
    document.getElementById('modalFlightLabel').textContent = 'Vuelo ' + currentFlight.code + ' · ' + currentFlight.city;
    document.getElementById('priceGeneral').textContent = money(currentFlight.currency, currentFlight.priceGeneral);
    document.getElementById('priceVip').textContent = money(currentFlight.currency, currentFlight.priceVip);
    document.getElementById('qtyValue').textContent = '1';
    document.querySelector('input[name="fare"][value="general"]').checked = true;
    updateFareUI();
    updateTotal();
    showStep('fare');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('boardBody').addEventListener('click', function(e){
    var btn = e.target.closest('.board-btn');
    if (!btn) return;
    openModal(parseInt(btn.getAttribute('data-flight'), 10));
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  function updateFareUI(){
    document.getElementById('fareGeneral').classList.toggle('is-selected', currentFare === 'general');
    document.getElementById('fareVip').classList.toggle('is-selected', currentFare === 'vip');
  }

  modal.querySelectorAll('input[name="fare"]').forEach(function(radio){
    radio.addEventListener('change', function(){
      currentFare = this.value;
      updateFareUI();
      updateTotal();
    });
  });

  function updateTotal(){
    var unit = currentFare === 'general' ? currentFlight.priceGeneral : currentFlight.priceVip;
    document.getElementById('fareTotal').textContent = money(currentFlight.currency, unit * qty);
  }

  document.getElementById('qtyMinus').addEventListener('click', function(){
    if (qty > 1){ qty--; document.getElementById('qtyValue').textContent = qty; updateTotal(); }
  });
  document.getElementById('qtyPlus').addEventListener('click', function(){
    if (qty < 8){ qty++; document.getElementById('qtyValue').textContent = qty; updateTotal(); }
  });

  document.getElementById('toDetails').addEventListener('click', function(){ showStep('details'); });
  document.getElementById('backToFare').addEventListener('click', function(){ showStep('fare'); });

  document.getElementById('toPass').addEventListener('click', function(){
    var name = document.getElementById('inputName').value.trim();
    var email = document.getElementById('inputEmail').value.trim();
    var errorEl = document.getElementById('formError');
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name){ errorEl.textContent = 'Ingresá tu nombre y apellido.'; return; }
    if (!emailOk){ errorEl.textContent = 'Ingresá un email válido.'; return; }
    errorEl.textContent = '';

    buildTicket(name);
    showStep('pass');
    showToast('¡Pase emitido! Buen vuelo.');
  });

  function buildTicket(name){
    var seatPrefix = currentFare === 'general' ? 'G' : 'V';
    var seat = seatPrefix + '-' + (Math.floor(Math.random()*30) + 1);
    var code = 'CR-' + randomStr(6);

    document.getElementById('ticketFlightNo').textContent = currentFlight.code;
    document.getElementById('ticketDestCode').textContent = currentFlight.cityCode;
    document.getElementById('ticketName').textContent = name;
    document.getElementById('ticketCity').textContent = currentFlight.city;
    document.getElementById('ticketDate').textContent = currentFlight.date;
    document.getElementById('ticketGate').textContent = currentFlight.gate;
    document.getElementById('ticketFare').textContent = (currentFare === 'general' ? 'General' : 'VIP') + ' ×' + qty;
    document.getElementById('ticketSeat').textContent = seat;
    document.getElementById('ticketCode').textContent = 'CÓDIGO DE RESERVA — ' + code;

    var barcode = document.getElementById('ticketBarcode');
    barcode.innerHTML = '';
    for (var b = 0; b < 34; b++){
      var bar = document.createElement('div');
      bar.style.height = (Math.random()*70 + 30) + '%';
      barcode.appendChild(bar);
    }
  }

  document.getElementById('newPurchase').addEventListener('click', closeModal);

  /* ---------------- toast ---------------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('is-visible'); }, 3200);
  }

})();