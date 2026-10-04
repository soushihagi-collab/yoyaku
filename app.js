// Firebase
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==============================
// Firebase設定
// ==============================

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


// ==============================
// HTML要素
// ==============================

const board = document.getElementById("reservationBoard");
const status = document.getElementById("connectionStatus");
const dateSelect = document.getElementById("dateSelect");


// ==============================
// 予約時間
// 11:00～20:00
// 30分単位
// ==============================

const timeSlots = [
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00"
];


// ==============================
// 今日の日付を設定
// ==============================

const today = new Date().toISOString().split("T")[0];

dateSelect.value = today;


// ==============================
// Firestore
// ==============================

const reservationsRef = collection(db, "reservations");


// ==============================
// 予約データをリアルタイム監視
// ==============================

onSnapshot(
    reservationsRef,

    (snapshot) => {

        console.log("予約データが更新されました");

        const reservations = {};

        snapshot.forEach((doc) => {

            const data = doc.data();

            reservations[doc.id] = data;

        });

        renderBoard(
            dateSelect.value,
            reservations
        );

        status.textContent =
            "● リアルタイム接続中";

    },

    (error) => {

        console.error(
            "Firestore読み込みエラー:",
            error
        );

        status.textContent =
            "接続エラー";

    }
);


// ==============================
// 掲示板を表示
// ==============================

function renderBoard(
    date,
    reservations
) {

    board.innerHTML = "";


    timeSlots.forEach((time) => {

        // FirestoreのドキュメントID
        const id =
            `${date}_${time.replace(":", "")}`;


        const reservation =
            reservations[id];


        // 行を作成
        const row =
            document.createElement("div");

        row.className =
            "reservation-row";


        // 時間
        const timeElement =
            document.createElement("div");

        timeElement.className =
            "time";

        timeElement.textContent =
            time;


        // 講師
        const teacherElement =
            document.createElement("div");

        teacherElement.className =
            "teacher";


        // ボタン・状態表示
        const actionElement =
            document.createElement("div");

        actionElement.className =
            "reservation-action";


        // ==========================
        // 予約済み
        // ==========================

        if (reservation) {

            teacherElement.textContent =
                `${reservation.teacher}先生`;


            const reserved =
                document.createElement("div");

            reserved.className =
                "reserved";

            reserved.textContent =
                "🔴 予約済み";


            actionElement.appendChild(
                reserved
            );

        }


        // ==========================
        // 空き
        // ==========================

        else {

            teacherElement.textContent =
                "個別指導";


            const button =
                document.createElement("button");

            button.className =
                "available";

            button.textContent =
                "🟢 予約する";


            button.addEventListener(
                "click",
                () => {

                    reserve(
                        date,
                        time,
                        id
                    );

                }
            );


            actionElement.appendChild(
                button
            );

        }


        // 行に追加
        row.appendChild(
            timeElement
        );

        row.appendChild(
            teacherElement
        );

        row.appendChild(
            actionElement
        );


        // 掲示板に追加
        board.appendChild(
            row
        );

    });

}


// ==============================
// 予約処理
// ==============================

async function reserve(
    date,
    time,
    id
) {

    // 生徒名
    const studentName =
        prompt(
            "生徒名を入力してください"
        );


    if (!studentName) {

        return;

    }


    // 講師名
    const teacherName =
        prompt(
            "担当講師名を入力してください"
        );


    if (!teacherName) {

        return;

    }


    // 確認
    const confirmed =
        confirm(
            `${date}\n` +
            `${time}\n\n` +
            `${studentName}さん\n` +
            `${teacherName}先生\n\n` +
            `この内容で予約しますか？`
        );


    if (!confirmed) {

        return;

    }


    try {

        // Firestoreに予約を保存
        await setDoc(
            doc(
                db,
                "reservations",
                id
            ),
            {

                date: date,

                time: time,

                student: studentName,

                teacher: teacherName,

                createdAt:
                    new Date().toISOString()

            }
        );


        alert(
            "予約しました！"
        );


    } catch (error) {

        console.error(
            "予約エラー:",
            error
        );


        alert(
            "予約に失敗しました。"
        );

    }

}


// ==============================
// 日付変更
// ==============================

dateSelect.addEventListener(
    "change",
    () => {

        // リアルタイム監視によって
        // 自動的に再描画される

    }
);
