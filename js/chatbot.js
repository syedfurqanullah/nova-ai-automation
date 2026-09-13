/* ========== AI CHAT ASSISTANT ========== */
const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");
const chatClose = document.getElementById("chatClose");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const quickReplies = document.getElementById("quickReplies");
const clearChat = document.getElementById("clearChat");
const welcomeMessage =
  "Hi! I am the NovaAI assistant. How can I help you explore the product?";

function getChatHistory() {
  try {
    return JSON.parse(localStorage.getItem("novaAIChatHistory") || "[]");
  } catch {
    return [];
  }
}
function saveChatHistory(history) {
  localStorage.setItem("novaAIChatHistory", JSON.stringify(history));
}
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
function createChatMessage(message) {
  const article = document.createElement("article");
  article.className = `chat-message chat-message--${message.role}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = message.text;
  const time = document.createElement("time");
  time.className = "chat-time";
  time.dateTime = new Date(message.timestamp).toISOString();
  time.textContent = formatTime(message.timestamp);
  article.append(bubble, time);
  return article;
}
function renderChat() {
  chatMessages.replaceChildren();
  const history = getChatHistory();
  const messages = history.length
    ? history
    : [{ role: "bot", text: welcomeMessage, timestamp: Date.now() }];
  messages.forEach((message) =>
    chatMessages.append(createChatMessage(message)),
  );
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function setChatOpen(isOpen) {
  chatPanel.hidden = !isOpen;
  chatToggle.setAttribute("aria-expanded", String(isOpen));
  chatToggle.setAttribute(
    "aria-label",
    isOpen ? "Close AI chat assistant" : "Open AI chat assistant",
  );
  if (isOpen) {
    renderChat();
    setTimeout(() => chatInput.focus(), 0);
  }
}
function getBotResponse(question) {
  const text = question.toLowerCase();

  if (
    text.includes("how are you") ||
    text.includes("how r u") ||
    text.includes("how are you doing")
  ) {
    return "Doing awesome, thanks for asking! ðŸ˜Š I'm here to help you explore NovaAIâ€”from features and pricing to workflow setup. What catches your interest?";
  }
  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("hey") ||
    text.includes("good morning") ||
    text.includes("good evening")
  ) {
    return "Hey there! Welcome to NovaAI ðŸ‘‹ I'm your assistant here. Curious about our AI automation platform, pricing, or how it all works? Let's dive in!";
  }
  if (
    text.includes("who are you") ||
    text.includes("what are you") ||
    text.includes("who created this") ||
    text.includes("who made this")
  ) {
    return "I'm the NovaAI virtual assistantâ€”here to guide you through our product and help you find exactly what you're looking for. Think of me as your personal product tour guide! ðŸ¤–";
  }
  if (
    text.includes("what is novaai") ||
    text.includes("what is this website") ||
    text.includes("what is this") ||
    text.includes("novaai")
  ) {
    return "NovaAI is an elegant AI-powered workspace designed for modern teams. We automate repetitive workflows, deliver instant insights, and help you make smarter decisions faster. Perfect for businesses looking to scale efficiently! ðŸš€";
  }
  if (
    (text.includes("who are you") && text.includes("owner")) ||
    text.includes("who owns this") ||
    text.includes("who is the owner") ||
    text.includes("who is behind this")
  ) {
    return "This is the official NovaAI landing pageâ€”showcasing our modern, AI-driven workflow automation platform built for ambitious teams worldwide.";
  }
  if (
    text.includes("feature") ||
    text.includes("features") ||
    text.includes("tools") ||
    text.includes("product")
  ) {
    return "Great question! NovaAI packs powerful features: ðŸŽ¯ Workflow Automation (handle routine tasks automatically), ðŸ“Š AI-Powered Insights (data analysis in seconds), ðŸ¤ Team Collaboration (built-in permission controls), and ðŸ“ˆ Advanced Analytics. All designed to save time and boost productivity!";
  }
  if (
    text.includes("pricing") ||
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("plan") ||
    text.includes("plans")
  ) {
    return "Our pricing is transparent and flexible! ðŸ’° Plans start at just $19/month for individuals. Need more? Our Professional and Enterprise plans come with advanced features. Plus, save 20% with yearly billing! Check the pricing section above for full details.";
  }
  if (
    text.includes("how does it work") ||
    text.includes("how does this work") ||
    text.includes("how it works") ||
    text.includes("start")
  ) {
    return "Simple three-step process: 1ï¸âƒ£ Connect your favorite tools and data sources, 2ï¸âƒ£ Define your workflows visually (no coding needed!), 3ï¸âƒ£ Let NovaAI automate while your team focuses on strategy and growth. It's that smooth!";
  }
  if (
    text.includes("demo") ||
    text.includes("trial") ||
    text.includes("book") ||
    text.includes("free trial")
  ) {
    return "Perfect timing! ðŸŽ We offer a 14-day free trialâ€”no credit card needed. You get full access to explore all features and see how NovaAI transforms your workflow. Ready to start? Head to the pricing section and claim your trial!";
  }
  if (
    text.includes("support") ||
    text.includes("help") ||
    text.includes("need help") ||
    text.includes("can you help")
  ) {
    return "Absolutely, I've got you! ðŸ’ª I can walk you through features, explain pricing, break down workflows, or help you pick the right plan. What's on your mind?";
  }
  if (
    text.includes("nice") ||
    text.includes("good") ||
    text.includes("looks") ||
    text.includes("design") ||
    text.includes("beautiful")
  ) {
    return "Thanks so much! ðŸŽ¨ We designed this interface to be clean, modern, and intuitiveâ€”because great tools shouldn't be complicated. Your experience matters to us!";
  }
  if (
    text.includes("where") ||
    text.includes("contact") ||
    text.includes("email") ||
    text.includes("call") ||
    text.includes("message")
  ) {
    return "Good question! This demo showcases our product experience. For direct inquiries about partnerships, enterprise deals, or custom solutions, most businesses would find contact details in our footer or dedicated contact page. Always happy to connect! ðŸ“§";
  }
  if (
    text.includes("your name") ||
    text.includes("what is your name") ||
    text.includes("name")
  ) {
    return "I'm your NovaAI Assistant! ðŸ¤– My job is to guide you through everything NovaAIâ€”features, pricing, workflows, and onboarding. Think of me as your friendly product expert right here on this page.";
  }
  return "Great question! ðŸ‘€ I'm here to help with NovaAI features, pricing plans, workflow automation, getting started, or anything else product-related. What would you like to know?";
}
function addToHistory(role, text) {
  const history = getChatHistory();
  const message = { role, text, timestamp: Date.now() };
  history.push(message);
  saveChatHistory(history.slice(-40));
  chatMessages.append(createChatMessage(message));
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function showTyping() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typingIndicator";
  indicator.setAttribute("aria-label", "NovaAI is typing");
  indicator.append(
    document.createElement("span"),
    document.createElement("span"),
    document.createElement("span"),
  );
  chatMessages.append(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function sendChatMessage(value) {
  const message = value.trim();
  if (!message) return;
  addToHistory("user", message);
  showToast("Message sent");
  showTyping();
  window.setTimeout(() => {
    document.getElementById("typingIndicator")?.remove();
    addToHistory("bot", getBotResponse(message));
  }, 420);
}
chatToggle.addEventListener("click", () => setChatOpen(chatPanel.hidden));
chatClose.addEventListener("click", () => setChatOpen(false));
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(chatInput.value);
  chatInput.value = "";
});
quickReplies.addEventListener("click", (event) => {
  if (event.target.matches("button")) sendChatMessage(event.target.textContent);
});
clearChat.addEventListener("click", () => {
  localStorage.removeItem("novaAIChatHistory");
  renderChat();
  showToast("Chat cleared");
});

renderChat();
