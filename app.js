import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==================================================
// Firebase設定
// ==================================================

const firebaseConfig = {

    apiKey: "AIzaSyAOmKuFH0JzrHoZPsIX60ut7FKwOkD3KFA",

    authDomain: "test-2120a.firebaseapp.com",

    projectId: "test-2120a",

    storageBucket: "test-2120a.firebasestorage.app",

    messagingSenderId: "144755350",

    appId: "1:144755350:web:b68bc5ea0dad7a3a2890b7"

};


// Firebase開始

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ==================================================
// 初期設定
// ==================================================

const dateSelect =
    document.getElementById("dateSelect");

const board =
    document.getElementById("reservationBoard");

const status =
    document.getElementById("connectionStatus");


// 今日の日付

const today =
    new Date()
        .toISOString()
        .split("T")[0];

dateSelect.value = today;


// ==================================================
// 予約枠
// ==================================================

const timeSlots = [

    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00"

];


// ==================================================
// 予約掲示板
// ==================================================

function loadReservations(date) {

    board.innerHTML = "読み込み中...";


    const reservationsRef =
        collection(db, "reservations");


    const q = query(
        reservationsRef,
        where("date", "==", date)
    );


    /*
     * onSnapshot
     *
     * Firebaseのデータが変更されると
     * 自動的にこの処理が呼ばれます。
     */

    onSnapshot(
        q,
        (snapshot) => {

            const reservations = {};


            snapshot.forEach((doc) => {

                reservations[doc.id] =
                    doc.data();

            });


            renderBoard(
                date,
                reservations
            );


            status.textContent =
                "● リアルタイム接続中";

        },

        (error) => {

            console.error(error);

            status.textContent =
                "接続エラー";

        }
    );

}


// ==================================================
// 掲示板表示
// ==================================================

function renderBoard(
    date,
    reservations
) {

    board.innerHTML = "";


    timeSlots.forEach((time) => {

        const id =
            `${date}_${time.replace(":", "")}`;


        const reservation =
            reservations[id];


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


        // 操作部分

        const actionElement =
            document.createElement("div");

        actionElement.className =
            "reservation-action";


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

        } else {

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


        row.appendChild(
            timeElement
        );

        row.appendChild(
            teacherElement
        );

        row.appendChild(
            actionElement
        );


        board.appendChild(row);

    });

}


// ==================================================
// 予約処理
// ==================================================

async function reserve(
    date,
    time,
    id
) {

    const studentName =
        prompt(
            "生徒名を入力してください"
        );


    if (!studentName) {

        return;

    }


    const teacherName =
        prompt(
            "担当講師名を入力してください"
        );


    if (!teacherName) {

        return;

    }


    const confirmed =
        confirm(
            `${date}\n${time}\n\n` +
            `${studentName}さん\n` +
            `${teacherName}先生\n\n` +
            `この内容で予約しますか？`
        );


    if (!confirmed) {

        return;

    }


    try {

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

        console.error(error);

        alert(
            "予約に失敗しました。"
        );

    }

}


// ==================================================
// 日付変更
// ==================================================

dateSelect.addEventListener(
    "change",
    () => {

        loadReservations(
            dateSelect.value
        );

    }
);


// ==================================================
// 起動
// ==================================================

loadReservations(today);
