import { addBooking } from "./firebase.js";

// ===== Navbar Functionality =====
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // إغلاق القائمة عند الضغط على رابط
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // ===== Booking Form =====
  const bookBtn = document.getElementById("bookBtn");
  const nameInput = document.getElementById("nameInput");
  const phoneInput = document.getElementById("phoneInput");
  const timeSelect = document.getElementById("timeSelect");
  const serviceSelect = document.getElementById("serviceSelect");
  const toast = document.getElementById("toast");

  if (bookBtn) {
    bookBtn.addEventListener("click", async () => {
      const name = nameInput?.value?.trim();
      const phone = phoneInput?.value?.trim();
      const time = timeSelect?.value;
      const service = serviceSelect?.value;

      // Validation
      if (!name || !phone) {
        showToast("❌ من فضلك املأ الاسم والهاتف");
        return;
      }

      if (name.length < 2) {
        showToast("❌ الاسم يجب أن يكون أطول من حرفين");
        return;
      }

      if (phone.length < 10) {
        showToast("❌ رقم الهاتف غير صحيح");
        return;
      }

      try {
        bookBtn.disabled = true;
        bookBtn.style.opacity = "0.7";
        bookBtn.textContent = "⏳ جاري الحجز...";

        const bookingData = {
          name,
          phone,
          time: time || "غير محدد",
          service: service || "غير محددة",
        };

        await addBooking(bookingData);

        showToast("✅ تم الحجز بنجاح! شكراً لاختيارك BOULA CUTS 💈");

        // Clear form
        nameInput.value = "";
        phoneInput.value = "";
        timeSelect.selectedIndex = 0;
        serviceSelect.selectedIndex = 0;

        // Scroll to hero
        setTimeout(() => {
          document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
        }, 500);
      } catch (err) {
        showToast("❌ حصل خطأ أثناء الحجز. حاول لاحقاً.");
        console.error(err);
      } finally {
        bookBtn.disabled = false;
        bookBtn.style.opacity = "1";
        bookBtn.textContent = "✓ تأكيد الحجز";
      }
    });

    // Add Enter key support
    phoneInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") bookBtn.click();
    });
  }

  // ===== Toast Function =====
  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
      toast.style.display = "none";
    }, 4000);
  }

  // ===== Smooth Scroll =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && document.querySelector(href)) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // ===== Add animation on scroll =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  document.querySelectorAll(".card, .review-card").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "all 0.6s ease-out";
    observer.observe(el);
  });
});
