(function(){

  // ===== Создание кнопки =====
  const btn = document.createElement("div");
  btn.id = "magic-btn";
  btn.innerHTML = `<span class="big">50%</span><span class="small">OFF</span>`;
  document.body.appendChild(btn);

  let stage = 0;
  let avoiding = false;
  let escapeCooldown = false;

  // ===== Звуки =====
  const snd1 = new Audio("N0.mp3");
  const snd2 = new Audio("NO2.mp3");
  const snd3 = new Audio("Not_doing_it.mp3");

  // ===== Воспроизведение отрезка звука =====
  function playSegment(audio, start, end){
    audio.currentTime = start;
    audio.play();

    const timer = setInterval(()=>{
      if(audio.currentTime >= end){
        audio.pause();
        clearInterval(timer);
      }
    }, 30);
  }

  // ===== Телепорт для 1-го и 2-го клика =====
  function teleportButton(){
    const w = window.innerWidth - 120;
    const h = window.innerHeight - 120;

    btn.style.left = Math.random() * w + "px";
    btn.style.top  = Math.random() * h + "px";
    btn.style.right = "auto";
  }

  // ===== Убегание, но ПОЙМАТЬ ЛЕГКО =====
  function softMoveAway(mx, my){
    if(!avoiding || escapeCooldown) return;

    const r = btn.getBoundingClientRect();
    const bx = r.left + r.width/2;
    const by = r.top + r.height/2;

    const dx = bx - mx;
    const dy = by - my;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < 85){
      escapeCooldown = true;

      const angle = Math.atan2(dy, dx);
      const moveDist = 90;

      let nx = bx + Math.cos(angle) * moveDist;
      let ny = by + Math.sin(angle) * moveDist;

      const halfW = r.width/2;
      const halfH = r.height/2;
      const margin = 5;

      nx = Math.min(window.innerWidth - halfW - margin, Math.max(halfW + margin, nx));
      ny = Math.min(window.innerHeight - halfH - margin, Math.max(halfH + margin, ny));

      btn.style.left = (nx - halfW) + "px";
      btn.style.top  = (ny - halfH) + "px";
      btn.style.right = "auto";

      setTimeout(()=> escapeCooldown = false, 180);
    }
  }

  document.addEventListener("mousemove", e=>{
    softMoveAway(e.clientX, e.clientY);
  });

  // ===== Взрыв =====
  function startExplosion(centerX, centerY){
    const expl = document.createElement("div");
    expl.className = "explosion-frame";
    document.body.appendChild(expl);

    const img = new Image();
    img.src = "sprite.png";

    img.onload = () => {

        const frameWidth = img.width / 5;  
        const frameHeight = img.height;    

        // Устанавливаем точный размер контейнера ДО начала анимации
        expl.style.width  = frameWidth + "px";
        expl.style.height = frameHeight + "px";

        // Центрируем контейнер относительно точки кнопки
        expl.style.left = (centerX - frameWidth / 2) + "px";
        expl.style.top  = (centerY - frameHeight / 2) + "px";

        // ——— после этого запускаем анимацию спрайтов ———
        let frame = 0;
        const totalFrames = 5;

        const anim = setInterval(() => {
            expl.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
            frame++;

            if (frame >= totalFrames){
                clearInterval(anim);
                expl.remove();
            }
        }, 90);
    };
}



  // ===== Логика кликов =====
  btn.addEventListener("click", ()=>{

    if(stage >= 3) return; // защита

    stage++;

    // ---- 1 КЛИК ----
    if(stage === 1){
      playSegment(snd1, 0, snd1.duration);
      teleportButton();
    }

    // ---- 2 КЛИК ----
    else if(stage === 2){
      avoiding = true;
      playSegment(snd2, 0, snd2.duration);
      teleportButton();
    }

    // ---- 3 КЛИК ----
    else if(stage === 3){

      avoiding = false;

      btn.style.animation = "shake-angry 0.12s infinite";

      snd3.play();

      const total = snd3.duration;

      // запустить взрыв за 1 секунду до конца
      setTimeout(()=>{
        const r = btn.getBoundingClientRect();
        startExplosion(
    r.left + r.width/2,
    r.top  + r.height/2
);

        btn.remove();
      }, (total - 1) * 1000);
    }

  });

})();
