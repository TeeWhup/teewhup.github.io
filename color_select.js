
document.addEventListener("DOMContentLoaded", () => {
    // Случайные цвета
    const colors = ["yellow", "lightgreen"];

    // Выбираем случайный цвет
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Создаём CSS через JS
    const style = document.createElement("style");
    style.innerHTML = `
        ::selection {
            background: ${randomColor};
            color: black;
        }
    `;

    // Добавляем CSS на страницу
    document.head.appendChild(style);
});
