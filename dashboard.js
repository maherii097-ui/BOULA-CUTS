import { db, auth } from "./firebase.js";
import { collection, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const tbody = document.getElementById("data");
const totalBookingsElem = document.getElementById("totalBookings");
const completedCountElem = document.getElementById("completedCount");
const pendingCountElem = document.getElementById("pendingCount");
const errorElem = document.getElementById("dashboardError");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "admin.html";
    return;
  }

  onSnapshot(
    collection(db, "bookings"),
    (snapshot) => {
      errorElem.classList.remove("show");
      errorElem.textContent = "";
      console.log("dashboard snapshot count:", snapshot.size);
      tbody.innerHTML = "";
    
      let totalCount = 0;
  let completedCount = 0;
  
  if (snapshot.empty) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">
          <i class="fas fa-inbox"></i>
          <p>لا توجد حجوزات حالياً</p>
        </td>
      </tr>
    `;
  } else {
    snapshot.forEach((item) => {
      const d = item.data();
      totalCount++;
      
      const isCompleted = d.status === "completed";
      if (isCompleted) completedCount++;
      
      const dateObj = d.timestamp
        ? d.timestamp.toDate
          ? new Date(d.timestamp.toDate()).toLocaleDateString("ar-EG")
          : new Date(d.timestamp).toLocaleDateString("ar-EG")
        : "—";
      
      const serviceLabel = d.service === "تشذيب اللحية" ? "حلق الدقن" : d.service || "—";
      tbody.innerHTML += `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td>${d.phone}</td>
          <td>${d.time || "—"}</td>
          <td>${serviceLabel}</td>
          <td>${dateObj}</td>
          <td>
            <button class="btn btn-delete" onclick="del('${item.id}')">
              <i class="fas fa-trash"></i> حذف
            </button>
          </td>
        </tr>
      `;
    });
  }
  
  // تحديث الإحصائيات
  totalBookingsElem.textContent = totalCount;
  completedCountElem.textContent = completedCount;
  pendingCountElem.textContent = totalCount - completedCount;
}, (err) => {
  console.error("Firestore read error:", err);
  errorElem.textContent = "حصل خطأ في تحميل الحجوزات. افتح الكونسول لترى التفاصيل.";
  errorElem.classList.add("show");
  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="no-data">
        <i class="fas fa-exclamation-triangle"></i>
        <p>لم أتمكن من تحميل الحجوزات.</p>
      </td>
    </tr>
  `;
});
});

logoutBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "admin.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
});

window.del = async function(id) {
  if (confirm("هل تريد حذف هذا الحجز؟")) {
    try {
      await deleteDoc(doc(db, "bookings", id));
    } catch (err) {
      alert("حصل خطأ في الحذف");
      console.error(err);
    }
  }
};