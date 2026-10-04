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


// ==============================
// Firebase起動
// ==============================

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


// ==============================
// HTML要素
// ==============================

const board =
    document.getElementById("reservationBoard");

const status =
    document.getElementById("connectionStatus");

const dateSelect =
    document.getElementById("dateSelect");

const reservationForm =
    document.getElementById("reservationForm");

const reservationDateTime =
    document.getElementById("reservationDateTime");

const studentName =
    document.getElementById("studentName");

const teacherSelect =
    document.getElementById("teacherSelect");

const cancelPassword =
    document.getElementById("cancelPassword");

const reservationSubmit =
    document.getElementById("reservationSubmit");


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

    return year + "-" +
        month + "-" +
        day;
}


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


// ==============================
// データ
// ==============================

let teachers = [];

let reservations = {};

let unavailableSlots = {};


// ==============================
// 現在選択している予約
// ==============================

let selectedDate = "";

let selectedTime = "";

let selectedId = "";


// ==============================
// 対応不可データID
// ==============================

function createUnavailableId(
    date,
    time,
    teacher
) {

    return date + "_" +
        time.replace(":", "") + "_" +
        encodeURIComponent(teacher);
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
            function(byte) {

                return byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    );

            }
        )
        .join("");
}


// ==============================
// 管理人、副官一覧取得
// ==============================

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

        updateTeacherSelect(
            selectedDate,
            selectedTime
        );

        console.log(
            "管理人、副官一覧:",
            teachers
        );

    } catch (error) {

        console.error(
            "管理人、副官取得エラー:",
            error
        );

    }
}


loadTeachers();


// ==============================
// 予約データ監視
// ==============================

onSnapshot(

    reservationsRef,

    function(snapshot) {

        reservations = {};

        snapshot.forEach(
            function(document) {

                reservations[
                    document.id
                ] = document.data();

            }
        );


        renderBoard(
            dateSelect.value
        );


        status.textContent =
            "● リアルタイム接続中";

    },

    function(error) {

        console.error(
            "Firestore読み込みエラー:",
            error
        );

        status.textContent =
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


        renderBoard(
            dateSelect.value
        );


        updateTeacherSelect(
            selectedDate,
            selectedTime
        );

    },

    function(error) {

        console.error(
            "対応不可データ読み込みエラー:",
            error
        );

    }
);


// ==============================
// 掲示板表示
// ==============================

function renderBoard(
    date
) {

    board.innerHTML = "";


    timeSlots.forEach(
        function(time) {

            const id =
                date + "_" +
                time.replace(":", "");


            const reservation =
                reservations[id];


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "reservation-row";


            // ======================
            // 時間
            // ======================

            const timeElement =
                document.createElement(
                    "div"
                );

            timeElement.className =
                "time";

            timeElement.textContent =
                time;


            // ======================
            // 管理人、副官
            // ======================

            const teacherElement =
                document.createElement(
                    "div"
                );

            teacherElement.className =
                "teacher";


            // ======================
            // 操作
            // ======================

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
                    reservation.teacher;


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
                    function() {

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
                    function() {

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
// 管理人、副官選択欄更新
// ==============================

function updateTeacherSelect(
    date,
    time
) {

    if (!teacherSelect) {

        return;

    }


    teacherSelect.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value =
        "";

    defaultOption.textContent =
        "管理人、副官を選択してください";


    teacherSelect.appendChild(
        defaultOption
    );


    // 日付・時間がまだ決まっていない場合
    if (
        !date ||
        !time
    ) {

        teachers.forEach(
            function(teacher) {

                addTeacherOption(
                    teacher
                );

            }
        );

        return;
    }


    // ==========================
    // 対応可能な管理人、副官だけ表示
    // ==========================

    teachers.forEach(
        function(teacher) {

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
// 管理人、副官を選択欄に追加
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

            reservation.date + "\n" +

            reservation.time + "\n\n" +

            reservation.student +
            "さん\n" +

            reservation.teacher +
            "\n\n" +

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
        date + " " + time;


    studentName.value =
        "";

    teacherSelect.value =
        "";

    cancelPassword.value =
        "";


    updateTeacherSelect(
        date,
        time
    );


    // ==========================
    // 対応可能な管理人、副官がいない
    // ==========================

    if (
        teacherSelect.options.length <= 1
    ) {

        alert(
            "この時間に対応可能な管理人、副官がいません。"
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
    async function() {

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
        // 管理人、副官
        // ==========================

        if (!teacher) {

            alert(
                "担当管理人、副官を選択してください。"
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


        try {

            // ==========================
            // 対応不可チェック
            // ==========================

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
                    "この管理人、副官は現在、対応不可になっています。\n別の管理人、副官を選択してください。"
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

                    selectedDate + "\n" +

                    selectedTime + "\n\n" +

                    student + "さん\n" +

                    teacher + "\n\n" +

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
    function() {

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


        renderBoard(
            dateSelect.value
        );

    }
);
