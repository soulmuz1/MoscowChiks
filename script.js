
// МОСКОВСКИЕ ЧИКСЫ — JAVASCRIPT
// Публичные публикации загружаются из Google Sheets.
// Новые публикации отправляются на сервер со статусом pending.

const API_URL = "https://script.google.com/macros/s/AKfycbyJGFx8-2klhGYAF9zT4nMjqHrZT-iqIQUA-0N_FKWN2a7G6IXNpkCmL_TnJNB-Td7KLg/exec";
const TURNSTILE_SITE_KEY = "0x4AAAAAAF6EQ6xxCHPKZtYz";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const container = document.getElementById("memeContainer");
const form = document.getElementById("memeForm");
const showForm = document.getElementById("showForm");
const imageInput = document.getElementById("memeImage");
const imagePreview = document.getElementById("imagePreview");
const storiesContainer = document.getElementById("storiesContainer");
const storyForm = document.getElementById("storyForm");
const showStoryForm = document.getElementById("showStoryForm");

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

let memeTurnstileId = null;
let storyTurnstileId = null;
let memeTurnstileToken = "";
let storyTurnstileToken = "";

// ---------- СООБЩЕНИЯ ФОРМ ----------

function setStatus(id, message, isError = false) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("form-error", isError);
}

// ---------- ЗАГРУЗКА JSONP ----------

let jsonpCounter = 0;

function loadApproved(type) {
    return new Promise((resolve, reject) => {
        const callbackName = "moscowChiksCallback" + (++jsonpCounter);
        const script = document.createElement("script");

        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Сервер не ответил вовремя"));
        }, 15000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            script.remove();
        }

        window[callbackName] = (result) => {
            cleanup();

            if (!result || result.success !== true || !Array.isArray(result.data)) {
                reject(new Error(result?.error || "Не удалось загрузить публикации"));
                return;
            }

            resolve(result.data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error("Не удалось подключиться к серверу"));
        };

        script.src =
            API_URL +
            "?type=" + encodeURIComponent(type) +
            "&callback=" + encodeURIComponent(callbackName) +
            "&_=" + Date.now();

        document.head.appendChild(script);
    });
}

// ---------- ОТОБРАЖЕНИЕ ИСТОРИЙ ----------

function renderStories() {
    storiesContainer.innerHTML = "";

    if (stories.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-stories";
        emptyMessage.textContent = "Пока одобренных историй нет. Добавьте первую легенду!";
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
        title.textContent = story.title || "Без названия";

        const text = document.createElement("p");
        text.textContent = story.text || "";

        card.append(number, title, text);
        storiesContainer.appendChild(card);
    });
}

let stories = [];

async function refreshStories() {
    storiesContainer.textContent = "Загружаем истории...";

    try {
        stories = await loadApproved("stories");
        renderStories();
    } catch (error) {
        console.error("Ошибка загрузки историй:", error);
        storiesContainer.textContent = "Не удалось загрузить истории. Обновите страницу позже.";
    }
}

// ---------- ОТОБРАЖЕНИЕ МЕМОВ ----------

let memes = [];

function renderMemes() {
    container.innerHTML = "";

    if (memes.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-memes";
        emptyMessage.textContent = "Пока одобренных мемов нет. Добавьте первый!";
        container.appendChild(emptyMessage);
        return;
    }

    memes.forEach((meme, index) => {
        const card = document.createElement("article");
        card.className = "card";

        const number = document.createElement("span");
        number.textContent = "😂 МЕМ № " + String(index + 1).padStart(3, "0");

        const title = document.createElement("h3");
        title.textContent = meme.title || "Без названия";

        const description = document.createElement("p");
        description.textContent = meme.text || "";

        card.append(number, title, description);

        if (meme.image) {
            const img = document.createElement("img");
            img.src = meme.image;
            img.alt = meme.title || "Изображение мема";
            img.loading = "lazy";

            img.onerror = () => {
                img.alt = "Не удалось загрузить изображение";
                img.hidden = true;
            };

            card.appendChild(img);
        }

        container.appendChild(card);
    });
}

async function refreshMemes() {
    container.textContent = "Загружаем мемы...";

    try {
        memes = await loadApproved("memes");
        renderMemes();
    } catch (error) {
        console.error("Ошибка загрузки мемов:", error);
        container.textContent = "Не удалось загрузить мемы. Обновите страницу позже.";
    }
}

// ---------- TURNSTILE ----------

window.onTurnstileLoad = function () {
    if (!window.turnstile) return;

    const memeElement = document.getElementById("memeTurnstile");
    const storyElement = document.getElementById("storyTurnstile");

    if (memeElement && memeTurnstileId === null) {
        memeTurnstileId = turnstile.render(memeElement, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token) => {
                memeTurnstileToken = token;
            },
            "expired-callback": () => {
                memeTurnstileToken = "";
            },
            "error-callback": () => {
                memeTurnstileToken = "";
            }
        });
    }

    if (storyElement && storyTurnstileId === null) {
        storyTurnstileId = turnstile.render(storyElement, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token) => {
                storyTurnstileToken = token;
            },
            "expired-callback": () => {
                storyTurnstileToken = "";
            },
            "error-callback": () => {
                storyTurnstileToken = "";
            }
        });
    }
};

function resetCaptcha(type) {
    if (!window.turnstile) return;

    if (type === "memes" && memeTurnstileId !== null) {
        memeTurnstileToken = "";
        turnstile.reset(memeTurnstileId);
    }

    if (type === "stories" && storyTurnstileId !== null) {
        storyTurnstileToken = "";
        turnstile.reset(storyTurnstileId);
    }
}

// ---------- ОТПРАВКА НА APPS SCRIPT ----------

async function postPublication(payload) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=UTF-8"
        },
        body: JSON.stringify(payload),
        redirect: "follow"
    });

    const responseText = await response.text();

    let result;

    try {
        result = JSON.parse(responseText);
    } catch {
        throw new Error("Сервер вернул неожиданный ответ");
    }

    if (!result.success) {
        throw new Error(result.error || "Сервер не принял публикацию");
    }

    return result;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const dataUrl = String(reader.result || "");
            const commaIndex = dataUrl.indexOf(",");

            if (commaIndex < 0) {
                reject(new Error("Не удалось прочитать изображение"));
                return;
            }

            resolve(dataUrl.slice(commaIndex + 1));
        };

        reader.onerror = () => {
            reject(new Error("Ошибка чтения изображения"));
        };

        reader.readAsDataURL(file);
    });
}

function setFormBusy(formElement, busy) {
    const submitButton = formElement.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = busy;
    }
}

// ---------- ФОРМА ИСТОРИЙ ----------

showStoryForm.addEventListener("click", () => {
    storyForm.hidden = !storyForm.hidden;

    if (!storyForm.hidden) {
        storyForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
});

storyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("storyTitle").value.trim();
    const text = document.getElementById("storyText").value.trim();

    if (!title || !text) {
        setStatus("storyStatus", "Заполни название и текст истории.", true);
        return;
    }

    if (!storyTurnstileToken) {
        setStatus("storyStatus", "Сначала пройди проверку Cloudflare.", true);
        return;
    }

    setFormBusy(storyForm, true);
    setStatus("storyStatus", "Отправляем историю...");

    try {
        await postPublication({
            type: "stories",
            title,
            text,
            turnstileToken: storyTurnstileToken
        });

        storyForm.reset();
        storyForm.hidden = true;

        setStatus(
            "storyStatus",
            "История отправлена на модерацию. После одобрения она появится на сайте."
        );

    } catch (error) {
        console.error("Ошибка отправки истории:", error);

        setStatus(
            "storyStatus",
            "Не удалось подтвердить отправку: " + error.message +
            ". Заявка могла попасть на сервер. Перед повторной отправкой проверь лист stories в Google Sheets.",
            true
        );

    } finally {
        setFormBusy(storyForm, false);
        resetCaptcha("stories");
    }
});

document.getElementById("cancelStoryForm").addEventListener("click", () => {
    storyForm.reset();
    storyForm.hidden = true;
    setStatus("storyStatus", "");
    resetCaptcha("stories");
});

// ---------- ФОРМА МЕМОВ ----------

showForm.addEventListener("click", () => {
    form.hidden = !form.hidden;

    if (!form.hidden) {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
});

// Предпросмотр картинки

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        alert("Выбери картинку в формате JPG, PNG или WEBP.");
        imageInput.value = "";
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
        alert("Картинка должна весить не больше 4 МБ.");
        imageInput.value = "";
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        imagePreview.src = reader.result;
        imagePreview.hidden = false;
    };

    reader.onerror = () => {
        alert("Не удалось прочитать картинку.");
    };

    reader.readAsDataURL(file);
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("memeTitle").value.trim();
    const text = document.getElementById("memeText").value.trim();
    const file = imageInput.files[0];

    if (!title || !text) {
        setStatus("memeStatus", "Заполни название и описание мема.", true);
        return;
    }

    if (!memeTurnstileToken) {
        setStatus("memeStatus", "Сначала пройди проверку Cloudflare.", true);
        return;
    }

    setFormBusy(form, true);
    setStatus("memeStatus", "Отправляем мем...");

    try {
        const payload = {
            type: "memes",
            title,
            text,
            turnstileToken: memeTurnstileToken
        };

        if (file) {
            payload.imageBase64 = await fileToBase64(file);
            payload.imageMimeType = file.type;
        }

        await postPublication(payload);

        form.reset();
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
        form.hidden = true;

        setStatus(
            "memeStatus",
            "Мем отправлен на модерацию. После одобрения он появится на сайте."
        );

    } catch (error) {
        console.error("Ошибка отправки мема:", error);

        setStatus(
            "memeStatus",
            "Не удалось подтвердить отправку: " + error.message +
            ". Заявка могла попасть на сервер. Перед повторной отправкой проверь лист memes в Google Sheets.",
            true
        );

    } finally {
        setFormBusy(form, false);
        resetCaptcha("memes");
    }
});

document.getElementById("cancelForm").addEventListener("click", () => {
    form.reset();
    imagePreview.hidden = true;
    imagePreview.removeAttribute("src");
    form.hidden = true;
    setStatus("memeStatus", "");
    resetCaptcha("memes");
});

// ---------- СЛУЧАЙНЫЕ ЦИТАТЫ ----------

document.getElementById("quoteButton").addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);

    document.getElementById("randomQuote").textContent =
        "«" + quotes[randomIndex] + "»";
});

// ---------- СЕКРЕТНАЯ КОМНАТА ----------

document.getElementById("secretBtn").addEventListener("click", () => {
    const password = prompt("Введи секретное слово:");

    if (password === null) return;

    if (
        password.trim().toLocaleLowerCase("ru-RU") ===
        "царь проснулся".toLocaleLowerCase("ru-RU")
    ) {
        const secret = document.getElementById("secretSection");

        secret.hidden = false;
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

// ---------- ЗАПУСК ----------

refreshMemes();
refreshStories();

console.log("МОСКОВСКИЕ ЧИКСЫ ЗАПУЩЕНЫ!");
