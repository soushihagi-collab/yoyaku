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


// ==============================
// Firebase起動
// ==============================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ==============================
// HTML要素
// ==============================

const calendar =
    document.getElementById("calendar");

const adminReservationList =
    document.getElementById("adminReservationList");

const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const monthlyReservationCount =
    document.getElementById("monthlyReservationCount");

const todayReservationCount =
    document.getElementById("todayReservationCount");

const teacherCount =
    document.getElementById("teacherCount");

const todayReservationList =
    document.getElementById("todayReservationList");

const teacherReservationList =
    document.getElementById("teacherReservationList");

const teacherReservationTitle =
    document.getElementById("teacherReservationTitle");


// ==============================
// 予約時間
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
// 現在表示している年月
// ==============================

let currentDate = new Date();


// ==============================
// データ
// ==============================

let reservations = {};

let teachers = [];

let unavailableSlots = {};


// ==============================
// 今日の日付
// ==============================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// ==============================
// 対応不可データのID
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

    collection(db, "reservations"),

    function(snapshot) {

        reservations = {};

        snapshot.forEach(function(document) {

            reservations[document.id] =
                document.data();

        });

        renderCalendar();

        renderSummary();

        renderTodayReservations();

        renderTeacherReservations();

        renderSelectedDate();
    },

    function(error) {

        console.error(
            "予約データ取得エラー:",
            error
        );

        calendar.textContent =
            "予約データを取得できませんでした。";
    }
);


// ==============================
// 対応不可データ監視
// ==============================

onSnapshot(

    collection(db, "unavailableSlots"),

    function(snapshot) {

        unavailableSlots = {};

        snapshot.forEach(function(document) {

            unavailableSlots[document.id] =
                document.data();

        });

        renderCalendar();

        renderSelectedDate();
    },

    function(error) {

        console.error(
            "対応不可データ取得エラー:",
            error
        );
    }
);


// ==============================
// 講師一覧取得
// ==============================

async function loadTeachers() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "teachers")
            );

        teachers = [];

        snapshot.forEach(function(document) {

            const data =
                document.data();

            if (data.name) {

                teachers.push(data.name);

            }

        });

        teachers.sort();

        teacherCount.textContent =
            teachers.length + "人";

        renderTeacherReservations();

        renderSelectedDate();

    } catch (error) {

        console.error(
            "講師取得エラー:",
            error
        );

        teacherCount.textContent =
            "取得失敗";
    }
}


loadTeachers();


// ==============================
// 集計表示
// ==============================

function renderSummary() {

    const today =
        getToday();

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth() + 1;

    const monthString =
        String(month).padStart(2, "0");

    const targetMonth =
        year + "-" + monthString;

    const monthlyReservations =
        Object.values(reservations).filter(
            function(reservation) {

                return reservation.date &&
                    reservation.date.startsWith(
                        targetMonth
                    );
            }
        );

    monthlyReservationCount.textContent =
        monthlyReservations.length + "件";


    const todayReservations =
        Object.values(reservations).filter(
            function(reservation) {

                return reservation.date === today;

            }
        );

    todayReservationCount.textContent =
        todayReservations.length + "件";
}


// ==============================
// 今日の予約一覧
// ==============================

function renderTodayReservations() {

    const today =
        getToday();

    todayReservationList.innerHTML = "";

    const todayReservations =
        Object.values(reservations).filter(
            function(reservation) {

                return reservation.date === today;

            }
        );


    if (todayReservations.length === 0) {

        todayReservationList.textContent =
            "本日の予約はありません。";

        return;
    }


    todayReservations.sort(
        function(a, b) {

            return a.time.localeCompare(b.time);

        }
    );


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
                reservation.student + "さん";


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
// 講師ごとの予約状況
// ==============================

function renderTeacherReservations() {

    teacherReservationList.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth() + 1;

    const monthString =
        String(month).padStart(2, "0");

    const targetMonth =
        year + "-" + monthString;


    teacherReservationTitle.textContent =
        "講師ごとの予約状況（" +
        year +
        "年" +
        month +
        "月）";


    const monthlyReservations =
        Object.values(reservations).filter(
            function(reservation) {

                return reservation.date &&
                    reservation.date.startsWith(
                        targetMonth
                    );

            }
        );


    const counts = {};


    teachers.forEach(
        function(teacher) {

            counts[teacher] = 0;

        }
    );


    monthlyReservations.forEach(
        function(reservation) {

            const teacher =
                reservation.teacher;

            if (counts[teacher] === undefined) {

                counts[teacher] = 0;

            }

            counts[teacher]++;
        }
    );


    if (Object.keys(counts).length === 0) {

        teacherReservationList.textContent =
            "講師が登録されていません。";

        return;
    }


    Object.entries(counts)
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        )
        .forEach(
            function(entry) {

                const teacher = entry[0];

                const count = entry[1];


                const row =
                    document.createElement("div");

                row.className =
                    "admin-teacher-row";


                const name =
                    document.createElement("span");

                name.textContent =
                    teacher;


                const number =
                    document.createElement("strong");

                number.textContent =
                    count + "件";


                row.appendChild(name);

                row.appendChild(number);

                teacherReservationList.appendChild(row);
            }
        );
}


// ==============================
// カレンダー表示
// ==============================

function renderCalendar() {

    calendar.innerHTML = "";


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
        function() {

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
        function() {

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
        currentDate.getFullYear() +
        "年" +
        (currentDate.getMonth() + 1) +
        "月";


    header.appendChild(previousButton);

    header.appendChild(title);

    header.appendChild(nextButton);

    calendar.appendChild(header);


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
        function(day) {

            const cell =
                document.createElement("div");

            cell.className =
                "admin-weekday";

            cell.textContent =
                day;

            weekdayRow.appendChild(cell);
        }
    );


    calendar.appendChild(weekdayRow);


    const grid =
        document.createElement("div");

    grid.className =
        "admin-calendar-grid";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
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

        grid.appendChild(empty);
    }


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
            year + "-" +
            String(month + 1).padStart(2, "0") + "-" +
            String(day).padStart(2, "0");


        cell.textContent =
            day;


        const dayReservations =
            Object.values(reservations).filter(
                function(reservation) {

                    return reservation.date === date;

                }
            );


        if (dayReservations.length > 0) {

            cell.classList.add(
                "has-reservation"
            );


            const count =
                document.createElement("span");

            count.className =
                "admin-day-count";

            count.textContent =
                dayReservations.length + "件";

            cell.appendChild(count);
        }


        cell.addEventListener(
            "click",
            function() {

                showReservations(date);

            }
        );


        grid.appendChild(cell);
    }


    calendar.appendChild(grid);
}


// ==============================
// 選択日の再表示
// ==============================

function renderSelectedDate() {

    const date =
        selectedDateTitle.dataset.date;


    if (!date) {

        return;

    }


    showReservations(
        date,
        false
    );
}


// ==============================
// 指定日の管理画面
// ==============================

function showReservations(
    date,
    scroll
) {

    if (scroll === undefined) {

        scroll = true;

    }


    selectedDateTitle.dataset.date =
        date;


    selectedDateTitle.textContent =
        "⑤ " + date + " の管理";


    adminReservationList.innerHTML = "";


    const description =
        document.createElement("p");

    description.className =
        "admin-schedule-description";

    description.textContent =
        "講師ごとに対応可否を変更できます。";

    adminReservationList.appendChild(
        description
    );


    timeSlots.forEach(
        function(time) {

            const timeRow =
                document.createElement("div");

            timeRow.className =
                "admin-schedule-row";


            const timeElement =
                document.createElement("div");

            timeElement.className =
                "admin-schedule-time";

            timeElement.textContent =
                time;

            timeRow.appendChild(
                timeElement
            );


            const teacherArea =
                document.createElement("div");

            teacherArea.className =
                "admin-schedule-teachers";


            teachers.forEach(
                function(teacher) {

                    const reservation =
                        Object.values(reservations).find(
                            function(item) {

                                return item.date === date &&
                                    item.time === time &&
                                    item.teacher === teacher;

                            }
                        );


                    const unavailableId =
                        createUnavailableId(
                            date,
                            time,
                            teacher
                        );


                    const isUnavailable =
                        Boolean(
                            unavailableSlots[unavailableId]
                        );


                    const teacherRow =
                        document.createElement("div");

                    teacherRow.className =
                        "admin-availability-row";


                    if (reservation) {

                        teacherRow.classList.add(
                            "is-reserved"
                        );

                    } else if (isUnavailable) {

                        teacherRow.classList.add(
                            "is-unavailable"
                        );

                    } else {

                        teacherRow.classList.add(
                            "is-available"
                        );
                    }


                    const name =
                        document.createElement("span");

                    name.className =
                        "admin-availability-name";

                    name.textContent =
                        teacher;

                    teacherRow.appendChild(name);


                    const state =
                        document.createElement("span");

                    state.className =
                        "admin-availability-state";


                    if (reservation) {

                        state.textContent =
                            "予約済み";

                    } else if (isUnavailable) {

                        state.textContent =
                            "対応不可";

                    } else {

                        state.textContent =
                            "対応可能";
                    }


                    teacherRow.appendChild(state);


                    if (!reservation) {

                        const button =
                            document.createElement("button");

                        button.className =
                            "admin-availability-button";


                        if (isUnavailable) {

                            button.textContent =
                                "対応可能";

                            button.classList.add(
                                "make-available"
                            );

                        } else {

                            button.textContent =
                                "対応不可";

                            button.classList.add(
                                "make-unavailable"
                            );
                        }


                        button.addEventListener(
                            "click",
                            async function() {

                                await toggleAvailability(
                                    date,
                                    time,
                                    teacher,
                                    isUnavailable
                                );

                            }
                        );


                        teacherRow.appendChild(button);
                    }


                    teacherArea.appendChild(
                        teacherRow
                    );
                }
            );


            timeRow.appendChild(
                teacherArea
            );


            adminReservationList.appendChild(
                timeRow
            );
        }
    );


    if (scroll) {

        adminReservationList.scrollIntoView({

            behavior: "smooth",

            block: "start"
        });
    }
}


// ==============================
// 対応可能 / 対応不可切替
// ==============================

async function toggleAvailability(
    date,
    time,
    teacher,
    currentlyUnavailable
) {

    const id =
        createUnavailableId(
            date,
            time,
            teacher
        );


    try {

        if (currentlyUnavailable) {

            const confirmed =
                confirm(
                    date + "\n" +
                    time + "\n\n" +
                    teacher + "\n\n" +
                    "対応可能に戻しますか？"
                );


            if (!confirmed) {

                return;

            }


            await deleteDoc(
                doc(
                    db,
                    "unavailableSlots",
                    id
                )
            );


            alert(
                "対応可能に戻しました。"
            );


            return;
        }


        const confirmed =
            confirm(
                date + "\n" +
                time + "\n\n" +
                teacher + "\n\n" +
                "この講師を対応不可にしますか？\n\n" +
                "対応不可にすると、生徒側の講師選択画面に表示されなくなります。"
            );


        if (!confirmed) {

            return;

        }


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
                createdAt: new Date().toISOString()
            }
        );


        alert(
            "対応不可に設定しました。"
        );


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
