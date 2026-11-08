// МОСКОВСКИЕ ЧИКСЫ — JAVASCRIPT

const container = document.getElementById("memeContainer");
const form = document.getElementById("memeForm");
const showForm = document.getElementById("showForm");
const imageInput = document.getElementById("memeImage");
const imagePreview = document.getElementById("imagePreview");
const storiesContainer = document.getElementById("storiesContainer");
const storyForm = document.getElementById("storyForm");
const showStoryForm = document.getElementById("showStoryForm");

const defaultMemes = [
    {
        title: "Какой хороший день",
        text: "Чтоб пойти на колобка",
        image: ""
    },
    {
        title: "Я кстати брейкдансом занимался",
        text: "Опа",
        image: ""
    },
    {
        title: "Знаете чо мы забыли",
        text: "Бонди...",
        image: ""
    }
];

const quotes = [
    "Я гей",
    "Телифоны",
    "Когда в зажигалку?",
    "Ярик",
    "Я хочу вкусно и точка",
    "Ать, два",
    "На плов",
    "Жук сквиртуозник",
    "Царь проснулся"
];

// ЗАГРУЗКА МЕМОВ

function loadMemes() {
    try {
        const saved = localStorage.getItem("moscowMemes");

        if (saved === null) {
            return [...defaultMemes];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [...defaultMemes];

    } catch (error) {
        console.error("Ошибка загрузки:", error);
        return [...defaultMemes];
    }
}

let memes = loadMemes();

// СОХРАНЕНИЕ

function saveMemes() {
    try {
        localStorage.setItem(
            "moscowMemes",
            JSON.stringify(memes)
        );

        return true;

    } catch (error) {
        alert("Не удалось сохранить мем. Возможно, закончилось место.");
        console.error(error);
        return false;
    }
}


// ИСТОРИИ: ЗАГРУЗКА, СОХРАНЕНИЕ И ОТОБРАЖЕНИЕ

function loadStories() {
    try {
        const saved = localStorage.getItem("moscowStories");
        if (saved === null) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Ошибка загрузки историй:", error);
        return [];
    }
}

let stories = loadStories();

function saveStories() {
    try {
        localStorage.setItem("moscowStories", JSON.stringify(stories));
        return true;
    } catch (error) {
        alert("Не удалось сохранить историю. Возможно, закончилось место в браузере.");
        console.error("Ошибка сохранения истории:", error);
        return false;
    }
}

function renderStories() {
    storiesContainer.innerHTML = "";

    if (stories.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-stories";
        emptyMessage.textContent = "Пока историй нет. Добавьте первую легенду!";
        storiesContainer.appendChild(emptyMessage);
        return;
    }

    stories.forEach((story, index) => {
        const card = document.createElement("article");
        card.className = "story-card";

        const number = document.createElement("span");
        number.className = "story-number";
        number.textContent = "📖 ИСТОРИЯ № " + String(index + 1).padStart(3, "0");

        const title = document.createElement("h3");
        title.textContent = story.title;

        const text = document.createElement("p");
        text.textContent = story.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "Удалить историю";

        deleteButton.addEventListener("click", () => {
            if (!confirm("Точно удалить эту историю?")) return;

            const previous = [...stories];
            stories.splice(index, 1);

            if (!saveStories()) {
                stories = previous;
                return;
            }
            renderStories();
        });

        card.append(number, title, text, deleteButton);
        storiesContainer.appendChild(card);
    });
}

showStoryForm.addEventListener("click", () => {
    storyForm.hidden = !storyForm.hidden;
    if (!storyForm.hidden) {
        storyForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});

storyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("storyTitle").value.trim();
    const text = document.getElementById("storyText").value.trim();

    if (!title || !text) {
        alert("Заполни название и текст истории!");
        return;
    }

    stories.unshift({ title, text });

    if (!saveStories()) {
        stories.shift();
        return;
    }

    renderStories();
    storyForm.reset();
    storyForm.hidden = true;
    alert("История сохранена! 📖");
});

document.getElementById("cancelStoryForm").addEventListener("click", () => {
    storyForm.reset();
    storyForm.hidden = true;
});

// ПОКАЗ МЕМОВ

function renderMemes() {
    container.innerHTML = "";

    memes.forEach((meme, index) => {

        const card = document.createElement("article");
        card.className = "card";

        const number = document.createElement("span");
        number.textContent =
            "😂 МЕМ № " + String(index + 1).padStart(3, "0");

        const title = document.createElement("h3");
        title.textContent = meme.title;

        const description = document.createElement("p");
        description.textContent = meme.text;

        card.append(number, title, description);

        if (meme.image) {
            const img = document.createElement("img");

            img.src = meme.image;
            img.alt = meme.title;

            card.appendChild(img);
        }

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-button";
        deleteButton.textContent = "Удалить мем";

        deleteButton.addEventListener("click", () => {

            const confirmation = confirm(
                "Точно удалить этот мем?"
            );

            if (!confirmation) return;

            const previous = [...memes];

            memes.splice(index, 1);

            if (!saveMemes()) {
                memes = previous;
                return;
            }

            renderMemes();
        });

        card.appendChild(deleteButton);
        container.appendChild(card);
    });
}

// ОТКРЫТИЕ ФОРМЫ

showForm.addEventListener("click", () => {

    form.hidden = !form.hidden;

    if (!form.hidden) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
});

// ПРЕДПРОСМОТР КАРТИНКИ

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) {
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Выбери изображение!");
        imageInput.value = "";
        return;
    }

    if (file.size > 1024 * 1024) {
        alert("Картинка должна весить не больше 1 МБ.");
        imageInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = () =>


{
        imagePreview.src = reader.result;
        imagePreview.hidden = false;
    };

    reader.readAsDataURL(file);
});

// ДОБАВЛЕНИЕ МЕМА

form.addEventListener("submit", (event) => {

    event.preventDefault();

    const title = document
        .getElementById("memeTitle")
        .value.trim();

    const text = document
        .getElementById("memeText")
        .value.trim();

    const file = imageInput.files[0];

    if (!title || !text) {
        alert("Заполни название и описание!");
        return;
    }

    function addMeme(image = "") {

        const newMeme = {
            title: title,
            text: text,
            image: image
        };

        memes.unshift(newMeme);

        if (!saveMemes()) {
            memes.shift();
            return;
        }

        renderMemes();

        form.reset();
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        form.hidden = true;

        alert("Мем успешно добавлен! 😂");
    }

    if (file) {

        const reader = new FileReader();

        reader.onload = () => {
            addMeme(reader.result);
        };

        reader.onerror = () => {
            alert("Ошибка загрузки картинки.");
        };

        reader.readAsDataURL(file);

    } else {

        addMeme();

    }
});

// ОТМЕНА

document.getElementById("cancelForm")
    .addEventListener("click", () => {

        form.reset();
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        form.hidden = true;

    });

// СЛУЧАЙНЫЕ ЦИТАТЫ

document.getElementById("quoteButton")
    .addEventListener("click", () => {

        const randomIndex = Math.floor(
            Math.random() * quotes.length
        );

        document.getElementById("randomQuote").textContent =
            "«" + quotes[randomIndex] + "»";

    });

// СЕКРЕТНАЯ КОМНАТА 👑

document.getElementById("secretBtn")
    .addEventListener("click", () => {

        const password = prompt("Введи секретное слово:");

        if (password === null) return;

        if (password.trim().toLocaleLowerCase("ru-RU") ===
            "царь проснулся".toLocaleLowerCase("ru-RU")) {

            const secret = document.getElementById("secretSection");

            secret.hidden = false;

            // Перезапускаем анимацию, даже если комнату открывали раньше
            secret.classList.remove("secret-open");
            void secret.offsetWidth;
            secret.classList.add("secret-open");

            secret.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } else {
            alert("Неверное слово! 🤫");
        }
    });

// ЗАПУСК САЙТА

renderMemes();
renderStories();

console.log("МОСКОВСКИЕ ЧИКСЫ ЗАПУЩЕНЫ!");