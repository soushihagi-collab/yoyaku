// ==============================
// Firebase
// ==============================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==============================
// Firebase設定
// ==============================

const firebaseConfig = {

    apiKey:
        "AIzaSyAOmKuFH0JzrHoZPsIX60ut7FKwOkD3KFA",

    authDomain:
        "test-2120a.firebaseapp.com",

    projectId:
        "test-2120a",

    storageBucket:
        "test-2120a.firebasestorage.app",

    messagingSenderId:
        "144755350",

    appId:
        "1:144755350:web:b68bc5ea0dad7a3a2890b7",

    measurementId:
        "G-BSKV15BDKP"

};


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


// ==============================
// DOM
// ==============================

const dateSelect =
    document.getElementById("dateSelect");

const reservationBoard =
    document.getElementById("reservationBoard");

const reservationForm =
    document.getElementById("reservationForm");

const reservationDateTime =
    document.getElementById("reservationDateTime");

const studentName =
    document.getElementById("studentName");

const teacherSelect =
    document.getElementById("teacherSelect");

const question =
    document.getElementById("question");

const cancelPassword =
    document.getElementById("cancelPassword");

const reservationSubmit =
    document.getElementById("reservationSubmit");

const connectionStatus =
    document.getElementById("connectionStatus");


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

let unavailableSlots = {};

let teachers = [];

let selectedTime = "";


// ==============================
// 今日の日付
// ==============================

function getToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


// ==============================
// 初期日付
// ==============================

dateSelect.value =
    getToday();


// ==============================
// Firestore
// ==============================

const reservationsRef =
    collection(
        db,
        "reservations"
    );

const unavailableSlotsRef =
    collection(
        db,
        "unavailableSlots"
    );

const teachersRef =
    collection(
        db,
        "teachers"
    );


// ==============================
// SHA-256
// ==============================

async function hashPassword(password) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(password);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hash)
        );

    return hashArray
        .map(function(byte) {

            return byte
                .toString(16)
                .padStart(2, "0");

        })
        .join("");

}


// ==============================
// 対応不可ID
// ==============================

function createUnavailableId(
    date,
    time,
    teacher
) {

    return (
        date +
        "_" +
        time.replace(":", "") +
        "_" +
        encodeURIComponent(teacher)
    );

}


// ==============================
// 予約ID
// ==============================

function createReservationId(
    date,
    time
) {

    return (
        date +
        "_" +
        time.replace(":", "")
    );

}


// ==============================
// 予約データ監視
// ==============================

onSnapshot(
    reservationsRef,
    function(snapshot) {

        reservations = {};

        snapshot.forEach(
            function(document) {

                reservations[document.id] =
                    document.data();

            }
        );

        renderReservationBoard();

        connectionStatus.textContent =
            "接続中";

    },
    function(error) {

        console.error(
            "予約データ取得エラー:",
            error
        );

        connectionStatus.textContent =
            "接続エラー";

    }
);


// ==============================
// 対応不可データ監視
// ==============================

onSnapshot(
    unavailableSlotsRef,
    function(snapshot) {

        unavailableSlots = {};

        snapshot.forEach(
            function(document) {

                unavailableSlots[
                    document.id
                ] = document.data();

            }
        );

        renderReservationBoard();

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

        const snapshot =
            await onetimeGetTeachers();

        teachers = [];

        snapshot.forEach(
            function(document) {

                const data =
                    document.data();

                if (data.name) {

                    teachers.push(
                        data.name
                    );

                }

            }
        );

        teachers.sort();

        renderTeacherSelect();

        renderReservationBoard();

    } catch (error) {

        console.error(
            "講師取得エラー:",
            error
        );

    }

}


// ==============================
// 講師取得用
// ==============================

async function onetimeGetTeachers() {

    const snapshot =
        await getTeachersSnapshot();

    return snapshot;

}


// ==============================
// Firestore講師取得
// ==============================

async function getTeachersSnapshot() {

    const {
        getDocs
    } = await import(
        "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
    );

    return await getDocs(
        teachersRef
    );

}


loadTeachers();


// ==============================
// 講師選択肢
// ==============================

function renderTeacherSelect() {

    const currentValue =
        teacherSelect.value;

    teacherSelect.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "講師を選択してください";

    teacherSelect.appendChild(
        defaultOption
    );


    teachers.forEach(
        function(teacher) {

            const option =
                document.createElement("option");

            option.value =
                teacher;

            option.textContent =
                teacher;

            teacherSelect.appendChild(
                option
            );

        }
    );


    if (
        teachers.indexOf(
            currentValue
        ) !== -1
    ) {

        teacherSelect.value =
            currentValue;

    }

}


// ==============================
// 予約状況表示
// ==============================

function renderReservationBoard() {

    const date =
        dateSelect.value;

    if (!date) {

        reservationBoard.textContent =
            "日付を選択してください。";

        return;

    }

    reservationBoard.innerHTML = "";


    timeSlots.forEach(
        function(time) {

            const row =
                document.createElement("div");

            row.className =
                "reservation-row";


            const timeElement =
                document.createElement("span");

            timeElement.className =
                "reservation-time";

            timeElement.textContent =
                time;


            const reservationId =
                createReservationId(
                    date,
                    time
                );

            const reservation =
                reservations[
                    reservationId
                ];


            if (reservation) {

                row.classList.add(
                    "reserved"
                );


                const status =
                    document.createElement("span");

                status.className =
                    "reservation-status";

                status.textContent =
                    "予約済み";


                row.appendChild(
                    timeElement
                );

                row.appendChild(
                    status
                );


                reservationBoard.appendChild(
                    row
                );

                return;

            }


            const availableTeachers =
                teachers.filter(
                    function(teacher) {

                        const unavailableId =
                            createUnavailableId(
                                date,
                                time,
                                teacher
                            );

                        return !unavailableSlots[
                            unavailableId
                        ];

                    }
                );


            if (
                availableTeachers.length === 0
            ) {

                row.classList.add(
                    "unavailable"
                );


                const status =
                    document.createElement("span");

                status.className =
                    "reservation-status";

                status.textContent =
                    "予約不可";


                row.appendChild(
                    timeElement
                );

                row.appendChild(
                    status
                );


                reservationBoard.appendChild(
                    row
                );

                return;

            }


            row.classList.add(
                "available"
            );


            const button =
                document.createElement("button");

            button.type =
                "button";

            button.textContent =
                "予約する";


            button.addEventListener(
                "click",
                function() {

                    openReservationForm(
                        date,
                        time
                    );

                }
            );


            row.appendChild(
                timeElement
            );

            row.appendChild(
                button
            );


            reservationBoard.appendChild(
                row
            );

        }
    );

}


// ==============================
// 予約フォーム表示
// ==============================

function openReservationForm(
    date,
    time
) {

    selectedTime =
        time;

    reservationDateTime.textContent =
        date +
        " " +
        time;

    reservationForm.style.display =
        "block";


    reservationForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==============================
// 日付変更
// ==============================

dateSelect.addEventListener(
    "change",
    function() {

        selectedTime = "";

        reservationForm.style.display =
            "none";

        renderReservationBoard();

    }
);


// ==============================
// 予約
// ==============================

reservationSubmit.addEventListener(
    "click",
    async function() {

        const date =
            dateSelect.value;

        const student =
            studentName.value.trim();

        const teacher =
            teacherSelect.value;

        const questionText =
            question.value.trim();

        const password =
            cancelPassword.value;


        // ==============================
        // 入力チェック
        // ==============================

        if (!date) {

            alert(
                "日付を選択してください。"
            );

            return;

        }


        if (!selectedTime) {

            alert(
                "予約する時間を選択してください。"
            );

            return;

        }


        if (!student) {

            alert(
                "生徒名を入力してください。"
            );

            studentName.focus();

            return;

        }


        if (!teacher) {

            alert(
                "担当講師を選択してください。"
            );

            teacherSelect.focus();

            return;

        }


        if (!questionText) {

            alert(
                "質問内容を入力してください。"
            );

            question.focus();

            return;

        }


        if (!password) {

            alert(
                "キャンセル用合言葉を入力してください。"
            );

            cancelPassword.focus();

            return;

        }


        // ==============================
        // 最終確認
        // ==============================

        const confirmed =
            confirm(
                date +
                "\n" +
                selectedTime +
                "\n\n" +
                "生徒名：" +
                student +
                "\n" +
                "担当講師：" +
                teacher +
                "\n" +
                "質問内容：" +
                questionText +
                "\n\n" +
                "この内容で予約しますか？"
            );

        if (!confirmed) {

            return;

        }


        reservationSubmit.disabled =
            true;

        reservationSubmit.textContent =
            "予約中...";


        try {

            // ==============================
            // 対応不可の最終確認
            // ==============================

            const unavailableId =
                createUnavailableId(
                    date,
                    selectedTime,
                    teacher
                );

            const unavailableSnapshot =
                await getDoc(
                    doc(
                        db,
                        "unavailableSlots",
                        unavailableId
                    )
                );


            if (
                unavailableSnapshot.exists()
            ) {

                alert(
                    "選択した講師は、この時間に対応できません。\n別の時間または講師を選択してください。"
                );

                renderReservationBoard();

                return;

            }


            // ==============================
            // 予約済みの最終確認
            // ==============================

            const reservationId =
                createReservationId(
                    date,
                    selectedTime
                );

            const reservationSnapshot =
                await getDoc(
                    doc(
                        db,
                        "reservations",
                        reservationId
                    )
                );


            if (
                reservationSnapshot.exists()
            ) {

                alert(
                    "申し訳ありません。\nこの時間はすでに予約されています。"
                );

                renderReservationBoard();

                return;

            }


            // ==============================
            // パスワードハッシュ
            // ==============================

            const passwordHash =
                await hashPassword(
                    password
                );


            // ==============================
            // 予約保存
            // ==============================

            await setDoc(
                doc(
                    db,
                    "reservations",
                    reservationId
                ),
                {

                    date:
                        date,

                    time:
                        selectedTime,

                    student:
                        student,

                    teacher:
                        teacher,

                    question:
                        questionText,

                    cancelPasswordHash:
                        passwordHash

                }
            );


            alert(
                "予約が完了しました。"
            );


            // ==============================
            // フォーム初期化
            // ==============================

            studentName.value =
                "";

            teacherSelect.value =
                "";

            question.value =
                "";

            cancelPassword.value =
                "";

            selectedTime =
                "";

            reservationForm.style.display =
                "none";


            renderReservationBoard();


        } catch (error) {

            console.error(
                "予約エラー:",
                error
            );

            alert(
                "予約に失敗しました。\n時間をおいて、もう一度お試しください。"
            );

        } finally {

            reservationSubmit.disabled =
                false;

            reservationSubmit.textContent =
                "④ 予約する";

        }

    }
);


// ==============================
// キャンセル機能
// ==============================

// 予約掲示板上で予約済み時間をクリックした際などに
// 必要になるキャンセル処理を定義

async function cancelReservation(
    date,
    time,
    password
) {

    const reservationId =
        createReservationId(
            date,
            time
        );

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "reservations",
                    reservationId
                )
            );


        if (!snapshot.exists()) {

            alert(
                "予約が見つかりません。"
            );

            return;

        }


        const reservation =
            snapshot.data();


        const passwordHash =
            await hashPassword(
                password
            );


        if (
            passwordHash !==
            reservation.cancelPasswordHash
        ) {

            alert(
                "キャンセル用合言葉が正しくありません。"
            );

            return;

        }


        await deleteDoc(
            doc(
                db,
                "reservations",
                reservationId
            )
        );


        alert(
            "予約をキャンセルしました。"
        );


        renderReservationBoard();


    } catch (error) {

        console.error(
            "キャンセルエラー:",
            error
        );

        alert(
            "キャンセルに失敗しました。"
        );

    }

}
