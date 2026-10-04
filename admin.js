// Firebase
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    getDocs,
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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ==============================
// DOM
// ==============================

const monthlyReservationCount =
    document.getElementById("monthlyReservationCount");

const todayReservationCount =
    document.getElementById("todayReservationCount");

const teacherCount =
    document.getElementById("teacherCount");

const todayReservationList =
    document.getElementById("todayReservationList");

const teacherMonthlyList =
    document.getElementById("teacherMonthlyList");

const teacherMonthlyTitle =
    document.getElementById("teacherMonthlyTitle");

const calendar =
    document.getElementById("calendar");

const calendarTitle =
    document.getElementById("calendarTitle");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");

const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const adminReservationList =
    document.getElementById("adminReservationList");

const adminTeacherList =
    document.getElementById("adminTeacherList");

const teacherListView =
    document.getElementById("teacherListView");

const teacherScheduleView =
    document.getElementById("teacherScheduleView");

const selectedTeacherName =
    document.getElementById("selectedTeacherName");

const backToTeacherList =
    document.getElementById("backToTeacherList");

const availabilityDate =
    document.getElementById("availabilityDate");

const adminTeacherSchedule =
    document.getElementById("adminTeacherSchedule");


// ==============================
// 時間
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
// データ
// ==============================

let reservations = {};
let teachers = [];
let unavailableSlots = {};

let currentDate = new Date();

let selectedCalendarDate = "";

let selectedTeacher = "";


// ==============================
// 今日の日付
// ==============================

function getToday() {

    const now = new Date();

    const year = now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


const today = getToday();

availabilityDate.value = today;


// ==============================
// Firestore
// ==============================

const reservationsRef =
    collection(db, "reservations");

const unavailableSlotsRef =
    collection(db, "unavailableSlots");


// ==============================
// 対応不可ID
// ==============================

function createUnavailableId(date, time, teacher) {

    return date + "_" +
        time.replace(":", "") + "_" +
        encodeURIComponent(teacher);
}


// ==============================
// 予約データ監視
// ==============================

onSnapshot(
    reservationsRef,
    function(snapshot) {

        reservations = {};

        snapshot.forEach(function(document) {

            reservations[document.id] =
                document.data();

        });


        renderSummary();

        renderTodayReservations();

        renderTeacherMonthlyReservations();

        renderCalendar();


        if (selectedCalendarDate) {

            showReservations(
                selectedCalendarDate
            );

        }


        if (selectedTeacher) {

            renderTeacherSchedule();

        }

    },
    function(error) {

        console.error(
            "予約データ取得エラー:",
            error
        );

    }
);


// ==============================
// 対応不可データ監視
// ==============================

onSnapshot(
    unavailableSlotsRef,
    function(snapshot) {

        unavailableSlots = {};

        snapshot.forEach(function(document) {

            unavailableSlots[document.id] =
                document.data();

        });


        if (selectedTeacher) {

            renderTeacherSchedule();

        }

    },
    function(error) {

        console.error(
            "対応不可データ取得エラー:",
            error
        );

    }
);


// ==============================
// 講師取得
// ==============================

async function loadTeachers() {

    try {

        const teachersRef =
            collection(db, "teachers");

        const snapshot =
            await getDocs(teachersRef);


        teachers = [];


        snapshot.forEach(function(document) {

            const data =
                document.data();

            if (data.name) {

                teachers.push(
                    data.name
                );

            }

        });


        teachers.sort();


        teacherCount.textContent =
            teachers.length;


        renderTeacherList();


        renderTeacherMonthlyReservations();


    } catch (error) {

        console.error(
            "講師取得エラー:",
            error
        );

    }

}


loadTeachers();


// ==============================
// 集計
// ==============================

function renderSummary() {

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    let monthlyCount = 0;

    let todayCount = 0;


    Object.keys(reservations).forEach(function(id) {

        const reservation =
            reservations[id];

        if (!reservation.date) {
            return;
        }


        const date =
            new Date(
                reservation.date + "T00:00:00"
            );


        if (
            date.getFullYear() === year &&
            date.getMonth() === month
        ) {

            monthlyCount++;

        }


        if (
            reservation.date === today
        ) {

            todayCount++;

        }

    });


    monthlyReservationCount.textContent =
        monthlyCount;

    todayReservationCount.textContent =
        todayCount;

}


// ==============================
// 今日の予約
// ==============================

function renderTodayReservations() {

    todayReservationList.innerHTML = "";


    const todayReservations =
        Object.values(reservations)
            .filter(function(reservation) {

                return reservation.date === today;

            })
            .sort(function(a, b) {

                return a.time.localeCompare(
                    b.time
                );

            });


    if (todayReservations.length === 0) {

        todayReservationList.textContent =
            "今日の予約はありません。";

        return;

    }


    todayReservations.forEach(
        function(reservation) {

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
                reservation.student;


            const teacher =
                document.createElement("span");

            teacher.textContent =
                reservation.teacher;


            row.appendChild(time);

            row.appendChild(student);

            row.appendChild(teacher);


            todayReservationList.appendChild(row);

        }
    );

}


// ==============================
// 講師別・今月の予約
// ==============================

function renderTeacherMonthlyReservations() {

    teacherMonthlyList.innerHTML = "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    teacherMonthlyTitle.textContent =
        (year + "年" + (month + 1) + "月") +
        " 講師別予約数";


    if (teachers.length === 0) {

        teacherMonthlyList.textContent =
            "講師が登録されていません。";

        return;

    }


    const counts = {};


    teachers.forEach(function(teacher) {

        counts[teacher] = 0;

    });


    Object.values(reservations).forEach(
        function(reservation) {

            if (!reservation.date) {
                return;
            }


            const date =
                new Date(
                    reservation.date +
                    "T00:00:00"
                );


            if (
                date.getFullYear() === year &&
                date.getMonth() === month
            ) {

                if (
                    counts[
                        reservation.teacher
                    ] !== undefined
                ) {

                    counts[
                        reservation.teacher
                    ]++;

                }

            }

        }
    );


    teachers.forEach(function(teacher) {

        const row =
            document.createElement("div");

        row.className =
            "admin-teacher-row";


        const name =
            document.createElement("strong");

        name.textContent =
            teacher;


        const count =
            document.createElement("span");

        count.textContent =
            counts[teacher] + "件";


        row.appendChild(name);

        row.appendChild(count);


        teacherMonthlyList.appendChild(row);

    });

}


// ==============================
// カレンダー
// ==============================

function renderCalendar() {

    calendar.innerHTML = "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    calendarTitle.textContent =
        year + "年" +
        (month + 1) + "月";


    const weekdays = [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];


    weekdays.forEach(function(day) {

        const element =
            document.createElement("div");

        element.className =
            "admin-weekday";

        element.textContent =
            day;

        calendar.appendChild(element);

    });


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "admin-day empty";

        calendar.appendChild(empty);

    }


    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const dateString =
            year + "-" +
            String(month + 1).padStart(2, "0") +
            "-" +
            String(day).padStart(2, "0");


        const button =
            document.createElement("button");

        button.className =
            "admin-day";


        const dayNumber =
            document.createElement("span");

        dayNumber.textContent =
            day;


        button.appendChild(
            dayNumber
        );


        const reservationCount =
            Object.values(reservations)
                .filter(function(reservation) {

                    return reservation.date ===
                        dateString;

                }).length;


        if (reservationCount > 0) {

            button.classList.add(
                "has-reservation"
            );


            const count =
                document.createElement("span");

            count.className =
                "admin-day-count";

            count.textContent =
                reservationCount + "件";


            button.appendChild(count);

        }


        button.addEventListener(
            "click",
            function() {

                showReservations(
                    dateString
                );

            }
        );


        calendar.appendChild(button);

    }

}


// ==============================
// 月移動
// ==============================

prevMonth.addEventListener(
    "click",
    function() {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();

        renderSummary();

        renderTeacherMonthlyReservations();

    }
);


nextMonth.addEventListener(
    "click",
    function() {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();

        renderSummary();

        renderTeacherMonthlyReservations();

    }
);


// ==============================
// 日付の予約一覧
// ==============================

function showReservations(date) {

    selectedCalendarDate =
        date;


    selectedDateTitle.textContent =
        date + " の予約";


    adminReservationList.innerHTML = "";


    const dayReservations =
        Object.values(reservations)
            .filter(function(reservation) {

                return reservation.date ===
                    date;

            })
            .sort(function(a, b) {

                return a.time.localeCompare(
                    b.time
                );

            });


    if (dayReservations.length === 0) {

        adminReservationList.textContent =
            "この日の予約はありません。";

        return;

    }


    dayReservations.forEach(
        function(reservation) {

            const row =
                document.createElement("div");

            row.className =
                "admin-reservation";


            const time =
                document.createElement("strong");

            time.textContent =
                reservation.time;


            const student =
                document.createElement("span");

            student.textContent =
                reservation.student;


            const teacher =
                document.createElement("span");

            teacher.textContent =
                reservation.teacher;


            const cancelButton =
                document.createElement("button");

            cancelButton.className =
                "admin-cancel-button";

            cancelButton.textContent =
                "この予約をキャンセル";


            cancelButton.addEventListener(
                "click",
                async function() {

                    const confirmed =
                        confirm(
                            reservation.date +
                            "\n" +
                            reservation.time +
                            "\n\n" +
                            reservation.student +
                            "さん\n" +
                            reservation.teacher +
                            "\n\n" +
                            "この予約を管理者権限でキャンセルしますか？"
                        );


                    if (!confirmed) {
                        return;
                    }


                    try {

                        const id =
                            reservation.date +
                            "_" +
                            reservation.time.replace(
                                ":",
                                ""
                            );


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
                            "管理者キャンセルエラー:",
                            error
                        );

                        alert(
                            "キャンセルに失敗しました。"
                        );

                    }

                }
            );


            row.appendChild(time);

            row.appendChild(student);

            row.appendChild(teacher);

            row.appendChild(cancelButton);


            adminReservationList.appendChild(row);

        }
    );

}


// ==============================
// 講師一覧
// ==============================

function renderTeacherList() {

    adminTeacherList.innerHTML = "";


    if (teachers.length === 0) {

        adminTeacherList.textContent =
            "講師が登録されていません。";

        return;

    }


    teachers.forEach(function(teacher) {

        const button =
            document.createElement("button");

        button.className =
            "admin-teacher-select";


        const name =
            document.createElement("span");

        name.textContent =
            teacher;


        const arrow =
            document.createElement("span");

        arrow.textContent =
            "›";


        button.appendChild(name);

        button.appendChild(arrow);


        button.addEventListener(
            "click",
            function() {

                openTeacherSchedule(
                    teacher
                );

            }
        );


        adminTeacherList.appendChild(
            button
        );

    });

}


// ==============================
// 講師の時間一覧を開く
// ==============================

function openTeacherSchedule(teacher) {

    selectedTeacher =
        teacher;


    selectedTeacherName.textContent =
        teacher + "先生";


    teacherListView.style.display =
        "none";


    teacherScheduleView.style.display =
        "block";


    renderTeacherSchedule();

}


// ==============================
// 講師一覧に戻る
// ==============================

backToTeacherList.addEventListener(
    "click",
    function() {

        selectedTeacher = "";


        teacherScheduleView.style.display =
            "none";


        teacherListView.style.display =
            "block";

    }
);


// ==============================
// 講師の時間一覧
// ==============================

function renderTeacherSchedule() {

    if (!selectedTeacher) {
        return;
    }


    const date =
        availabilityDate.value;


    if (!date) {

        adminTeacherSchedule.textContent =
            "日付を選択してください。";

        return;

    }


    adminTeacherSchedule.innerHTML = "";


    timeSlots.forEach(function(time) {

        const row =
            document.createElement("div");

        row.className =
            "admin-availability-row";


        const reservationId =
            date + "_" +
            time.replace(":", "");


        const reservation =
            reservations[reservationId];


        const unavailableId =
            createUnavailableId(
                date,
                time,
                selectedTeacher
            );


        const unavailable =
            unavailableSlots[
                unavailableId
            ];


        const timeElement =
            document.createElement("div");

        timeElement.className =
            "admin-availability-time";

        timeElement.textContent =
            time;


        const state =
            document.createElement("div");

        state.className =
            "admin-availability-state";


        const action =
            document.createElement("div");

        action.className =
            "admin-availability-action";


        row.appendChild(
            timeElement
        );

        row.appendChild(
            state
        );

        row.appendChild(
            action
        );


        // ==============================
        // 予約済み
        // ==============================

        if (
            reservation &&
            reservation.teacher ===
            selectedTeacher
        ) {

            row.classList.add(
                "is-reserved"
            );


            state.textContent =
                "予約済み";


            action.textContent =
                "変更不可";


            action.className =
                "admin-availability-action disabled";


            adminTeacherSchedule.appendChild(
                row
            );

            return;

        }


        // ==============================
        // 対応不可
        // ==============================

        if (unavailable) {

            row.classList.add(
                "is-unavailable"
            );


            state.textContent =
                "対応不可";


            const button =
                document.createElement("button");

            button.className =
                "admin-availability-button make-available";

            button.textContent =
                "対応可能にする";


            button.addEventListener(
                "click",
                function() {

                    toggleAvailability(
                        date,
                        time,
                        selectedTeacher,
                        false
                    );

                }
            );


            action.appendChild(
                button
            );


        } else {

            // ==============================
            // 対応可能
            // ==============================

            row.classList.add(
                "is-available"
            );


            state.textContent =
                "対応可能";


            const button =
                document.createElement("button");

            button.className =
                "admin-availability-button make-unavailable";

            button.textContent =
                "対応不可にする";


            button.addEventListener(
                "click",
                function() {

                    toggleAvailability(
                        date,
                        time,
                        selectedTeacher,
                        true
                    );

                }
            );


            action.appendChild(
                button
            );

        }


        adminTeacherSchedule.appendChild(
            row
        );

    });

}


// ==============================
// 日付変更
// ==============================

availabilityDate.addEventListener(
    "change",
    function() {

        renderTeacherSchedule();

    }
);


// ==============================
// 対応可否変更
// ==============================

async function toggleAvailability(
    date,
    time,
    teacher,
    makeUnavailable
) {

    const id =
        createUnavailableId(
            date,
            time,
            teacher
        );


    try {

        if (makeUnavailable) {

            await setDoc(
                doc(
                    db,
                    "unavailableSlots",
                    id
                ),
                {
                    date: date,
                    time: time,
                    teacher: teacher,
                    updatedAt:
                        new Date().toISOString()
                }
            );

        } else {

            await deleteDoc(
                doc(
                    db,
                    "unavailableSlots",
                    id
                )
            );

        }


    } catch (error) {

        console.error(
            "対応可否変更エラー:",
            error
        );

        alert(
            "対応可否の変更に失敗しました。"
        );

    }

}
