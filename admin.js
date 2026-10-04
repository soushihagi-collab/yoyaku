// Firebase
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    deleteDoc,
    doc
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


// Firebase起動
const app =
    initializeApp(firebaseConfig);


// Firestore
const db =
    getFirestore(app);


// ==============================
// HTML要素
// ==============================

const calendar =
    document.getElementById("calendar");

const adminReservationList =
    document.getElementById(
        "adminReservationList"
    );

const selectedDateTitle =
    document.getElementById(
        "selectedDateTitle"
    );


// ==============================
// 現在表示している年月
// ==============================

let currentDate =
    new Date();


// ==============================
// 予約データ
// ==============================

let reservations = {};


// ==============================
// Firestore監視
// ==============================

onSnapshot(

    collection(
        db,
        "reservations"
    ),

    (snapshot) => {

        reservations = {};


        snapshot.forEach((doc) => {

            reservations[doc.id] =
                doc.data();

        });


        renderCalendar();

    },

    (error) => {

        console.error(
            "予約データ取得エラー:",
            error
        );

        calendar.textContent =
            "予約データを取得できませんでした。";

    }

);


// ==============================
// カレンダー表示
// ==============================

function renderCalendar() {

    calendar.innerHTML = "";


    // ==========================
    // ヘッダー
    // ==========================

    const header =
        document.createElement("div");

    header.className =
        "admin-calendar-header";


    const previousButton =
        document.createElement("button");

    previousButton.textContent =
        "← 前月";


    previousButton.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            renderCalendar();

        }
    );


    const nextButton =
        document.createElement("button");

    nextButton.textContent =
        "次月 →";


    nextButton.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            renderCalendar();

        }
    );


    const title =
        document.createElement("h3");


    title.textContent =
        `${currentDate.getFullYear()}年` +
        `${currentDate.getMonth() + 1}月`;


    header.appendChild(
        previousButton
    );

    header.appendChild(
        title
    );

    header.appendChild(
        nextButton
    );


    calendar.appendChild(
        header
    );


    // ==========================
    // 曜日
    // ==========================

    const weekdays = [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];


    const weekdayRow =
        document.createElement("div");

    weekdayRow.className =
        "admin-calendar-grid";


    weekdays.forEach((day) => {

        const cell =
            document.createElement("div");

        cell.className =
            "admin-weekday";

        cell.textContent =
            day;

        weekdayRow.appendChild(
            cell
        );

    });


    calendar.appendChild(
        weekdayRow
    );


    // ==========================
    // 日付
    // ==========================

    const grid =
        document.createElement("div");

    grid.className =
        "admin-calendar-grid";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    // 月初の曜日

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    // 月の日数

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // 月初までの空白

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "admin-day empty";

        grid.appendChild(
            empty
        );

    }


    // ==========================
    // 日付
    // ==========================

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement("button");


        cell.className =
            "admin-day";


        const date =
            `${year}-` +
            `${String(month + 1).padStart(2, "0")}-` +
            `${String(day).padStart(2, "0")}`;


        cell.textContent =
            day;


        // ==========================
        // 予約があるか確認
        // ==========================

        const hasReservation =
            Object.values(reservations)
                .some(
                    reservation =>
                        reservation.date === date
                );


        if (hasReservation) {

            cell.classList.add(
                "has-reservation"
            );

        }


        // ==========================
        // 日付クリック
        // ==========================

        cell.addEventListener(
            "click",
            () => {

                showReservations(
                    date
                );

            }
        );


        grid.appendChild(
            cell
        );

    }


    calendar.appendChild(
        grid
    );

}


// ==============================
// 指定日の予約表示
// ==============================

function showReservations(
    date
) {

    selectedDateTitle.textContent =
        `${date} の予約`;


    adminReservationList.innerHTML =
        "";


    // ==========================
    // 指定日の予約だけ取得
    // ==========================

    const dailyReservations =
        Object.values(reservations)
            .filter(
                reservation =>
                    reservation.date === date
            );


    // ==========================
    // 予約なし
    // ==========================

    if (
        dailyReservations.length === 0
    ) {

        adminReservationList.textContent =
            "この日の予約はありません。";

        return;

    }


    // ==========================
    // 時間順に並べる
    // ==========================

    dailyReservations.sort(
        (a, b) =>
            a.time.localeCompare(
                b.time
            )
    );


    // ==========================
    // 予約を表示
    // ==========================

    dailyReservations.forEach(
        (reservation) => {

            const row =
                document.createElement("div");


            row.className =
                "admin-reservation";


            // ==========================
            // 時間
            // ==========================

            const time =
                document.createElement("strong");


            time.textContent =
                reservation.time;


            // ==========================
            // 生徒名
            // ==========================

            const student =
                document.createElement("span");


            student.textContent =
                `${reservation.student}さん`;


            // ==========================
            // 講師名
            // ==========================

            const teacher =
                document.createElement("span");


            teacher.textContent =
                `${reservation.teacher}先生`;


            // ==========================
            // 強制キャンセルボタン
            // ==========================

            const cancelButton =
                document.createElement("button");


            cancelButton.textContent =
                "強制キャンセル";


            cancelButton.addEventListener(
                "click",
                async () => {

                    // ==========================
                    // 確認
                    // ==========================

                    const confirmed =
                        confirm(

                            `${reservation.date}\n` +

                            `${reservation.time}\n\n` +

                            `${reservation.student}さん\n` +

                            `${reservation.teacher}先生\n\n` +

                            "この予約を強制的にキャンセルしますか？"

                        );


                    if (!confirmed) {

                        return;

                    }


                    try {

                        // ==========================
                        // ドキュメントIDを作成
                        // ==========================

                        const id =
                            `${reservation.date}_` +
                            `${reservation.time.replace(":", "")}`;


                        // ==========================
                        // Firestoreから削除
                        // ==========================

                        await deleteDoc(

                            doc(
                                db,
                                "reservations",
                                id
                            )

                        );


                        alert(
                            "予約を強制キャンセルしました。"
                        );


                    } catch (error) {

                        console.error(
                            "強制キャンセルエラー:",
                            error
                        );


                        alert(
                            "キャンセルに失敗しました。"
                        );

                    }

                }
            );


            // ==========================
            // 行に追加
            // ==========================

            row.appendChild(
                time
            );


            row.appendChild(
                student
            );


            row.appendChild(
                teacher
            );


            row.appendChild(
                cancelButton
            );


            // ==========================
            // 画面に追加
            // ==========================

            adminReservationList.appendChild(
                row
            );

        }
    );

}
