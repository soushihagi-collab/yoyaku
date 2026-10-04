// Firebase
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    getDocs
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


const monthlyReservationCount =
    document.getElementById(
        "monthlyReservationCount"
    );


const todayReservationCount =
    document.getElementById(
        "todayReservationCount"
    );


const teacherCount =
    document.getElementById(
        "teacherCount"
    );


const todayReservationList =
    document.getElementById(
        "todayReservationList"
    );


const teacherReservationList =
    document.getElementById(
        "teacherReservationList"
    );


const teacherReservationTitle =
    document.getElementById(
        "teacherReservationTitle"
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
// 講師データ
// ==============================

let teachers = [];


// ==============================
// 今日の日付
// 日本時間
// ==============================

function getToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


// ==============================
// Firestore予約監視
// ==============================

onSnapshot(

    collection(
        db,
        "reservations"
    ),

    (snapshot) => {

        reservations = {};


        snapshot.forEach(
            (document) => {

                reservations[
                    document.id
                ] = document.data();

            }
        );


        // カレンダー更新

        renderCalendar();


        // 集計更新

        renderSummary();


        // 今日の予約更新

        renderTodayReservations();


        // 講師別集計更新

        renderTeacherReservations();

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
// 講師一覧取得
// ==============================

async function loadTeachers() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "teachers"
                )
            );


        teachers = [];


        snapshot.forEach(
            (document) => {

                const data =
                    document.data();


                if (data.name) {

                    teachers.push(
                        data.name
                    );

                }

            }
        );


        teacherCount.textContent =
            `${teachers.length}人`;


        renderTeacherReservations();


    } catch (error) {

        console.error(
            "講師取得エラー:",
            error
        );


        teacherCount.textContent =
            "取得失敗";

    }

}


// 講師読み込み

loadTeachers();


// ==============================
// 集計表示
// ==============================

function renderSummary() {

    const today =
        getToday();


    // ==========================
    // 今月
    // ==========================

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth() + 1;


    const monthString =
        String(month).padStart(
            2,
            "0"
        );


    const targetMonth =
        `${year}-${monthString}`;


    const monthlyReservations =
        Object.values(reservations)
            .filter(
                reservation =>
                    reservation.date &&
                    reservation.date.startsWith(
                        targetMonth
                    )
            );


    monthlyReservationCount.textContent =
        `${monthlyReservations.length}件`;


    // ==========================
    // 今日
    // ==========================

    const todayReservations =
        Object.values(reservations)
            .filter(
                reservation =>
                    reservation.date === today
            );


    todayReservationCount.textContent =
        `${todayReservations.length}件`;

}


// ==============================
// 今日の予約一覧
// ==============================

function renderTodayReservations() {

    const today =
        getToday();


    todayReservationList.innerHTML =
        "";


    const todayReservations =
        Object.values(reservations)
            .filter(
                reservation =>
                    reservation.date === today
            );


    // ==========================
    // 予約なし
    // ==========================

    if (
        todayReservations.length === 0
    ) {

        todayReservationList.textContent =
            "本日の予約はありません。";

        return;

    }


    // ==========================
    // 時間順
    // ==========================

    todayReservations.sort(
        (a, b) =>
            a.time.localeCompare(
                b.time
            )
    );


    todayReservations.forEach(
        (reservation) => {

            const row =
                document.createElement("div");


            row.className =
                "admin-today-reservation";


            const time =
                document.createElement("strong");


            time.textContent =
                reservation.time;


            const student =
                document.createElement("span");


            student.textContent =
                `${reservation.student}さん`;


            const teacher =
                document.createElement("span");


            teacher.textContent =
                `${reservation.teacher}`;


            row.appendChild(
                time
            );


            row.appendChild(
                student
            );


            row.appendChild(
                teacher
            );


            todayReservationList.appendChild(
                row
            );

        }
    );

}


// ==============================
// 講師ごとの予約状況
// ==============================

function renderTeacherReservations() {

    teacherReservationList.innerHTML =
        "";


    const year =
        currentDate.getFullYear();


    const month =
        currentDate.getMonth() + 1;


    const monthString =
        String(month).padStart(
            2,
            "0"
        );


    const targetMonth =
        `${year}-${monthString}`;


    teacherReservationTitle.textContent =
        `講師ごとの予約状況（${year}年${month}月）`;


    // ==========================
    // 今月の予約
    // ==========================

    const monthlyReservations =
        Object.values(reservations)
            .filter(
                reservation =>
                    reservation.date &&
                    reservation.date.startsWith(
                        targetMonth
                    )
            );


    // ==========================
    // 講師別に集計
    // ==========================

    const counts = {};


    teachers.forEach(
        teacher => {

            counts[teacher] =
                0;

        }
    );


    monthlyReservations.forEach(
        reservation => {

            const teacher =
                reservation.teacher;


            if (
                counts[teacher] === undefined
            ) {

                counts[teacher] =
                    0;

            }


            counts[teacher]++;

        }
    );


    // ==========================
    // 講師がいない場合
    // ==========================

    if (
        Object.keys(counts).length === 0
    ) {

        teacherReservationList.textContent =
            "講師が登録されていません。";

        return;

    }


    // ==========================
    // 表示
    // ==========================

    Object.entries(counts)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([teacher, count]) => {

                const row =
                    document.createElement("div");


                row.className =
                    "admin-teacher-row";


                const name =
                    document.createElement("span");


                name.textContent =
                    `${teacher}`;


                const number =
                    document.createElement("strong");


                number.textContent =
                    `${count}件`;


                row.appendChild(
                    name
                );


                row.appendChild(
                    number
                );


                teacherReservationList.appendChild(
                    row
                );

            }
        );

}


// ==============================
// カレンダー表示
// ==============================

function renderCalendar() {

    calendar.innerHTML =
        "";


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


            renderSummary();


            renderTeacherReservations();

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


            renderSummary();


            renderTeacherReservations();

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


    weekdays.forEach(
        (day) => {

            const cell =
                document.createElement("div");


            cell.className =
                "admin-weekday";


            cell.textContent =
                day;


            weekdayRow.appendChild(
                cell
            );

        }
    );


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


    // ==========================
    // 空白
    // ==========================

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
        // 予約確認
        // ==========================

        const dayReservations =
            Object.values(reservations)
                .filter(
                    reservation =>
                        reservation.date === date
                );


        if (
            dayReservations.length > 0
        ) {

            cell.classList.add(
                "has-reservation"
            );


            // 予約件数表示

            const count =
                document.createElement("span");


            count.className =
                "admin-day-count";


            count.textContent =
                `${dayReservations.length}件`;


            cell.appendChild(
                count
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
    // 時間順
    // ==========================

    dailyReservations.sort(
        (a, b) =>
            a.time.localeCompare(
                b.time
            )
    );


    // ==========================
    // 予約表示
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
            // 生徒
            // ==========================

            const student =
                document.createElement("span");


            student.textContent =
                `${reservation.student}さん`;


            // ==========================
            // 講師
            // ==========================

            const teacher =
                document.createElement("span");


            teacher.textContent =
                `${reservation.teacher}`;


            // ==========================
            // キャンセル
            // ==========================

            const cancelButton =
                document.createElement("button");


            cancelButton.className =
                "admin-cancel-button";


            cancelButton.textContent =
                "強制キャンセル";


            cancelButton.addEventListener(
                "click",
                async () => {

                    // ==========================
                    // 最終確認
                    // ==========================

                    const confirmed =
                        confirm(

                            "本当にキャンセルしますか？\n\n" +

                            `${reservation.date}\n` +

                            `${reservation.time}\n\n` +

                            `${reservation.student}さん\n` +

                            `${reservation.teacher}\n\n` +

                            "この操作は取り消せません。"

                        );


                    if (!confirmed) {

                        return;

                    }


                    try {

                        // ==========================
                        // ID作成
                        // ==========================

                        const id =
                            `${reservation.date}_` +
                            `${reservation.time.replace(":", "")}`;


                        // ==========================
                        // 削除
                        // ==========================

                        await deleteDoc(

                            doc(
                                db,
                                "reservations",
                                id
                            )

                        );


                        alert(
                            "予約をキャンセルしました。"
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


            adminReservationList.appendChild(
                row
            );

        }
    );

}
