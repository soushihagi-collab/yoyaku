// Firebase
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc
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

const app =
    initializeApp(firebaseConfig);


// Firestore

const db =
    getFirestore(app);


// ==============================
// HTML要素
// ==============================

const board =
    document.getElementById(
        "reservationBoard"
    );


const status =
    document.getElementById(
        "connectionStatus"
    );


const dateSelect =
    document.getElementById(
        "dateSelect"
    );


const reservationForm =
    document.getElementById(
        "reservationForm"
    );


const reservationDateTime =
    document.getElementById(
        "reservationDateTime"
    );


const studentName =
    document.getElementById(
        "studentName"
    );


const teacherSelect =
    document.getElementById(
        "teacherSelect"
    );


const cancelPassword =
    document.getElementById(
        "cancelPassword"
    );


const reservationSubmit =
    document.getElementById(
        "reservationSubmit"
    );


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
// 今日の日付
// ==============================

const today =
    new Date()
        .toISOString()
        .split("T")[0];


dateSelect.value =
    today;


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


// ==============================
// 講師一覧
// ==============================

let teachers = [];


async function loadTeachers() {

    try {

        const teachersRef =
            collection(
                db,
                "teachers"
            );


        const snapshot =
            await getDocs(
                teachersRef
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


        teachers.sort();


        updateTeacherSelect(
            selectedDate,
            selectedTime
        );


        console.log(
            "講師一覧:",
            teachers
        );


    } catch (error) {

        console.error(
            "講師取得エラー:",
            error
        );

    }

}


loadTeachers();


// ==============================
// 現在選択している予約
// ==============================

let selectedDate = "";

let selectedTime = "";

let selectedId = "";


// ==============================
// 対応不可データ
// ==============================

let unavailableSlots = {};


// ==============================
// 対応不可データID
// ==============================

function createUnavailableId(
    date,
    time,
    teacher
) {

    return (
        `${date}_` +
        `${time.replace(":", "")}_` +
        `${encodeURIComponent(teacher)}`
    );

}


// ==============================
// 合言葉をハッシュ化
// ==============================

async function hashPassword(
    password
) {

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(
            password
        );


    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );


    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
        );


    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");

}


// ==============================
// 予約データをリアルタイム監視
// ==============================

onSnapshot(

    reservationsRef,

    (snapshot) => {

        console.log(
            "予約データが更新されました"
        );


        const reservations = {};


        snapshot.forEach(
            (document) => {

                const data =
                    document.data();


                reservations[
                    document.id
                ] = data;

            }
        );


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
// 対応不可データをリアルタイム監視
// ==============================

onSnapshot(

    unavailableSlotsRef,

    (snapshot) => {

        unavailableSlots = {};


        snapshot.forEach(
            (document) => {

                unavailableSlots[
                    document.id
                ] = document.data();

            }
        );


        renderBoard(
            dateSelect.value,
            getCurrentReservations()
        );


        updateTeacherSelect(
            selectedDate,
            selectedTime
        );

    },


    (error) => {

        console.error(
            "対応不可データ読み込みエラー:",
            error
        );

    }

);


// ==============================
// 現在の予約データ
// ==============================

let currentReservations = {};


function getCurrentReservations() {

    return currentReservations;

}


// ==============================
// 予約データ監視用を更新
// ==============================

onSnapshot(

    reservationsRef,

    (snapshot) => {

        currentReservations = {};


        snapshot.forEach(
            (document) => {

                currentReservations[
                    document.id
                ] = document.data();

            }
        );

        renderBoard(
            dateSelect.value,
            currentReservations
        );

    }

);


// ==============================
// 掲示板を表示
// ==============================

function renderBoard(
    date,
    reservations
) {

    board.innerHTML =
        "";


    timeSlots.forEach(
        (time) => {

            const id =
                `${date}_` +
                `${time.replace(":", "")}`;


            const reservation =
                reservations[id];


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "reservation-row";


            const timeElement =
                document.createElement(
                    "div"
                );


            timeElement.className =
                "time";


            timeElement.textContent =
                time;


            const teacherElement =
                document.createElement(
                    "div"
                );


            teacherElement.className =
                "teacher";


            const actionElement =
                document.createElement(
                    "div"
                );


            actionElement.className =
                "reservation-action";


            // ==========================
            // 予約済み
            // ==========================

            if (reservation) {

                teacherElement.textContent =
                    `${reservation.teacher}`;


                const reserved =
                    document.createElement(
                        "div"
                    );


                reserved.className =
                    "reserved";


                reserved.textContent =
                    "🔴 予約済み";


                actionElement.appendChild(
                    reserved
                );


                const cancelButton =
                    document.createElement(
                        "button"
                    );


                cancelButton.className =
                    "cancelButton";


                cancelButton.textContent =
                    "予約をキャンセル";


                cancelButton.addEventListener(
                    "click",
                    () => {

                        cancelReservation(
                            id,
                            reservation
                        );

                    }
                );


                actionElement.appendChild(
                    cancelButton
                );

            }


            // ==========================
            // 空き
            // ==========================

            else {

                teacherElement.textContent =
                    "質問したい！";


                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "available";


                button.textContent =
                    "🟢 予約する";


                button.addEventListener(
                    "click",
                    () => {

                        openReservationForm(
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


            board.appendChild(
                row
            );

        }
    );

}


// ==============================
// 講師選択欄を更新
// ==============================

function updateTeacherSelect(
    date,
    time
) {

    if (!teacherSelect) {

        return;

    }


    teacherSelect.innerHTML =
        '<option value="">講師を選択してください</option>';


    if (
        !date ||
        !time
    ) {

        teachers.forEach(
            (teacher) => {

                addTeacherOption(
                    teacher
                );

            }
        );

        return;

    }


    teachers.forEach(
        (teacher) => {

            const unavailableId =
                createUnavailableId(
                    date,
                    time,
                    teacher
                );


            const isUnavailable =
                Boolean(
                    unavailableSlots[
                        unavailableId
                    ]
                );


            if (!isUnavailable) {

                addTeacherOption(
                    teacher
                );

            }

        }
    );

}


// ==============================
// 講師を選択欄に追加
// ==============================

function addTeacherOption(
    teacher
) {

    const option =
        document.createElement(
            "option"
        );


    option.value =
        teacher;


    option.textContent =
        teacher;


    teacherSelect.appendChild(
        option
    );

}


// ==============================
// 予約キャンセル
// ==============================

async function cancelReservation(
    id,
    reservation
) {

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


    const password =
        prompt(
            "予約時に設定したキャンセル用合言葉を入力してください。"
        );


    if (password === null) {

        return;

    }


    if (!password) {

        alert(
            "合言葉を入力してください。"
        );

        return;

    }


    try {

        const passwordHash =
            await hashPassword(
                password
            );


        if (
            passwordHash !==
            reservation.cancelPasswordHash
        ) {

            alert(
                "合言葉が正しくありません。"
            );

            return;

        }


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
            "キャンセルエラー:",
            error
        );


        alert(
            "キャンセルに失敗しました。"
        );

    }

}


// ==============================
// 予約フォームを開く
// ==============================

function openReservationForm(
    date,
    time,
    id
) {

    selectedDate =
        date;


    selectedTime =
        time;


    selectedId =
        id;


    reservationDateTime.textContent =
        `${date} ${time}`;


    studentName.value =
        "";


    teacherSelect.value =
        "";


    cancelPassword.value =
        "";


    // ==========================
    // 対応可能な講師だけ表示
    // ==========================

    updateTeacherSelect(
        date,
        time
    );


    // ==========================
    // 講師がいない場合
    // ==========================

    if (
        teacherSelect.options.length <= 1
    ) {

        alert(
            "この時間に対応可能な講師がいません。"
        );

        return;

    }


    reservationForm.style.display =
        "block";


    reservationForm.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ==============================
// 予約確定
// ==============================

reservationSubmit.addEventListener(
    "click",
    async () => {

        const student =
            studentName.value.trim();


        const teacher =
            teacherSelect.value;


        const password =
            cancelPassword.value;


        // ==========================
        // 生徒名
        // ==========================

        if (!student) {

            alert(
                "生徒名を入力してください。"
            );

            return;

        }


        // ==========================
        // 講師
        // ==========================

        if (!teacher) {

            alert(
                "担当講師を選択してください。"
            );

            return;

        }


        // ==========================
        // 合言葉
        // ==========================

        if (!password) {

            alert(
                "キャンセル用合言葉を入力してください。"
            );

            return;

        }


        // ==========================
        // 対応不可チェック
        // ==========================

        try {

            const unavailableId =
                createUnavailableId(
                    selectedDate,
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
                    "この講師は現在、対応不可になっています。\n別の講師を選択してください。"
                );


                updateTeacherSelect(
                    selectedDate,
                    selectedTime
                );


                teacherSelect.value =
                    "";


                return;

            }


            // ==========================
            // 予約済みチェック
            // ==========================

            const reservationSnapshot =
                await getDoc(

                    doc(
                        db,
                        "reservations",
                        selectedId
                    )

                );


            if (
                reservationSnapshot.exists()
            ) {

                alert(
                    "この時間はすでに予約されています。"
                );


                reservationForm.style.display =
                    "none";


                return;

            }


            // ==========================
            // 合言葉ハッシュ化
            // ==========================

            const passwordHash =
                await hashPassword(
                    password
                );


            // ==========================
            // 最終確認
            // ==========================

            const confirmed =
                confirm(

                    `${selectedDate}\n` +

                    `${selectedTime}\n\n` +

                    `${student}さん\n` +

                    `${teacher}\n\n` +

                    "この内容で予約しますか？"

                );


            if (!confirmed) {

                return;

            }


            // ==========================
            // 予約保存
            // ==========================

            await setDoc(

                doc(
                    db,
                    "reservations",
                    selectedId
                ),

                {

                    date:
                        selectedDate,

                    time:
                        selectedTime,

                    student:
                        student,

                    teacher:
                        teacher,

                    cancelPasswordHash:
                        passwordHash,

                    createdAt:
                        new Date().toISOString()

                }

            );


            alert(
                "予約しました！"
            );


            reservationForm.style.display =
                "none";


            studentName.value =
                "";

            teacherSelect.value =
                "";

            cancelPassword.value =
                "";


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
);


// ==============================
// 日付変更
// ==============================

dateSelect.addEventListener(
    "change",
    () => {

        reservationForm.style.display =
            "none";


        selectedDate =
            "";


        selectedTime =
            "";


        selectedId =
            "";


        updateTeacherSelect(
            dateSelect.value,
            ""
        );

    }
);
```
