const header = document.getElementById('site-header');
const onScroll = () => {
  requestAnimationFrame(() => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
};
window.addEventListener('scroll', onScroll, { passive: true });

const menuBtn = document.getElementById('mobile-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

document.querySelectorAll('.animate-up').forEach(el => revealObserver.observe(el));

document.querySelectorAll('.stagger-children').forEach(container => {
  Array.from(container.children).forEach((el, i) => {
    el.style.setProperty('--i', i);
    if (!el.classList.contains('animate-up')) {
      el.classList.add('animate-up');
      revealObserver.observe(el);
    }
  });
});





const parallaxEls = document.querySelectorAll('[data-parallax]');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.04;
        const rect = el.getBoundingClientRect();
        const center = (rect.top + rect.height / 2) / vh;
        const offset = (center - 0.5) * speed * 200;
        el.style.setProperty('--parallax-offset', `${offset}px`);
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
/* --- Workflow Animation --- */
(function(){
  var section = document.getElementById('process');
  if (!section) return;

  var agents = [
    { id:'orchestrator', label:'Orchestrator', x:100, y:100 },
    { id:'code',         label:'Code',         x:300, y:100 },
    { id:'research',     label:'Research',     x:100, y:300 },
    { id:'review',       label:'Review',       x:300, y:300 },
  ];

  var routes = [
    { from:0, to:1 }, { from:1, to:0 },
    { from:0, to:2 }, { from:2, to:0 },
    { from:0, to:3 }, { from:3, to:0 },
    { from:1, to:2 }, { from:2, to:1 },
    { from:1, to:3 }, { from:3, to:1 },
    { from:2, to:3 }, { from:3, to:2 },
  ];

  var logMessages = {
    orchestrator: ['Analyzing task queue...','Assigning next task...','Delegating to team...','Scheduling pipeline...','Balancing workload...'],
    code:         ['Generating TypeScript...','Writing unit tests...','Refactoring module...','Building API...','Compiling assets...'],
    research:     ['Searching documentation...','Finding API examples...','Analyzing requirements...','Cross-referencing data...','Fetching references...'],
    review:       ['Checking pull request...','Running static analysis...','Tests passed.','Lint OK.','Approving changes...'],
  };

  var lineEls = section.querySelectorAll('.wf-line');
  var particleEl = section.querySelector('.wf-particle');
  var logContainer = document.getElementById('wf-log-messages');

  var nodeEls = {};
  agents.forEach(function(a){
    var el = section.querySelector('.wf-node[data-agent="'+a.id+'"]');
    if(el) nodeEls[a.id] = el;
  });

  function setNodeActive(agentIdx, state){
    var agent = agents[agentIdx];
    var el = nodeEls[agent.id];
    if(el){
      if(state) el.classList.add('active');
      else el.classList.remove('active');
    }
  }

  function setLineActive(routeIdx, state){
    var el = lineEls[routeIdx];
    if(el){
      if(state) el.classList.add('active');
      else el.classList.remove('active');
    }
  }

  function addLogEntry(agentId, msg){
    var agent = agents.find(function(a){ return a.id === agentId; });
    if(!agent) return;
    var entry = document.createElement('div');
    entry.className = 'wf-log-entry';
    entry.innerHTML = '<span class="wf-log-agent">'+agent.label+'</span> <span class="wf-log-msg">'+msg+'</span>';
    logContainer.appendChild(entry);
    while(logContainer.children.length > 5) logContainer.removeChild(logContainer.firstChild);
    requestAnimationFrame(function(){ entry.classList.add('visible'); });
  }

  var animating = false;
  var particleFrame = null;
  var animTimers = [];

  function clearTimers(){
    animTimers.forEach(function(t){ clearTimeout(t); });
    animTimers = [];
  }

  function animateParticle(x1, y1, x2, y2, duration){
    if(particleFrame) cancelAnimationFrame(particleFrame);
    particleEl.classList.add('active');
    var start = performance.now();
    function tick(now){
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var x = x1 + (x2 - x1) * eased;
      var y = y1 + (y2 - y1) * eased;
      particleEl.setAttribute('cx', x);
      particleEl.setAttribute('cy', y);
      if(t < 1) particleFrame = requestAnimationFrame(tick);
      else particleEl.classList.remove('active');
    }
    particleFrame = requestAnimationFrame(tick);
  }

  function step(){
    if(!animating) return;

    var fromIdx = Math.floor(Math.random() * agents.length);
    var possible = routes.filter(function(r){ return r.from === fromIdx; });
    var route = possible[Math.floor(Math.random() * possible.length)];
    var routeIdx = routes.indexOf(route);
    var toIdx = route.to;

    var fromAgent = agents[fromIdx];
    var toAgent = agents[toIdx];

    agents.forEach(function(a,i){ setNodeActive(i, false); });
    setNodeActive(fromIdx, true);
    setNodeActive(toIdx, true);
    setLineActive(routeIdx, true);

    animateParticle(fromAgent.x, fromAgent.y, toAgent.x, toAgent.y, 500);

    var msgs = logMessages[toAgent.id];
    var msg = msgs[Math.floor(Math.random() * msgs.length)];
    addLogEntry(toAgent.id, msg);

    var t1 = setTimeout(function(){
      setLineActive(routeIdx, false);
    }, 700);

    var pause = 800 + Math.random() * 1200;
    var t2 = setTimeout(function(){
      step();
    }, pause);

    animTimers.push(t1, t2);
  }

  function start(){
    if(animating) return;
    animating = true;
    clearTimers();
    addLogEntry('orchestrator', 'Initializing team...');
    setTimeout(function(){
      setNodeActive(0, true);
      setTimeout(function(){ step(); }, 1500);
    }, 500);
  }

  function stop(){
    animating = false;
    clearTimers();
    if(particleFrame){ cancelAnimationFrame(particleFrame); particleFrame = null; }
    agents.forEach(function(a,i){ setNodeActive(i, false); });
    for(var i = 0; i < lineEls.length; i++) lineEls[i].classList.remove('active');
    particleEl.classList.remove('active');
  }

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) start();
      else stop();
    });
  }, {threshold: 0.2});

  obs.observe(section);
})();
