function _cloneAnswerBlock() {
    const output = document.querySelector("#gpt-output");
    const template = document.querySelector('#chat-template');
    const clone = template.cloneNode(true);
    clone.id = "";
    output.appendChild(clone);
    clone.classList.remove("hidden")
    return clone.querySelector(".message");
}

function addToLog(message) {
    const infoBlock = _cloneAnswerBlock();

    if (!infoBlock) {
        console.error("Erstellung des Informationsblocks fehlgeschlagen");
        return null;
    }

    infoBlock.innerText = message;
    return infoBlock;
}

function getChatHistory() {
    const infoBlocks = document.querySelectorAll(".message:not(#chat-template .message)");

    if (!infoBlocks.length) {
        console.warn('Keine Informationsblöcke gefunden');
        return [];
    }

    return Array.from(infoBlocks).map(block => block.innerHTML);
}


async function fetchPromptResponse(prompt) {
    //let ordre = "Bitte erstellen Sie eine Zusammenfassung des Textes:";
    const response = await fetch("/prompt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: getChatHistory() }),
    });

    return response.body.getReader();
}

async function readResponseChunks(reader, gptOutput) {
    const decoder = new TextDecoder();
    const converter = new showdown.Converter();

    let chunks = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks += decoder.decode(value);
        gptOutput.innerHTML = converter.makeHtml(chunks);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#prompt-form");
    const spinnerIcon = document.querySelector("#spinner-icon");
    const sendIcon = document.querySelector("#send-icon");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        spinnerIcon.classList.remove("hidden");
        sendIcon.classList.add("hidden");

        const prompt = form.elements.prompt.value;
        addToLog(prompt);

        try {
            const gptOutput = addToLog("GPT fasst den Text zusammen...");
            const reader = await fetchPromptResponse(prompt);
            await readResponseChunks(reader, gptOutput);
        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);
        } finally {
            spinnerIcon.classList.add("hidden");
            sendIcon.classList.remove("hidden");
            hljs.highlightAll();
        }
    });
});