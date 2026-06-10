// =====================================
// CONFIGURACIÓN GENERAL DE LA PLANTILLA
// =====================================

const WEDDING_CONFIG = {

    eventDate: "2026-11-14T17:00:00",

    /*
        Cambia este número por el WhatsApp real del cliente.
        Formato México recomendado: 52 + lada + número.
        Ejemplo: 524491234567
    */
    rsvpPhone: "524XXXXXXXXX",

    rsvpMessage:
        "Hola, confirmo mi asistencia a la boda de Sofía y Alejandro.",

    coupleShortName:
        "Sofía & Alejandro"

};

// =====================================
// UTILIDADES
// =====================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const clamp = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
};

// =====================================
// INICIALIZACIÓN
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    initMusic();
    initFadeIn();
    initCountdown();
    initTimeline();
    initPhotoFallbacks();
    initRSVP();
    initDisabledLinks();
    initButtonInteractions();

});

// =====================================
// MÚSICA
// =====================================

function initMusic(){

    const music = $("#bgMusic");
    const playBtn = $("#playBtn");

    if(!music || !playBtn) return;

    let isPlaying = false;

    const setButtonState = () => {
        playBtn.innerHTML = isPlaying
            ? '<i class="fa-solid fa-pause"></i>'
            : '<i class="fa-solid fa-music"></i>';

        playBtn.setAttribute(
            "aria-label",
            isPlaying ? "Pausar música" : "Reproducir música"
        );
    };

    const playMusic = async () => {
        try{
            await music.play();
            isPlaying = true;
            setButtonState();
        }catch(error){
            isPlaying = false;
            setButtonState();
            console.warn(
                "El navegador bloqueó la reproducción automática o no existe musica.mp3.",
                error
            );
        }
    };

    const pauseMusic = () => {
        music.pause();
        isPlaying = false;
        setButtonState();
    };

    playBtn.addEventListener("click", () => {
        if(isPlaying){
            pauseMusic();
        }else{
            playMusic();
        }
    });

    setButtonState();

}

// =====================================
// FADE IN
// =====================================

function initFadeIn(){

    const fadeElements = $$(".fade-in");

    if(!fadeElements.length) return;

    if(!("IntersectionObserver" in window)){
        fadeElements.forEach((element) => element.classList.add("visible"));
        return;
    }

    const fadeObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if(entry.isIntersecting){
                    entry.target.classList.add("visible");
                    fadeObserver.unobserve(entry.target);
                }
            });
        },
        { threshold:0.15 }
    );

    fadeElements.forEach((element) => fadeObserver.observe(element));

}

// =====================================
// CUENTA REGRESIVA
// =====================================

function initCountdown(){

    const daysEl = $("#days");
    const hoursEl = $("#hours");
    const minutesEl = $("#minutes");
    const secondsEl = $("#seconds");

    if(!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const eventDate = new Date(WEDDING_CONFIG.eventDate).getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if(distance <= 0){
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minutesEl.textContent = String(minutes).padStart(2, "0");
        secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

}

// =====================================
// TIMELINE
// =====================================

function initTimeline(){

    const timelineSection = $("#timelineSection");
    const timelineProgress = $("#timelineProgress");
    const timelineItems = $$(".timeline-item");

    if(!timelineSection || !timelineProgress || !timelineItems.length) return;

    let ticking = false;

    const updateTimeline = () => {
        const sectionRect = timelineSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const progressStart = windowHeight * 0.78;
        const progressEnd = sectionRect.height * 0.92;
        const rawProgress = ((progressStart - sectionRect.top) / progressEnd) * 100;
        const progress = clamp(rawProgress, 0, 100);

        timelineProgress.style.height = `${progress}%`;

        timelineItems.forEach((item) => {
            const itemRect = item.getBoundingClientRect();

            if(itemRect.top < windowHeight * 0.78){
                item.classList.add("active");
            }else{
                item.classList.remove("active");
            }
        });

        ticking = false;
    };

    const requestUpdate = () => {
        if(!ticking){
            window.requestAnimationFrame(updateTimeline);
            ticking = true;
        }
    };

    window.addEventListener("scroll", requestUpdate, { passive:true });
    window.addEventListener("resize", requestUpdate);

    updateTimeline();

}

// =====================================
// FALLBACK PARA FOTOS
// =====================================

function initPhotoFallbacks(){

    const photoSections = $$(".photo-section");

    if(!photoSections.length) return;

    photoSections.forEach((section) => {
        const image = section.querySelector("img");

        if(!image){
            section.classList.add("photo-fallback");
            return;
        }

        const handleError = () => {
            section.classList.add("photo-fallback");
            image.remove();
        };

        const handleLoad = () => {
            section.classList.add("photo-loaded");
        };

        image.addEventListener("error", handleError);
        image.addEventListener("load", handleLoad);

        if(image.complete){
            if(image.naturalWidth === 0){
                handleError();
            }else{
                handleLoad();
            }
        }
    });

}

// =====================================
// RSVP WHATSAPP
// =====================================

function initRSVP(){

    const rsvpBtn = $("#rsvpBtn");

    if(!rsvpBtn) return;

    const phone = WEDDING_CONFIG.rsvpPhone.trim();
    const message = encodeURIComponent(WEDDING_CONFIG.rsvpMessage);

    const hasValidPhone =
        phone &&
        !phone.includes("X") &&
        phone.replace(/\D/g, "").length >= 10;

    if(!hasValidPhone){
        rsvpBtn.classList.add("is-disabled");
        rsvpBtn.removeAttribute("target");

        rsvpBtn.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Demo: en la invitación final este botón abre WhatsApp con el número del cliente.");
        });

        return;
    }

    rsvpBtn.href = `https://wa.me/${phone}?text=${message}`;

}

// =====================================
// LINKS DESACTIVADOS
// =====================================

function initDisabledLinks(){

    const disabledLinks = $$(".disabled-link");

    disabledLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const message =
                link.dataset.disabledMessage ||
                "Este enlace está pendiente de configuración.";

            alert(message);
        });
    });

}

// =====================================
// INTERACCIONES DE BOTONES
// =====================================

function initButtonInteractions(){

    const buttons = $$(
        ".primary-btn, .secondary-btn, .rsvp-btn, .brand-contact-btn, .music-btn-float"
    );

    buttons.forEach((button) => {
        button.addEventListener("pointerdown", () => {
            button.style.transform = "scale(.97)";
        });

        button.addEventListener("pointerup", () => {
            button.style.transform = "";
        });

        button.addEventListener("pointerleave", () => {
            button.style.transform = "";
        });
    });

}