let blockedDomains = [];
let isFullBlocked = null;

async function loadBlockedDomains() {
  if (blockedDomains.length > 0) return;

  const { blockedDomains } = await chrome.storage.sync.get([
    "blockedDomains",
  ]);

  blockedDomains ||= [];
  console.log("Value currently is " + blockedDomains);
}

async function addBlockedDomain(domain) {
  const filtedDomain = domain.toLowerCase();
  blockedDomains.push(filtedDomain);

  await chrome.storage.sync.set({ blockedDomains: blockedDomains }, () => {
    console.log("Value is set to " + blockedDomains);
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "refreshBlockedDomains" });
  });
}

async function removeBlockedDomain(domain) {
  const index = blockedDomains.indexOf(domain);
  if (index > -1) {
    blockedDomains.splice(index, 1);
  }
  await chrome.storage.sync.set({ blockedDomains: blockedDomains }, () => {
    console.log("Value is set to " + blockedDomains);
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "refreshBlockedDomains" });
  });
}

async function loadIsFullBlocked() {
  if (isFullBlocked !== null) return;

  const { isFullBlocked } = await chrome.storage.sync.get(["isFullBlocked"]);
  isFullBlocked ||= false;
}

async function setIsFullBlocked(isFullBlocked) {
  await chrome.storage.sync.set({ isFullBlocked: isFullBlocked }, () => {
    console.log("Value is set to " + isFullBlocked);
  });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "refreshBlockedDomains" });
  });
}

function renderBlockedDomains() {
  const blockedDomainsList = document.getElementById("domain-list");
  blockedDomainsList.innerHTML = "";
  blockedDomains.forEach((domain) => {
    const listItem = document.createElement("li");
    listItem.textContent = domain;
    const removeButton = document.createElement("button");
    removeButton.textContent = "刪除";
    removeButton.addEventListener("click", async () => {
      await removeBlockedDomain(domain);
      renderBlockedDomains();
    });
    listItem.appendChild(removeButton);
    blockedDomainsList.appendChild(listItem);
  });
}

function submitForm() {
  const input = document.getElementById("domain-input").value;
  if (input) {
    addBlockedDomain(input);
    renderBlockedDomains();
  }
}

window.onload = async () => {
  await Promise.all([loadIsFullBlocked(), loadBlockedDomains()]);
  renderBlockedDomains();
  document.getElementById("full-blocked-checkbox").checked = isFullBlocked;
};

document.getElementById("add-domain-btn").addEventListener("click", submitForm);

document
  .getElementById("full-blocked-checkbox")
  .addEventListener("change", async (event) => {
    await setIsFullBlocked(event.target.checked);
  });
