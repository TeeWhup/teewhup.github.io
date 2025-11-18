// ======= СОЗДАЁМ AUDIO ЭЛЕМЕНТ ЧЕРЕЗ JAVASCRIPT =======
const music = document.createElement("audio");
music.id = "bg-music";
music.src = "music.mp3";   // <-- ТУТ ВАЖНО: название твоего файла
music.loop = true;

document.body.appendChild(music);

// Начинаем с громкости 0, чтобы autoplay работал
music.volume = 0.0;

// Пытаемся запустить музыку автоматически
music.play().then(() => {
    // через 0.5 секунды поднимаем громкость до 30%
    setTimeout(() => {
        music.volume = 0.30;
    }, 500);
}).catch(() => {
    console.log("Автовоспроизведение заблокировано — ждём клик");

    const resume = () => {
        music.play();
        setTimeout(() => {
            music.volume = 0.30;
        }, 500);

        document.removeEventListener("click", resume);
    };

    document.addEventListener("click", resume);
});
