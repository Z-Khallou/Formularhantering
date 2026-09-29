/* =========================================
   1. UPPSTART (INIT-FUNKTION)
   Denna funktion körs automatiskt när sidan laddas.
   Här sätter vi upp alla "lyssnare" som väntar på att användaren ska göra något.
   ========================================= */
function init() {
    // --- 1. RUMSVAL ---
    // Hämtar alla radioknappar för rumsval
    const roomTypeRadios = document.getElementsByName("roomType");
    for (let i = 0; i < roomTypeRadios.length; i++) {
        // Lyssnar på klick för att se om Familjerum väljs
        roomTypeRadios[i].addEventListener("click", checkIfFamilyRoom);
        // Lyssnar på ändringar för att direkt räkna om totalpriset
        roomTypeRadios[i].addEventListener("change", calculateCost);
    }

    // --- 2. TILLÄGG ---
    // Hämtar alla kryssrutor (Internet, Parkering, Sjöutsikt)
    const additions = document.getElementsByName("addition");
    for (let i = 0; i < additions.length; i++) {
        // Räkna om priset direkt när användaren kryssar i eller ur något
        additions[i].addEventListener("change", calculateCost);
    }

    // --- 3. ANTAL NÄTTER ---
    // Hämtar rullistan för antal nätter
    const nightsMenu = document.getElementsByName("nights")[0];
    // Räkna om priset när antalet nätter ändras
    nightsMenu.addEventListener("change", calculateCost);

    // --- 4. SPÄRRA GAMLA DATUM ---
    // Hämtar exakt tid och datum för just nu
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    // Månader börjar på 0, så vi lägger till 1. padStart(2, '0') lägger till en nolla (t.ex. "09")
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    // Bygger ihop till formatet ÅÅÅÅ-MM-DD
    const todaysDate = `${year}-${month}-${day}`;

    // Hittar datumfältet och sätter attributet 'min' till dagens datum
    const arrivalInput = document.getElementsByName("arrivaldate")[0];
    arrivalInput.min = todaysDate;

    // --- 5. FORMATERA ORT ---
    // Hämtar fältet för Ort och lyssnar på "input" (varje tangenttryck)
    const cityInput = document.getElementById("city");
    cityInput.addEventListener("input", formatCityToUppercase);

    // --- 6. REGEX-VALIDERING (DÖRRVAKTERNA) ---
    // Postnummer: Lyssnar på "input" för live-feedback (varje knapptryck)
    const zipcodeInput = document.getElementById("zipcode");
    zipcodeInput.addEventListener("input", validateZipcode);

    // Telefonnummer: Lyssnar på "input" för live-feedback
    const phoneInput = document.getElementById("telephone");
    phoneInput.addEventListener("input", validatePhone);

    // Kampanjkod: Lyssnar på "input" för live-feedback
    const campaignInput = document.getElementsByName("campaigncode")[0];
    campaignInput.addEventListener("input", validateCampaign);

    // --- 7. KÖR FUNKTIONERNA DIREKT ---
    // Vi kör dessa en gång direkt när sidan startar så att formuläret 
    // stänger rätt fält och visar rätt startpris (600 kr) innan användaren hunnit klicka.
    checkIfFamilyRoom();
    calculateCost();
}

/* =========================================
   2. LOGIKEN FÖR FAMILJERUMMET
   ========================================= */
function checkIfFamilyRoom() {
    // Hämtar Familjerum (tredje knappen, index 2)
    const familyRoomRadio = document.getElementsByName("roomType")[2];
    // Hämtar rullistan för personer
    const personsMenu = document.getElementsByName("persons")[0];
    // Hämtar Sjöutsikt (tredje tillägget, index 2)
    const seaViewCheckbox = document.getElementsByName("addition")[2];

    // Om Familjerum är ikryssat just nu...
    if (familyRoomRadio.checked === true) {
        // Aktivera menyn för personer och gör texten svart
        personsMenu.disabled = false;
        personsMenu.parentNode.style.color = "#000";

        // Inaktivera Sjöutsikt, gör texten grå, och bocka ur rutan (ifall den var i)
        seaViewCheckbox.disabled = true;
        seaViewCheckbox.parentNode.style.color = "#999";
        seaViewCheckbox.checked = false;

        // Räkna om priset direkt (eftersom vi kanske precis tog bort sjöutsikten)
        calculateCost();

    } else { // Om ett annat rum är valt (Enkelrum/Dubbelrum)...

        // Inaktivera menyn för personer, gör texten grå, och återställ valet till "3"
        personsMenu.disabled = true;
        personsMenu.parentNode.style.color = "#999";
        personsMenu.selectedIndex = 0;

        // Aktivera Sjöutsikt igen och gör texten svart
        seaViewCheckbox.disabled = false;
        seaViewCheckbox.parentNode.style.color = "#000";
    }
}

/* =========================================
   3. BERÄKNA TOTAL KOSTNAD
   ========================================= */
function calculateCost() {
    let roomPrice = 0;
    let extraPrice = 0;

    // Kollar vilket rum som är valt
    const roomTypeRadios = document.getElementsByName("roomType");
    for (let i = 0; i < roomTypeRadios.length; i++) {
        if (roomTypeRadios[i].checked === true) {
            // Klipper isär värdet (t.ex. "enkelrum,600") och tar siffran.
            roomPrice = parseInt(roomTypeRadios[i].value.split(",")[1]);
        }
    }

    // Kollar vilka tillägg som är valda
    const additions = document.getElementsByName("addition");
    for (let i = 0; i < additions.length; i++) {
        if (additions[i].checked === true) {
            // Klipper isär värdet (t.ex. "Internet,40") och plussar på kassan.
            extraPrice += parseInt(additions[i].value.split(",")[1]);
        }
    }

    // Kollar antalet nätter
    const nightsMenu = document.getElementsByName("nights")[0];
    const nights = parseInt(nightsMenu.value);

    // Räknar ut slutsumman och skriver ut den på skärmen
    const total = (roomPrice + extraPrice) * nights;
    document.getElementById("totalCost").innerText = total;
}

/* =========================================
   4. FORMATERA ORT TILL VERSALER
   ========================================= */
function formatCityToUppercase() {
    const cityInput = document.getElementById("city");
    // Tvingar värdet att bli stora bokstäver i samma stund man skriver
    cityInput.value = cityInput.value.toUpperCase();
}

/* =========================================
   5. VALIDERING AV POSTNUMMER
   ========================================= */
function validateZipcode() {
    const zipcodeInput = document.getElementById("zipcode");
    // Regex: Måste vara exakt 5 siffror från start (^) till slut ($)
    const regex = /^\d{5}$/;

    if (zipcodeInput.value === "") {
        zipcodeInput.style.backgroundColor = ""; // Ta bort färg om fältet är tomt
    } else if (regex.test(zipcodeInput.value) === true) {
        zipcodeInput.style.backgroundColor = "#c8e6c9"; // Grönt vid rätt format
    } else {
        zipcodeInput.style.backgroundColor = "#ffcdd2"; // Rött vid fel format
    }
}

/* =========================================
   6. VALIDERING AV TELEFONNUMMER
   ========================================= */
function validatePhone() {
    const phoneInput = document.getElementById("telephone");
    // Regex: Måste börja med 0, följt av 6-11 st siffror, mellanslag, bindestreck eller snedstreck
    const regex = /^0[0-9 \-\/]{6,11}$/;

    if (phoneInput.value === "") {
        phoneInput.style.backgroundColor = "";
    } else if (regex.test(phoneInput.value) === true) {
        phoneInput.style.backgroundColor = "#c8e6c9";
    } else {
        phoneInput.style.backgroundColor = "#ffcdd2";
    }
}

/* =========================================
   7. VALIDERING AV KAMPANJKOD
   ========================================= */
function validateCampaign() {
    const campaignInput = document.getElementsByName("campaigncode")[0];
    // Regex: 3 bokstäver (små/stora), bindestreck, 2 siffror, bindestreck, 1 bokstav, 1 siffra
    const regex = /^[a-zA-Z]{3}-\d{2}-[a-zA-Z]\d$/;

    if (campaignInput.value === "") {
        campaignInput.style.backgroundColor = "";
    } else if (regex.test(campaignInput.value) === true) {
        campaignInput.style.backgroundColor = "#c8e6c9";
    } else {
        campaignInput.style.backgroundColor = "#ffcdd2";
    }
}

/* =========================================
   8. STARTA PROGRAMMET
   ========================================= */
// När hela HTML-sidan och all grafik har laddats in, ropa på init-funktionen!
window.addEventListener("load", init);