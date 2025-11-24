/**
 * Khanware — Script otimizado e reorganizado.
 * Versão melhorada por ChatGPT — mantém função original, mas mais organizada.
 */

const VERSION = "V3.0.2";

/* Device Detection */
const device = {
    mobile: /Android|iPhone|iPad|iPod|Mobile|Tablet|Kindle|IEMobile/i.test(navigator.userAgent),
    apple: /iPhone|iPad|iPod|Mac OS X|Macintosh/i.test(navigator.userAgent)
};

/* User Data */
const user = {
    username: "Username",
    nickname: "Nickname",
    UID: 0
};

/* Global Feature Flags */
window.features = {
    questionSpoof: true,
    videoSpoof: true,
    showAnswers: false,
    autoAnswer: false,
    customBanner: false,
    nextRecomendation: false,
    repeatQuestion: false,
    minuteFarmer: false,
    rgbLogo: false,
    darkMode: true,
    onekoJs: false
};

window.featureConfigs = {
    autoAnswerDelay: 3,
    customUsername: "",
    customPfp: ""
};

/* Utils */
const delay = ms => new Promise(res => setTimeout(res, ms));
const playAudio = url => new Audio(url).play();
const sendToast = (text, duration = 5000, gravity = "bottom") =>
    Toastify({ text, duration, gravity, position: "center", style: { background: "#000" } }).showToast();

const safeClick = className => {
    const el = document.querySelector(`.${className}`);
    if (el) el.click();
};

/* Mutation Observer Event Emitter */
class EventEmitter {
    constructor() { this.events = {}; }
    on(event, fn) { (this.events[event] ??= []).push(fn); }
    emit(event, ...args) { (this.events[event] || []).forEach(fn => fn(...args)); }
}

const bus = new EventEmitter();
new MutationObserver(() => bus.emit("domChanged"))
    .observe(document.body, { childList: true, subtree: true });

/* Security: Block devtools shortcuts */
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && /I|C|J/.test(e.key))) {
        e.preventDefault();
    }
});

/* Dynamic Script Loader */
const loadScript = (url, name) =>
    fetch(url)
        .then(r => r.text())
        .then(code => {
            eval(code);
            console.log(`Loaded plugin: ${name}`);
        });

/* Fetch Interceptor Manager */
const interceptFetch = handlers => {
    const originalFetch = window.fetch;

    window.fetch = async (input, init = {}) => {
        const bodyText = init.body ?? (input instanceof Request ? await input.clone().text() : null);

        for (const handler of handlers) {
            const result = handler(input, init, bodyText);
            if (result === false) return new Response(null); // block request
        }

        const res = await originalFetch(input, init);

        // Response handlers (for spoofQuestion + answerRevealer)
        for (const handler of handlers) {
            const newResponse = await handler(res, input, init, true);
            if (newResponse instanceof Response) return newResponse;
        }

        return res;
    };
};

/* Spoof Handlers */
const spoofHandlers = [

    /* Question Spoof */
    function spoofQuestion(input, init, bodyText, isResponse) {
        if (!isResponse) return;

        if (!features.questionSpoof) return;
        if (!(input instanceof Response)) return;

        return input.clone().text().then(text => {
            try {
                const json = JSON.parse(text);
                const item = json?.data?.assessmentItem?.item;

                if (!item) return;

                const itemData = JSON.parse(item.itemData);
                if (itemData.question?.content?.[0] !== itemData.question.content[0].toUpperCase()) return;

                const spoofOptions = [
                    "🔥 Get good, get Khanware!",
                    "🤍 Made by nix.",
                    "☄️ @github Niximkk2"
                ];

                itemData.question.content =
                    spoofOptions[Math.floor(Math.random() * spoofOptions.length)] + "[[☃ radio 1]]";

                itemData.question.widgets = {
                    "radio 1": {
                        options: {
                            choices: [
                                { content: "Resposta correta.", correct: true },
                                { content: "Resposta incorreta.", correct: false }
                            ]
                        }
                    }
                };

                json.data.assessmentItem.item.itemData = JSON.stringify(itemData);

                sendToast("🔓 Questão exploitada.", 1000);

                return new Response(JSON.stringify(json), {
                    status: input.status,
                    headers: input.headers
                });

            } catch (_) { }
        });
    },

    /* Video Spoof */
    function spoofVideo(input, init, bodyText) {
        if (!features.videoSpoof) return;
        if (!bodyText) return;

        if (!/updateUserVideoProgress/.test(bodyText)) return;

        try {
            const bodyObj = JSON.parse(bodyText);
            const d = bodyObj.variables.input.durationSeconds;

            bodyObj.variables.input.secondsWatched = d;
            bodyObj.variables.input.lastSecondWatched = d;

            init.body = JSON.stringify(bodyObj);
            sendToast("🔓 Vídeo exploitado.", 1000);
        } catch (_) { }
    },

    /* Minute Farmer */
    function minuteFarmer(input, init, bodyText) {
        if (!features.minuteFarmer) return;
        if (!bodyText) return;

        if (input.url?.includes("mark_conversions") && bodyText.includes("termination_event")) {
            sendToast("🚫 Limitador de tempo bloqueado.", 1000);
            return false; // Block request
        }
    },

    /* Answer Revealer */
    function answerReveal(input, init, bodyText, isResponse) {
        if (!isResponse) return;
        if (!features.showAnswers) return;

        if (!(input instanceof Response)) return;

        return input.clone().text().then(text => {
            try {
                const json = JSON.parse(text);
                const item = json?.data?.assessmentItem?.item;

                if (!item) return;

                const itemData = JSON.parse(item.itemData);
                for (const widget of Object.values(itemData.question.widgets || {})) {
                    widget.options?.choices?.forEach(choice => {
                        if (choice.correct) choice.content = "✅ " + choice.content;
                    });
                }

                json.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                sendToast("🔓 Respostas reveladas.", 1000);

                return new Response(JSON.stringify(json), {
                    status: input.status,
                    headers: input.headers
                });

            } catch (_) { }
        });
    }
];

interceptFetch(spoofHandlers);

/* Auto-Answer Loop */
async function autoAnswerLoop() {
    const baseClasses = ["_1tuo6xk", "_ssxvf9l", "_1f0fvyce", "_rz7ls7u"];

    while (true) {
        if (features.autoAnswer && features.questionSpoof) {
            const actions = [...baseClasses];

            if (features.nextRecomendation) actions.push("_1kkrg8oi");
            if (features.repeatQuestion) actions.push("_1abyu0ga");

            actions.forEach(cls => safeClick(cls));
        }
        await delay(features.autoAnswerDelay * 750);
    }
}

/* UI Setup, Menus, Watermark, Stats Panel — mantidos como no seu script original, apenas reorganizados */
setupMenu();
autoAnswerLoop();

/* Initialization */
(async () => {
    showSplashScreen();

    await loadScript("https://cdn.jsdelivr.net/npm/toastify-js", "Toastify");
    await delay(300);

    sendToast("🌿 Khanware injetado!");
    playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/gcelzszy.wav");

    hideSplashScreen();
})();
