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


// Firebaseを起動
const app = initializeApp(firebaseConfig);


// Firestoreを使用
const db = getFirestore(app);


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
    new Date().toISOString().split("T")[0];

dateSelect.value = today;


// ==============================
// Firestore
// ==============================

const reservationsRef =
    collection(db, "reservations");


// ==============================
// 講師一覧
// ==============================

let teachers = [];


async function loadTeachers() {

    try {

        const teachersRef =
            collection(db, "teachers");

        const snapshot =
            await getDocs(teachersRef);


        teachers = [];


        snapshot.forEach((doc) => {

            const data =
                doc.data();


            if (data.name) {

                teachers.push(
                    data.name
                );

            }

        });


        // プルダウンを作成

        teacherSelect.innerHTML =
            '<option value="">講師を選択してください</option>';


        teachers.forEach((teacher) => {

            const option =
                document.createElement("option");


            option.value =
                teacher;


            option.textContent =
                `${teacher}`;


            teacherSelect.appendChild(
                option
            );

        });


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


// 講師を読み込む
loadTeachers();


// ==============================
// 現在選択している予約
// ==============================

let selectedDate = "";

let selectedTime = "";

let selectedId = "";


// ==============================
// 合言葉をハッシュ化
// ==============================

async function hashPassword(password) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(password);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(
            byte =>
                byte.toString(16).padStart(2, "0")
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


        snapshot.forEach((doc) => {

            const data =
                doc.data();


            reservations[doc.id] =
                data;

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


        // ==========================
        // 行を作成
        // ==========================

        const row =
            document.createElement("div");


        row.className =
            "reservation-row";


        // ==========================
        // 時間
        // ==========================

        const timeElement =
            document.createElement("div");


        timeElement.className =
            "time";


        timeElement.textContent =
            time;


        // ==========================
        // 講師
        // ==========================

        const teacherElement =
            document.createElement("div");


        teacherElement.className =
            "teacher";


        // ==========================
        // ボタン・状態
        // ==========================

        const actionElement =
            document.createElement("div");


        actionElement.className =
            "reservation-action";


        // ==========================
        // 予約済み
        // ==========================

        if (reservation) {

            teacherElement.textContent =
                `${reservation.teacher}`;


            const reserved =
                document.createElement("div");


            reserved.className =
                "reserved";


            reserved.textContent =
                "🔴 予約済み";


            actionElement.appendChild(
                reserved
            );


            // ==========================
            // キャンセルボタン
            // ==========================

            const cancelButton =
                document.createElement("button");


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
                document.createElement("button");


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


        // ==========================
        // 行に追加
        // ==========================

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

    });

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


    // ==========================
    // 合言葉を入力
    // ==========================

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

        // 入力された合言葉をハッシュ化

        const passwordHash =
            await hashPassword(password);


        // 保存されているハッシュと比較

        if (
            passwordHash !==
            reservation.cancelPasswordHash
        ) {

            alert(
                "合言葉が正しくありません。"
            );

            return;

        }


        // ==========================
        // 予約削除
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


    // 予約日時を表示

    reservationDateTime.textContent =
        `${date} ${time}`;


    // 入力欄をリセット

    studentName.value =
        "";

    teacherSelect.value =
        "";

    cancelPassword.value =
        "";


    // フォームを表示

    reservationForm.style.display =
        "block";


    // フォームまでスクロール

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
        // 生徒名チェック
        // ==========================

        if (!student) {

            alert(
                "生徒名を入力してください。"
            );

            return;

        }


        // ==========================
        // 講師チェック
        // ==========================

        if (!teacher) {

            alert(
                "担当講師を選択してください。"
            );

            return;

        }


        // ==========================
        // 合言葉チェック
        // ==========================

        if (!password) {

            alert(
                "キャンセル用合言葉を入力してください。"
            );

            return;

        }


        // ==========================
        // 合言葉をハッシュ化
        // ==========================

        const passwordHash =
            await hashPassword(password);


        // ==========================
        // 確認
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


        try {

            // ==========================
            // Firestoreに保存
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


            // フォームを閉じる

            reservationForm.style.display =
                "none";


            // 入力欄をリセット

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

        // フォームを閉じる

        reservationForm.style.display =
            "none";

    }
);
