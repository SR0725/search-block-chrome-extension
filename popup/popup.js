let blockedDomains = [];
let isFullBlocked = null;

async function loadBlockedDomains() {
  if (blockedDomains.length > 0) return;

  try {
    const { blockedDomains: loadedBlockedDomains } = await chrome.storage.sync.get(["blockedDomains"]);
    blockedDomains = loadedBlockedDomains || [];
    console.log("Blocked domains loaded:", blockedDomains);
  } catch (error) {
    console.error("Error loading blocked domains:", error);
  }
}

async function addBlockedDomain(domain) {
  const filtedDomain = domain.toLowerCase();
  blockedDomains.push(filtedDomain);

  try {
    await chrome.storage.sync.set({ blockedDomains });
    console.log("Blocked domain added:", domain);
    sendMessageToTabs("refreshBlockedDomains");
  } catch (error) {
    console.error("Error adding blocked domain:", error);
  }
}

async function removeBlockedDomain(domain) {
  const index = blockedDomains.indexOf(domain);
  if (index > -1) {
    blockedDomains.splice(index, 1);
  }

  try {
    await chrome.storage.sync.set({ blockedDomains });
    console.log("Blocked domain removed:", domain);
    sendMessageToTabs("refreshBlockedDomains");
  } catch (error) {
    console.error("Error removing blocked domain:", error);
  }
}

async function loadIsFullBlocked() {
  if (isFullBlocked !== null) return;

  try {
    const { isFullBlocked: loadedIsFullBlocked } = await chrome.storage.sync.get(["isFullBlocked"]);
    isFullBlocked = loadedIsFullBlocked !== undefined ? loadedIsFullBlocked : false;
    console.log("Is full blocked loaded:", isFullBlocked);
  } catch (error) {
    console.error("Error loading full blocked status:", error);
  }
}

async function setIsFullBlocked(isFullBlocked) {
  try {
    await chrome.storage.sync.set({ isFullBlocked });
    console.log("Full blocked status set to:", isFullBlocked);
    sendMessageToTabs("refreshBlockedDomains");
  } catch (error) {
    console.error("Error setting full blocked status:", error);
  }
}

function sendMessageToTabs(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action });
    }
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

async function submitForm() {
  const input = document.getElementById("domain-input").value;
  if (input) {
    await addBlockedDomain(input);
    renderBlockedDomains();
  }
}

window.onload = async () => {
  await Promise.all([loadIsFullBlocked(), loadBlockedDomains()]);
  renderBlockedDomains();
  document.getElementById("full-blocked-checkbox").checked = isFullBlocked;
};

document.getElementById("add-domain-btn").addEventListener("click", submitForm);

document.getElementById("full-blocked-checkbox").addEventListener("change", async (event) => {
  await setIsFullBlocked(event.target.checked);
});
