document.addEventListener("DOMContentLoaded", () => {
    const micBtn = document.getElementById("mic-btn");
    const speakBtn = document.getElementById("speak-btn");
    const resultTextarea = document.getElementById("result");
    const translationTextarea = document.getElementById("translation");
    const inputLanguageSelect = document.getElementById("inputLanguage");
    const outputLanguageSelect = document.getElementById("outputLanguage");
    const inputFlag = document.querySelector(".input-flag");
    const outputFlag = document.querySelector(".output-flag");
    const inputBoxFlag = document.querySelector(".flag-large.input-box-flag");
    const outputBoxFlag = document.querySelector(".flag-large.output-box-flag");

    let recognition;

    const flagMapping = {
        "en-US": "en-us.png",
        "es-ES": "es-es.png",
        "fr-FR": "fr-fr.png",
        "zh-CN": "zh-cn.png",
        "de-DE": "de-de.png",
        "es": "es-es.png",
        "fr": "fr-fr.png",
        "zh": "zh-cn.png",
        "en": "en-us.png",
        "de": "de-de.png",
    };

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join(" ");
            resultTextarea.value = transcript;
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert(`Speech recognition error: ${event.error}`);
        };
    } else {
        alert("Speech Recognition API is not supported in this browser.");
    }

    micBtn.addEventListener("mousedown", () => {
        if (recognition && recognition.state !== "started") {
            recognition.start();
            console.log("Speech recognition started");
        }
    });

    micBtn.addEventListener("mouseup", () => {
        if (recognition) {
            recognition.stop();
            console.log("Speech recognition stopped");
        }
    });

    speakBtn.addEventListener("click", () => {
        const translatedText = translationTextarea.value.trim();
        if (translatedText) {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            const selectedLanguage = outputLanguageSelect.value;
            utterance.lang = selectedLanguage;
            speechSynthesis.speak(utterance);
        } else {
            alert("No translated text to speak.");
        }
    });

    inputLanguageSelect.addEventListener("change", () => {
        const selectedLanguage = inputLanguageSelect.value;
        if (flagMapping[selectedLanguage]) {
            const flagPath = `/static/img/${flagMapping[selectedLanguage]}`;
            inputFlag.src = flagPath;
            inputBoxFlag.src = flagPath;
            console.log("Input Flags updated to:", flagPath);

            // Update SpeechRecognition language
            if (recognition) {
                recognition.lang = selectedLanguage;
                console.log("Speech recognition language updated to:", selectedLanguage);
            }
        } else {
            console.error("No flag mapping found for input language:", selectedLanguage);
        }
    });

    outputLanguageSelect.addEventListener("change", () => {
        const selectedLanguage = outputLanguageSelect.value;
        if (flagMapping[selectedLanguage]) {
            const flagPath = `/static/img/${flagMapping[selectedLanguage]}`;
            outputFlag.src = flagPath;
            outputBoxFlag.src = flagPath;
            console.log("Output Flags updated to:", flagPath);
        } else {
            console.error("No flag mapping found for output language:", selectedLanguage);
        }
    });

    async function translateText(inputText, inputLanguage, outputLanguage) {
        try {
            if (!inputText.trim()) {
                alert("No text to translate.");
                return;
            }

            const response = await fetch("/translate_openai/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: inputText,
                    input_language: inputLanguage,
                    output_language: outputLanguage,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data.translated_text) {
                translationTextarea.value = data.translated_text;
                console.log("Translation successful:", data.translated_text);
            } else {
                throw new Error(data.error || "Translation failed.");
            }
        } catch (error) {
            console.error("Translation error:", error.message);
            alert(`Translation error: ${error.message}`);
        }
    }

    recognition.onend = () => {
        const inputText = resultTextarea.value.trim();
        if (inputText) {
            const inputLanguage = inputLanguageSelect.value;
            const outputLanguage = outputLanguageSelect.value;
            translateText(inputText, inputLanguage, outputLanguage);
        } else {
            alert("No input text to translate.");
        }
    };
});
