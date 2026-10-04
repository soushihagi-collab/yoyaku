// Firebase
import { initializeApp } 
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyAOmKuFH0JzrHoZPsIX60ut7FKwOkD3KFA",
    authDomain: "test-2120a.firebaseapp.com",
    projectId: "test-2120a",
    storageBucket: "test-2120a.firebasestorage.app",
    messagingSenderId: "144755350",
    appId: "1:144755350:web:b68bc5ea0dad7a3a2890b7",
    measurementId: "G-BSKV15BDKP"
};


// Firebaseを起動
const app = initializeApp(firebaseConfig);

// Firestoreを使用
const db = getFirestore(app);

console.log("Firebase接続成功");
console.log("Firestore接続準備完了");

const reservationsRef = collection(db, "reservations");
const board = document.getElementById("reservationBoard");
const status = document.getElementById("connectionStatus");
const dateSelect = document.getElementById("dateSelect");

// 今日の日付を設定
const today = new Date().toISOString().split("T")[0];
dateSelect.value = today;


// Firebaseの予約データをリアルタイム監視
onSnapshot(reservationsRef, (snapshot) => {

    console.log("予約データが更新されました");

    board.innerHTML = "";

    snapshot.forEach((doc) => {

        const data = doc.data();

        const row = document.createElement("div");

        row.textContent =
            `${data.date} ${data.time}　${data.student}さん　${data.teacher}先生`;

        board.appendChild(row);

    });

    status.textContent = "● リアルタイム接続中";

}, (error) => {

    console.error("Firestore読み込みエラー:", error);

    status.textContent = "接続エラー";

});
