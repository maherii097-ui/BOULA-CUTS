import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tbody = document.getElementById("data");

onSnapshot(collection(db, "bookings"), (snapshot) => {
    tbody.innerHTML = "";

    snapshot.forEach((doc) => {
        let data = doc.data();

        tbody.innerHTML += `
        <tr>
            <td>${data.name}</td>
            <td>${data.phone}</td>
            <td>${data.time}</td>
        </tr>
        `;
    });
});