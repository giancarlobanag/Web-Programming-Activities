/* Practice code: users are saved in this browser's localStorage and the
   password is stored exactly as typed. Never do this in a real app. */

const root = document.documentElement;
const toggle = document.querySelector("#themeToggle");
const views = document.querySelectorAll(".view");

const regForm = document.querySelector("#regForm");
const regMsg = document.querySelector("#regMsg");
const logForm = document.querySelector("#logForm");
const logMsg = document.querySelector("#logMsg");
const hello = document.querySelector("#welcomeText");

/* ---------- Switching screens ---------- */
// show("login") hides every view except the one with that id.
const show = (id) => {
  views.forEach((v) => {
    v.classList.toggle("hidden", v.id !== id);
  });
  regMsg.textContent = "";
  logMsg.textContent = "";
  window.scrollTo(0, 0);
};

// Splash for two seconds, then register (first visit) or log in (users exist).
setTimeout(() => show(getUsers().length ? "login" : "register"), 2000);

// One click listener handles the links and the log out button.
document.addEventListener("click", (e) => {
  const id = e.target.id;
  if (id === "toLogin" || id === "toRegister") e.preventDefault(); // links use href="#"
  if (id === "toLogin") show("login");
  if (id === "toRegister") show("register");
  if (id === "logout") show("login");
});

/* ---------- Saved users ---------- */
function getUsers() {
  const raw = localStorage.getItem("users");
  return JSON.parse(raw) ?? [];
}

/* ---------- Register ---------- */
regForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = regForm.elements;
  try {
    if (f.password.value.length < 8)
      throw new Error("Password too short");
    if (f.password.value !== f.confirm.value)
      throw new Error("Passwords do not match");

    const email = f.email.value.trim().toLowerCase();
    if (getUsers().some((u) => u.email === email))
      throw new Error("Email already used");

    const users = [...getUsers(), {
      name: f.name.value,
      email,
      password: f.password.value,
    }];
    localStorage.setItem("users", JSON.stringify(users));
    regForm.reset();
    show("login");
  } catch (error) {
    regMsg.textContent = error.message;
  }
});

/* ---------- Log in: a match opens the notices board ---------- */
logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = logForm.elements;
  const mail = f.email.value.trim().toLowerCase();
  const user = getUsers().find((u) => u.email === mail);
  if (user?.password === f.password.value) {
    hello.textContent = `Welcome, ${user.name}!`;
    logForm.reset();
    show("board");
  } else {
    logMsg.textContent = "Wrong email or password";
  }
});

/* ---------- Theme: change, save, and remember ---------- */
const setTheme = (name) => {
  const dark = name === "dark";
  root.dataset.theme = name;
  toggle.textContent = dark ? "Light" : "Dark";
  localStorage.setItem("theme", name);
};

const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
const saved = localStorage.getItem("theme");
setTheme(saved ?? (systemDark ? "dark" : "light"));

toggle.onclick = () => {
  const dark = root.dataset.theme === "dark";
  setTheme(dark ? "light" : "dark");
};

/* ---------- Post a notice: adds a card to the board ---------- */
// Without this, submitting the form would reload the page and send you
// back to the splash screen. New notices are not saved after a reload.
const noticeForm = document.querySelector("#noticeForm");
const noticeList = document.querySelector(".notices");

noticeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = noticeForm.elements;
  const date = f.date.value || new Date().toISOString().slice(0, 10);

  const article = document.createElement("article");
  article.className = "notice";

  const h3 = document.createElement("h3");
  h3.textContent = f.title.value;

  const meta = document.createElement("p");
  meta.className = "meta";
  const time = document.createElement("time");
  time.dateTime = date;
  time.textContent = new Date(date + "T00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = f.category.selectedOptions[0].text;
  meta.append(time, " · ", tag);

  const body = document.createElement("p");
  body.textContent = f.message.value;

  article.append(h3, meta, body);
  noticeList.prepend(article);
  noticeForm.reset();
  document.querySelector("#notices").scrollIntoView();
});
