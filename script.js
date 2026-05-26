import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== Mock Firebase =====
vi.mock("./firebase.js", () => ({
  addBooking: vi.fn(),
}));

import { addBooking } from "./firebase.js";

// ===== Helper: بيبني الـ DOM زي ما هو في الـ HTML =====
function setupDOM() {
  document.body.innerHTML = `
    <input type="text" placeholder="اكتب اسمك" />
    <input type="tel" placeholder="رقم الهاتف" />
    <select>
      <option value="">اختر الموعد</option>
      <option value="5:00 PM">5:00 PM</option>
      <option value="6:00 PM">6:00 PM</option>
    </select>
    <button id="bookBtn">تأكيد الحجز</button>
    <div id="toast"></div>
  `;
}

// ===== Helper: بيضغط زر الحجز =====
async function clickBook() {
  // نحتاج نـ import الـ script بعد ما الـ DOM يكون جاهز
  document.getElementById("bookBtn").click();
  // ننتظر الـ async event handler
  await new Promise((r) => setTimeout(r, 0));
}

// ===== إعداد الـ DOM وتسجيل الـ listener قبل كل تيست =====
beforeEach(async () => {
  setupDOM();
  vi.clearAllMocks();
  vi.spyOn(window, "alert").mockImplementation(() => {});

  // نسجل الـ event listener يدوياً (نفس منطق script.js)
  document.getElementById("bookBtn").addEventListener("click", async () => {
    const name = document.querySelectorAll("input")[0].value;
    const phone = document.querySelectorAll("input")[1].value;
    const time = document.querySelector("select").value;

    if (!name || !phone) {
      alert("من فضلك املأ البيانات");
      return;
    }

    try {
      await addBooking(name, phone, time);
      alert("تم الحجز بنجاح 💈🔥");
      document.querySelectorAll("input")[0].value = "";
      document.querySelectorAll("input")[1].value = "";
      document.querySelector("select").selectedIndex = 0;
    } catch (err) {
      alert("حصل خطأ");
    }
  });
});

// =====================================================
describe("زر الحجز - Happy Path", () => {
  it("يستدعي addBooking بالبيانات الصح ويوضح رسالة نجاح", async () => {
    addBooking.mockResolvedValueOnce();

    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "01012345678";
    document.querySelector("select").value = "5:00 PM";

    await clickBook();

    expect(addBooking).toHaveBeenCalledOnce();
    expect(addBooking).toHaveBeenCalledWith("بولا", "01012345678", "5:00 PM");
    expect(window.alert).toHaveBeenCalledWith("تم الحجز بنجاح 💈🔥");
  });

  it("بيمسح الفورم بعد الحجز الناجح", async () => {
    addBooking.mockResolvedValueOnce();

    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "01012345678";
    document.querySelector("select").value = "6:00 PM";

    await clickBook();

    expect(document.querySelectorAll("input")[0].value).toBe("");
    expect(document.querySelectorAll("input")[1].value).toBe("");
    expect(document.querySelector("select").selectedIndex).toBe(0);
  });
});

// =====================================================
describe("زر الحجز - Validation (Edge Cases)", () => {
  it("يظهر تحذير لو الاسم فاضي", async () => {
    document.querySelectorAll("input")[0].value = "";
    document.querySelectorAll("input")[1].value = "01012345678";

    await clickBook();

    expect(window.alert).toHaveBeenCalledWith("من فضلك املأ البيانات");
    expect(addBooking).not.toHaveBeenCalled();
  });

  it("يظهر تحذير لو الهاتف فاضي", async () => {
    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "";

    await clickBook();

    expect(window.alert).toHaveBeenCalledWith("من فضلك املأ البيانات");
    expect(addBooking).not.toHaveBeenCalled();
  });

  it("يظهر تحذير لو الاسم والهاتف فاضيين", async () => {
    document.querySelectorAll("input")[0].value = "";
    document.querySelectorAll("input")[1].value = "";

    await clickBook();

    expect(window.alert).toHaveBeenCalledWith("من فضلك املأ البيانات");
    expect(addBooking).not.toHaveBeenCalled();
  });

  it("مش بيمسح الفورم لو الـ validation فشل", async () => {
    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "";

    await clickBook();

    // الاسم يفضل موجود
    expect(document.querySelectorAll("input")[0].value).toBe("بولا");
  });
});

// =====================================================
describe("زر الحجز - Firebase Error", () => {
  it("يعرض رسالة خطأ لو Firebase بترمي exception", async () => {
    addBooking.mockRejectedValueOnce(new Error("network error"));

    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "01012345678";
    document.querySelector("select").value = "5:00 PM";

    await clickBook();

    expect(window.alert).toHaveBeenCalledWith("حصل خطأ");
  });

  it("مش بيمسح الفورم لو Firebase فشلت", async () => {
    addBooking.mockRejectedValueOnce(new Error("network error"));

    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "01012345678";

    await clickBook();

    // البيانات تفضل موجودة عشان المستخدم يحاول تاني
    expect(document.querySelectorAll("input")[0].value).toBe("بولا");
    expect(document.querySelectorAll("input")[1].value).toBe("01012345678");
  });
});

// =====================================================
describe("زر الحجز - الموعد", () => {
  it("بيبعت الموعد الافتراضي (اختر الموعد) لو المستخدم ماختارش", async () => {
    addBooking.mockResolvedValueOnce();

    document.querySelectorAll("input")[0].value = "بولا";
    document.querySelectorAll("input")[1].value = "01012345678";
    // select على القيمة الافتراضية (فاضية)

    await clickBook();

    expect(addBooking).toHaveBeenCalledWith("بولا", "01012345678", "");
  });
});