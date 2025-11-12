/* =========================
   Chirag Fitness — script.js
   Vanilla JS only. Works with the provided HTML & CSS.
   ========================= */

// ---------- Shortcuts ----------
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- Toast ----------
function showToast(message, duration = 2200) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// ---------- Header shadow on scroll ----------
const header = $(".header");
window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 10);
});

// ---------- Scroll-spy: highlight active nav link ----------
const sectionIds = ["home", "about-us", "membership", "classes", "contact-info"];
const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
const navLinks = $$(".navbar li a");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
    });
  },
  // focus middle of viewport for accuracy
  { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
);
sections.forEach((sec) => observer.observe(sec));

// ---------- Header Buttons ----------
$("#callBtn")?.addEventListener("click", () => {
  // Replace with a real number if available
  window.location.href = "tel:+1555900496";
});

$("#enrollBtn")?.addEventListener("click", () => {
  $("#signup")?.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ---------- Form Validation + Persistence ----------
const form     = $("#signupForm");
const nameInp  = $("#name");
const ageInp   = $("#age");
const emailInp = $("#email");
const addrInp  = $("#address");

const err = {
  name:   $("#nameErr"),
  age:    $("#ageErr"),
  email:  $("#emailErr"),
  address:$("#addressErr"),
};

function setError(input, el, msg) {
  if (!input || !el) return;
  input.classList.add("is-invalid");
  el.textContent = msg || "";
}

function clearError(input, el) {
  if (!input || !el) return;
  input.classList.remove("is-invalid");
  el.textContent = "";
}

// Basic validators — practical & readable
const validate = {
  name: (v) => v && v.trim().length >= 3,
  age:  (v) => Number.isInteger(Number(v)) && Number(v) >= 14 && Number(v) <= 80,
  email:(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  address:(v)=> v && v.trim().length >= 6,
};

function validateField(input) {
  if (!input) return true;
  const v = input.value;
  switch (input.id) {
    case "name":
      if (!validate.name(v)) { setError(input, err.name, "Enter at least 3 characters."); return false; }
      break;
    case "age":
      if (!validate.age(v)) { setError(input, err.age, "Age must be between 14 and 80."); return false; }
      break;
    case "email":
      if (!validate.email(v)) { setError(input, err.email, "Enter a valid email (e.g., name@example.com)."); return false; }
      break;
    case "address":
      if (!validate.address(v)) { setError(input, err.address, "Enter a valid address (min 6 chars)."); return false; }
      break;
    default:
      break;
  }
  clearError(input, err[input.id]);
  return true;
}

// On blur: validate individual fields
[nameInp, ageInp, emailInp, addrInp].forEach((inp) => {
  inp?.addEventListener("blur", () => validateField(inp));
});

// Prefill from localStorage
(function prefillFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem("cf_signup") || "{}");
    if (saved.name)   nameInp.value  = saved.name;
    if (saved.age)    ageInp.value   = saved.age;
    if (saved.email)  emailInp.value = saved.email;
    if (saved.address)addrInp.value  = saved.address;
  } catch { /* ignore parse errors */ }
})();

// Submit handler (backend + same UX)
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const allValid =
    validateField(nameInp) &
    validateField(ageInp) &
    validateField(emailInp) &
    validateField(addrInp);

  if (!allValid) {
    showToast("Please fix the highlighted fields.");
    return;
  }

  const payload = {
    name: nameInp.value.trim(),
    age: Number(ageInp.value.trim()),      // ensure number
    email: emailInp.value.trim(),
    address: addrInp.value.trim()
    // (ts removed—API doesn’t need it; keep it if you store locally)
  };

  try {
    const res = await fetch("http://localhost:3000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Try to read JSON (may fail on server error)
    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.ok) {
      // (optional) keep local cache so your prefill still works
      try { localStorage.setItem("cf_signup", JSON.stringify(payload)); } catch {}

      showToast("Thanks! We’ll reach out soon.");
      form.reset();

      setTimeout(() => {
        document.getElementById("contact-info")?.scrollIntoView({ behavior: "smooth" });
      }, 700);
    } else {
      showToast(data?.msg || "Submission failed. Please try again.");
    }
  } catch (err) {
    showToast("Server offline. Start API and retry.");
  }
});

