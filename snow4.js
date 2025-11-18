// ==========================
//        НАСТРОЙКИ
// ==========================
const FLAKE_COUNT = 20;
const MIN_SIZE = 45;
const MAX_SIZE = 95;
const FALL_SPEED = 0.7;
const SWING_SPEED = 0.02;
const GLOBAL_WIND_CHANGE = 0.002;
const CURSOR_REPEL_DISTANCE = 150; // радиус, в котором снежинки пугаются
const CURSOR_REPEL_FORCE = 2.2;    // сила, с которой они убегают

// размещай свои PNG-снежинки
const snowflakeImages = [
  "wolf.svg", 
  "croc.svg",
];

// ==========================
//       CANVAS
// ==========================
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.pointerEvents = "none";
canvas.style.zIndex = 999999;

const ctx = canvas.getContext("2d");
let W = (canvas.width = window.innerWidth);
let H = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

// ==========================
// ЗАГРУЗКА КАРТИНОК
// ==========================
let images = [];
snowflakeImages.forEach(src => {
  const img = new Image();
  img.src = src;
  images.push(img);
});

// ==========================
//      КЛАСС СНЕЖИНКИ
// ==========================
class Snowflake {
  constructor() {
    this.reset();
  }

  reset() {
    this.size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    this.x = Math.random() * W;
    this.y = Math.random() * -H;
    this.speedY = FALL_SPEED + Math.random() * 0.8;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.swing = Math.random() * Math.PI * 2;

    // случайная картинка
    this.img = images[Math.floor(Math.random() * images.length)];

    // эмодзи для этой снежинки
    this.emojis = ["🍆", "🍌", "🍑", "💦"];
    this.emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
  }

  update(mouseWind, globalWind) {
    this.y += this.speedY;
    this.x += Math.sin(this.swing) * 0.6 + mouseWind + globalWind;
    this.swing += SWING_SPEED;

    this.rotation += this.rotationSpeed;

    // выход за экран — перезапуск
    if (this.y > H + this.size) {
      this.reset();
      this.y = -this.size;
    }

    // -------------------------
    // УБЕГАНИЕ ОТ КУРСОРА
    // -------------------------
    if (mouseX !== null) {
        let dx = this.x - mouseX;
        let dy = this.y - mouseY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CURSOR_REPEL_DISTANCE) {
            // нормализуем вектор
            let nx = dx / dist;
            let ny = dy / dist;

            // сила отталкивания уменьшается с расстоянием
            let force = (CURSOR_REPEL_DISTANCE - dist) / CURSOR_REPEL_DISTANCE;
            force *= CURSOR_REPEL_FORCE;

            // применяем отталкивание
            this.x += nx * force * 8;
            this.y += ny * force * 8;

            // усиленное вращение от страха
            this.rotation += (Math.random() - 0.5) * 0.3;
        }
    }

    // -------------------------
    // ВЗРЫВ ПРИ КАСАНИИ
    // -------------------------
    if (
      mouseX !== null &&
      Math.abs(this.x - mouseX) < this.size &&
      Math.abs(this.y - mouseY) < this.size
    ) {
      explosions.push(new Explosion(this.x, this.y));

      let count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        if (fragments.length < MAX_FRAGMENTS_ON_SCREEN) {
          fragments.push(new Fragment(this.x, this.y, this.emoji));
        }
      }

      this.reset();
    }
}

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}


// ==========================
//   КЛАСС ВСПЫШКИ-ВЗРЫВА
// ==========================
class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 5;
    this.maxSize = 35 + Math.random() * 15;
    this.alpha = 1;
  }

  update() {
    this.size += 2;
    this.alpha -= 0.05;
    return this.alpha > 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  }
}

// ==========================
//    КЛАСС ОСКОЛКОВ
// ==========================
class Fragment {
  constructor(x, y, emoji) {
    // центр взрыва
    this.centerX = x;
    this.centerY = y;

    // начальное положение
    this.angle = Math.random() * Math.PI * 2;
    if (this.size > 70) {
    this.radius = 3 + Math.random() * 10;   // маленькое начальное расстояние
} else {
    this.radius = 5 + Math.random() * 20;
}
    this.angularSpeed = 0.12 + Math.random() * 0.15;

    // первая позиция на спирали
    this.x = this.centerX + Math.cos(this.angle) * this.radius;
    this.y = this.centerY + Math.sin(this.angle) * this.radius;

    this.char = emoji;


    // 🎉 шанс на редкое гигантское эмодзи 5%
    if (Math.random() < 0.05) {
  this.size = 90 + Math.random() * 40; // ГИГАНТ

  // 🔥 создаём огненный взрыв в точке появления
  //firebursts.push(new FireBurst(x, y));

} else {
  this.size = 20 + Math.random() * 25;
}


    // 🎯 эффект «выстрела вверх»
    this.speedY = -4 - Math.random() * 4; // летит вверх!

    // 🌈 дуга полёта (как парабола)
    this.speedX = (Math.random() - 0.5) * 7;

    // красивое вращение
    this.rotation = Math.random() * Math.PI;
    this.rotationSpeed = this.size > 70 
    ? (Math.random() - 0.5) * 0.15   // половина скорости
    : (Math.random() - 0.5) * 0.3;


    this.alpha = 1;
    this.gravity = this.size > 70 ? 0.08 : 0.18; // ускорение вниз
  }

  update() {
    // вращение вокруг центра взрыва
    this.angle += this.angularSpeed;
    this.radius += 0.8; // расширение вихря наружу (как спираль)

    // позиция на спирали
    this.x = this.centerX + Math.cos(this.angle) * this.radius;
    this.y = this.centerY + Math.sin(this.angle) * this.radius;

    // эффект "гравитации" — вихрь постепенно падает вниз
    this.centerY += 0.6;

    // небольшое вращение самого эмодзи
    this.rotation += this.rotationSpeed;

    // исчезновение
    this.alpha -= 0.02;

if (this.size > 70) {      // гигантский эмодзи
    if (this.radius > 600) return false; // улетел — удалить
    if (this.y > H + 300) return false;  // упал — удалить
    if (isNaN(this.x) || isNaN(this.y)) return false; // ошибка координат
}
    return this.alpha > 0;
}

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.font = `${this.size}px serif`;
    ctx.fillText(this.char, -this.size / 2, this.size / 2);

    ctx.restore();
  }
}

// КЛАСС ОГНЕННОГО ВЗРЫВА

class FireBurst {
  constructor(x, y) {
    

    this.size = 10;
    this.maxSize = 120 + Math.random() * 80; // большой огненный взрыв
    this.alpha = 1;

    // скорость расширения
    this.expand = 6 + Math.random() * 4;
  }

  update() {
    this.size += this.expand;
    this.alpha -= 0.035;
    return this.alpha > 0;

    if (!this.life) this.life = 0;
this.life++;

if (this.size > 70 && this.life > 120) {  
    // 120 кадров ≈ 2 секунды
    return false; 
}

  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    // создаём огненный градиент
    const grd = ctx.createRadialGradient(
      this.x,
      this.y,
      this.size * 0.2,
      this.x,
      this.y,
      this.size
    );

    grd.addColorStop(0, "rgba(255, 200, 50, 1)");  // жёлтый центр
    grd.addColorStop(0.4, "rgba(255, 80, 0, 0.9)"); // оранжевый
    grd.addColorStop(1, "rgba(120, 0, 0, 0)");     // красный → прозрачный

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}



// ==========================
//    МАССИВЫ
// ==========================
let flakes = [];
let explosions = [];
let fragments = [];
let firebursts = [];

// ==========================
//         МЫШКА
// ==========================
let mouseX = null;
let mouseY = null;
let mouseWind = 0;
const WIND_STRENGTH = 0.02;

window.addEventListener("mousemove", (e) => {
  const dx = e.clientX - (mouseX ?? e.clientX);
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseWind = dx * WIND_STRENGTH;
});

// ==========================
//      ВЕТЕР (рандом)
// ==========================
let globalWind = 0;

function updateWind() {
  globalWind += (Math.random() - 0.5) * GLOBAL_WIND_CHANGE;

  // ограничение
  if (globalWind > 0.4) globalWind = 0.4;
  if (globalWind < -0.4) globalWind = -0.4;

  requestAnimationFrame(updateWind);
}
updateWind();

// ==========================
//        ЗАПУСК
// ==========================
for (let i = 0; i < FLAKE_COUNT; i++) {
  flakes.push(new Snowflake());
}
const MAX_FRAGMENTS_ON_SCREEN = 20; // можно уменьшить

function animate() {
  ctx.clearRect(0, 0, W, H);

  flakes.forEach(flake => {
    flake.update(mouseWind, globalWind);
    flake.draw();
  });

  // взрывы
  explosions = explosions.filter(ex => {
    ex.update();
    ex.draw();
    return ex.alpha > 0;
  });

  // осколки
  fragments = fragments.filter(f => {
    f.update();
    f.draw();
    return f.alpha > 0;
  });
// 🔥 огненный взрыв
firebursts = firebursts.filter(fire => {
  fire.update();
  fire.draw();
  return fire.alpha > 0;
});

  requestAnimationFrame(animate);
}

animate();
