const searchInput = document.querySelector("#search");
const container = document.querySelector(".container");
const mainContainer = document.querySelector(".main");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => e.preventDefault());

const API_URL = "https://api.restcountries.com/countries/v5";
const API_KEY = "rc_live_d7219523840243f7925cc5ccc078928b";

let allCountries = [];

const getCountryName = (country) => {
  if (!country) return "";
  const nameObj = country.names || country.name;
  if (typeof nameObj === "string") return nameObj;
  return nameObj?.common || nameObj?.official || "";
};

const getFlagUrl = (country) => {
  if (!country) return "";
  const flagObj = country.flag || country.flags;
  if (typeof flagObj === "string") return flagObj;
  if (flagObj && typeof flagObj === "object") {
    for (let key in flagObj) {
      if (typeof flagObj[key] === "string" && flagObj[key].startsWith("http"))
        return flagObj[key];
    }
    for (let key in flagObj) {
      if (typeof flagObj[key] === "string" && flagObj[key].length > 0)
        return flagObj[key];
    }
  }
  return "";
};

const getCapital = (country) => {
  if (!country) return "";
  const caps = country.capitals || country.capital;
  if (Array.isArray(caps)) {
    const first = caps[0];
    return typeof first === "object"
      ? first?.name || first?.common || ""
      : first || "";
  }
  return typeof caps === "object"
    ? caps?.name || caps?.common || ""
    : caps || "";
};

const getPopulation = (country) => {
  if (!country || !country.population) return "";
  let pop = country.population;
  if (typeof pop === "object") pop = pop.total || pop.value || 0;
  return Number(pop).toLocaleString("es-ES") + " habitantes";
};

const getRegion = (country) => {
  if (!country) return "";
  const reg = country.region || country.continent;
  return typeof reg === "object" ? reg?.name || reg?.common || "" : reg || "";
};

const getSubregion = (country) => {
  if (!country) return "";
  const sub = country.subregion;
  return typeof sub === "object" ? sub?.name || sub?.common || "" : sub || "";
};

const getTimezone = (country) => {
  if (!country) return "";
  const tz = country.timezones || country.timezone;
  if (Array.isArray(tz)) return tz[0] || "";
  return typeof tz === "object" ? tz?.name || "" : tz || "";
};

const loadAllCountries = async () => {
  try {
    let allData = [];
    let limit = 100;
    let offset = 0;

    for (let i = 0; i < 3; i++) {
      const response = await fetch(
        `${API_URL}?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
        },
      );
      if (!response.ok) break;
      const data = await response.json();
      const batch =
        data.data?.objects || data.data || (Array.isArray(data) ? data : []);
      if (batch.length === 0) break;
      allData = allData.concat(batch);
      if (batch.length < limit) break;
      offset += limit;
    }
    allCountries = allData;
  } catch (error) {
    console.error(error);
  }
};

loadAllCountries();

const searchCountries = (searchTerm) => {
  if (!searchTerm) {
    container.innerHTML = "";
    return;
  }

  const countries = allCountries.filter((country) => {
    return getCountryName(country).toLowerCase().startsWith(searchTerm);
  });

  if (countries.length > 20) {
    container.innerHTML = `<p class="message">Demasiados países, especifica mejor tu búsqueda</p>`;
  } else if (countries.length === 0) {
    container.innerHTML = `<p class="message">El país no existe</p>`;
  } else if (countries.length === 1) {
    const country = countries[0];
    container.innerHTML = `
      <div class="country-detail-card">
        <div class="flag-container"><img src="${getFlagUrl(country)}" alt="Bandera"></div>
        <div class="info-container">
          <h2>${getCountryName(country)}</h2>
          ${getCapital(country) ? `<p>Capital: ${getCapital(country)}</p>` : ""}
          ${getPopulation(country) ? `<p>Población: ${getPopulation(country)}</p>` : ""}
          ${getRegion(country) ? `<p>Región: ${getRegion(country)}</p>` : ""}
          ${getSubregion(country) ? `<p>Subregión: ${getSubregion(country)}</p>` : ""}
          ${getTimezone(country) ? `<p>Zona horaria: ${getTimezone(country)}</p>` : ""}
        </div>
      </div>
    `;
  } else {
    container.innerHTML = countries
      .map(
        (country) => `
      <div class="country-card">
        <img src="${getFlagUrl(country)}" alt="Bandera">
        <h2>${getCountryName(country)}</h2>
      </div>
    `,
      )
      .join("");
  }
};

let searchTimeout;
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  if (searchTerm === "") {
    mainContainer.classList.remove("search-active");
    container.innerHTML = "";
    return;
  }
  mainContainer.classList.add("search-active");
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchCountries(searchTerm), 300);
});
