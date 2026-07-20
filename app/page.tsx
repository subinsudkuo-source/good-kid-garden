"use client";

import { useEffect, useMemo, useState } from "react";

type LevelResult = { score: number; total: number };

const choiceQuestions = [
  {
    q: "ข้อใดคือสมาชิกในบ้าน",
    choices: ["พ่อ แม่ และลูก", "โต๊ะ เก้าอี้ และตู้", "ดินสอ ยางลบ และไม้บรรทัด"],
    answer: 0,
  },
  {
    q: "ครอบครัวที่มีพ่อ แม่ และลูก เรียกว่าอะไร",
    choices: ["ครอบครัวเดี่ยว", "ครอบครัวขยาย", "ครอบครัวเพื่อน"],
    answer: 0,
  },
  {
    q: "ถ้ามีปู่และย่าอาศัยอยู่ด้วย เรียกว่าอะไร",
    choices: ["ครอบครัวเดี่ยว", "ครอบครัวขยาย", "ครอบครัวโรงเรียน"],
    answer: 1,
  },
  {
    q: "ข้อใดเป็นหน้าที่ของลูก",
    choices: ["ตั้งใจเรียน", "เล่นเกมทั้งวัน", "ทิ้งของเล่นไว้บนพื้น"],
    answer: 0,
  },
  {
    q: "เมื่อรับประทานอาหารเสร็จ เด็กควรทำอย่างไร",
    choices: ["ลุกไปเล่นทันที", "ช่วยเก็บโต๊ะอาหาร", "ทิ้งจานไว้ให้ผู้อื่นเก็บ"],
    answer: 1,
  },
];

const trueFalse = [
  ["ลูกควรเคารพและเชื่อฟังพ่อแม่", true],
  ["เราควรทิ้งรองเท้าไว้กลางบ้าน", false],
  ["เด็ก ป.2 สามารถช่วยรดน้ำต้นไม้ได้", true],
  ["งานบ้านเป็นหน้าที่ของแม่เพียงคนเดียว", false],
  ["พี่น้องควรรักและช่วยเหลือกัน", true],
  ["เด็กควรตั้งใจเรียนและทำการบ้าน", true],
  ["เราควรใช้เงินอย่างประหยัด", true],
  ["เด็กสามารถเล่นของมีคมได้ตามลำพัง", false],
] as const;

const jobs = [
  ["กวาดบ้าน", true, "🧹"],
  ["ขับรถยนต์", false, "🚗"],
  ["พับเสื้อผ้า", true, "👕"],
  ["ซ่อมหลังคา", false, "🏠"],
  ["รดน้ำต้นไม้", true, "🪴"],
  ["เก็บของเล่น", true, "🧸"],
  ["จัดรองเท้า", true, "👟"],
  ["ใช้มีดหั่นอาหารตามลำพัง", false, "🔪"],
  ["ล้างจาน", true, "🍽️"],
  ["จัดเก็บที่นอน", true, "🛏️"],
] as const;

const wordAnswers = [
  "สมาชิกในบ้าน",
  "ครอบครัวเดี่ยว",
  "ครอบครัวขยาย",
  "รับผิดชอบ",
  "ประหยัด",
];

const openPrompts = [
  "หลังเล่นของเล่นเสร็จ หนูจะ...",
  "เมื่อเห็นคุณแม่กำลังเก็บโต๊ะอาหาร หนูจะ...",
  "ถ้าน้องทำของตก หนูจะ...",
  "เมื่อกลับจากโรงเรียน หนูจะวางรองเท้า...",
  "วันนี้หนูอยากช่วยงานบ้านอะไร...",
];

const bonusRiddles = [
  ["ใช้ไม้ยาว ๆ ทำให้พื้นสะอาด", "กวาดบ้าน"],
  ["ทำให้ต้นไม้ได้รับน้ำ", "รดน้ำต้นไม้"],
  ["ทำให้เสื้อผ้าเรียบร้อยก่อนเก็บ", "พับเสื้อผ้า"],
  ["ทำหลังจากกินอาหารเสร็จ", "ล้างจาน"],
  ["ทำให้ของเล่นไม่วางเกะกะ", "เก็บของเล่น"],
];

const weekly = [
  "จันทร์ — เก็บที่นอน",
  "อังคาร — จัดรองเท้า",
  "พุธ — รดน้ำต้นไม้",
  "พฤหัสบดี — เก็บของเล่น",
  "ศุกร์ — ช่วยเก็บโต๊ะอาหาร",
  "เสาร์ — พับเสื้อผ้า",
  "อาทิตย์ — เลือกช่วยงานบ้าน 1 อย่าง",
];

function normalize(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export default function Home() {
  const [name, setName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [number, setNumber] = useState("");
  const [level, setLevel] = useState(0);
  const [results, setResults] = useState<Record<number, LevelResult>>({});
  const [choice, setChoice] = useState<number[]>(Array(5).fill(-1));
  const [tf, setTf] = useState<(boolean | null)[]>(Array(8).fill(null));
  const [matches, setMatches] = useState(["", "", ""]);
  const [selectedJobs, setSelectedJobs] = useState<boolean[]>(Array(10).fill(false));
  const [words, setWords] = useState(["", "", "", "", ""]);
  const [openAnswers, setOpenAnswers] = useState(["", "", "", "", ""]);
  const [bonus, setBonus] = useState(["", "", "", "", ""]);
  const [weekDone, setWeekDone] = useState<boolean[]>(Array(7).fill(false));
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("good-kid-garden");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setName(data.name || "");
      setClassroom(data.classroom || "");
      setNumber(data.number || "");
      setResults(data.results || {});
      setWeekDone(data.weekDone || Array(7).fill(false));
    } catch {
      // เริ่มเกมใหม่ได้เสมอหากข้อมูลเดิมไม่สมบูรณ์
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "good-kid-garden",
      JSON.stringify({ name, classroom, number, results, weekDone }),
    );
  }, [name, classroom, number, results, weekDone]);

  const stars = Object.values(results).reduce((sum, item) => sum + item.score, 0);
  const maxStars = Object.values(results).reduce((sum, item) => sum + item.total, 0);
  const completed = Object.keys(results).length;
  const gardenStage = Math.min(6, completed);

  const levelNames = [
    "ประตูครอบครัว",
    "สะพานจริงหรือไม่",
    "บ้านจับคู่",
    "แปลงนักสืบ",
    "บ่อน้ำคำวิเศษ",
    "ศาลาเด็กดี",
  ];

  const encouragement = useMemo(() => {
    if (completed === 6) return "สุดยอด! สวนเด็กดีผลิบานแล้ว 🌈";
    if (completed >= 3) return "เก่งมาก! สวนกำลังสดใสขึ้นเรื่อย ๆ 🌻";
    return "เริ่มภารกิจ แล้วช่วยกันปลูกสวนให้ผลิบานนะ 🌱";
  }, [completed]);

  function finishLevel(score: number, total: number, text: string) {
    setResults((old) => ({ ...old, [level]: { score, total } }));
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  function checkCurrent() {
    if (level === 0) {
      const score = choice.reduce(
        (sum, value, i) => sum + (value === choiceQuestions[i].answer ? 1 : 0),
        0,
      );
      finishLevel(score, 5, score === 5 ? "ถูกทุกข้อ! ได้ดอกทานตะวัน 🌻" : `ทำได้ ${score}/5 ลองทบทวนแล้วเล่นอีกครั้งนะ`);
    }
    if (level === 1) {
      const score = tf.reduce(
        (sum, value, i) => sum + (value === trueFalse[i][1] ? 1 : 0),
        0,
      );
      finishLevel(score, 8, score === 8 ? "แม่นมาก! สะพานเปิดแล้ว 🌉" : `ถูก ${score}/8 ข้อ เก่งขึ้นอีกนิดแล้ว`);
    }
    if (level === 2) {
      const correct = ["ข", "ก", "ค"];
      const score = matches.filter((v, i) => v === correct[i]).length;
      finishLevel(score, 3, score === 3 ? "จับคู่ครบ! บ้านอบอุ่นขึ้นแล้ว 🏡" : `จับคู่ถูก ${score}/3 คู่`);
    }
    if (level === 3) {
      const score = selectedJobs.reduce(
        (sum, selected, i) => sum + (selected === jobs[i][1] ? 1 : 0),
        0,
      );
      finishLevel(score, 10, score === 10 ? "นักสืบยอดเยี่ยม! ได้เมล็ดพันธุ์ 🌱" : `สืบถูก ${score}/10 งาน`);
    }
    if (level === 4) {
      const score = words.filter((v, i) => v === wordAnswers[i]).length;
      finishLevel(score, 5, score === 5 ? "คำวิเศษครบ! น้ำพุทำงานแล้ว ⛲" : `เติมถูก ${score}/5 คำ`);
    }
    if (level === 5) {
      const score = openAnswers.filter((v) => v.trim().length >= 2).length;
      finishLevel(
        score,
        5,
        score === 5 ? "คำตอบน่ารักมาก! หนูคือฮีโร่ประจำบ้าน 🦸" : `ตอบแล้ว ${score}/5 ข้อ`,
      );
    }
  }

  function resetGame() {
    setResults({});
    setChoice(Array(5).fill(-1));
    setTf(Array(8).fill(null));
    setMatches(["", "", ""]);
    setSelectedJobs(Array(10).fill(false));
    setWords(["", "", "", "", ""]);
    setOpenAnswers(["", "", "", "", ""]);
    setBonus(["", "", "", "", ""]);
    setWeekDone(Array(7).fill(false));
    setLevel(0);
    setMessage("เริ่มปลูกสวนใหม่กันเลย! 🌱");
  }

  return (
    <main>
      <header className="hero">
        <div className="cloud cloud-one">☁️</div>
        <div className="cloud cloud-two">☁️</div>
        <div className="hero-copy">
          <span className="eyebrow">แบบฝึกหัดแสนสนุก ป.2</span>
          <h1>สวนภารกิจเด็กดี</h1>
          <p>เรื่อง สมาชิกในบ้านและการช่วยเหลืองานบ้าน</p>
        </div>
        <div className="sun" aria-hidden="true">☀️</div>
      </header>

      <section className="player-card" aria-label="ข้อมูลผู้เล่น">
        <label>
          ชื่อ
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เด็กเก่ง" />
        </label>
        <label>
          ชั้น
          <input value={classroom} onChange={(e) => setClassroom(e.target.value)} placeholder="ป.2/..." />
        </label>
        <label>
          เลขที่
          <input value={number} onChange={(e) => setNumber(e.target.value)} inputMode="numeric" placeholder="..." />
        </label>
        <div className="score-pill" aria-live="polite">
          ⭐ {stars} ดาว
        </div>
      </section>

      <section className="garden-map">
        <div className="garden-title">
          <div>
            <span className="section-kicker">แผนที่การผจญภัย</span>
            <h2>{encouragement}</h2>
          </div>
          <div className="progress-wrap">
            <span>ผ่านแล้ว {completed}/6 ด่าน</span>
            <div className="progress"><i style={{ width: `${(completed / 6) * 100}%` }} /></div>
          </div>
        </div>

        <div className="garden-scene" aria-label={`สวนเติบโตระดับ ${gardenStage}`}>
          <div className="house">🏡</div>
          <div className="garden-plants">
            {["🌱", "🌷", "🌻", "🌳", "🦋", "🌈"].map((plant, i) => (
              <span key={plant} className={i < gardenStage ? "grown" : "sleeping"}>
                {plant}
              </span>
            ))}
          </div>
        </div>

        <div className="level-path">
          {levelNames.map((item, i) => (
            <button
              key={item}
              className={`level-button ${level === i ? "active" : ""} ${results[i] ? "done" : ""}`}
              onClick={() => { setLevel(i); setMessage(""); }}
            >
              <span>{results[i] ? "✓" : i + 1}</span>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="game-card">
        <div className="level-heading">
          <div className="level-number">{level + 1}</div>
          <div>
            <span>ด่านที่ {level + 1}</span>
            <h2>{levelNames[level]}</h2>
          </div>
          {results[level] && (
            <div className="level-score">⭐ {results[level].score}/{results[level].total}</div>
          )}
        </div>

        {level === 0 && (
          <div className="questions">
            <p className="instruction">เลือกคำตอบที่ถูกต้อง เพื่อเปิดประตูเข้าสวน</p>
            {choiceQuestions.map((item, qi) => (
              <fieldset key={item.q} className="question-box">
                <legend><b>{qi + 1}.</b> {item.q}</legend>
                <div className="choice-grid">
                  {item.choices.map((answer, ai) => (
                    <label className={choice[qi] === ai ? "selected" : ""} key={answer}>
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={choice[qi] === ai}
                        onChange={() => setChoice((old) => old.map((v, i) => i === qi ? ai : v))}
                      />
                      <span>{["ก", "ข", "ค"][ai]}</span>{answer}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        {level === 1 && (
          <div>
            <p className="instruction">เรื่องนี้ “ใช่” หรือ “ไม่ใช่” เลือกให้สะพานแข็งแรง</p>
            <div className="tf-list">
              {trueFalse.map(([text], i) => (
                <div className="tf-row" key={text}>
                  <b>{i + 1}.</b><span>{text}</span>
                  <div>
                    <button className={tf[i] === true ? "yes active-answer" : "yes"} onClick={() => setTf((old) => old.map((v, n) => n === i ? true : v))}>✓ ใช่</button>
                    <button className={tf[i] === false ? "no active-answer" : "no"} onClick={() => setTf((old) => old.map((v, n) => n === i ? false : v))}>✗ ไม่ใช่</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {level === 2 && (
          <div>
            <p className="instruction">จับคู่สมาชิกกับหน้าที่ให้ถูกต้อง</p>
            <div className="match-answers">
              <p><b>ก.</b> เคารพพ่อแม่ ตั้งใจเรียน และช่วยงานบ้าน</p>
              <p><b>ข.</b> เลี้ยงดู อบรม และให้ความรักแก่ลูก</p>
              <p><b>ค.</b> ช่วยกันดูแลบ้านให้น่าอยู่</p>
            </div>
            {["พ่อและแม่", "ลูก", "สมาชิกทุกคน"].map((person, i) => (
              <label className="match-row" key={person}>
                <span>{["👨‍👩‍👧", "🧒", "🏠"][i]}</span>
                <b>{person}</b>
                <select value={matches[i]} onChange={(e) => setMatches((old) => old.map((v, n) => n === i ? e.target.value : v))}>
                  <option value="">เลือกคำตอบ</option>
                  <option value="ก">ก</option>
                  <option value="ข">ข</option>
                  <option value="ค">ค</option>
                </select>
              </label>
            ))}
          </div>
        )}

        {level === 3 && (
          <div>
            <p className="instruction">เลือกเฉพาะงานที่เด็ก ป.2 ช่วยทำได้อย่างปลอดภัย</p>
            <div className="job-grid">
              {jobs.map(([job, , icon], i) => (
                <label className={selectedJobs[i] ? "job selected" : "job"} key={job}>
                  <input
                    type="checkbox"
                    checked={selectedJobs[i]}
                    onChange={() => setSelectedJobs((old) => old.map((v, n) => n === i ? !v : v))}
                  />
                  <span>{icon}</span><b>{job}</b>
                </label>
              ))}
            </div>
          </div>
        )}

        {level === 4 && (
          <div>
            <p className="instruction">เลือกคำวิเศษเติมลงในช่องว่าง</p>
            <div className="word-bank">{wordAnswers.map((word) => <span key={word}>{word}</span>)}</div>
            {[
              "คนที่อาศัยอยู่ร่วมกันในบ้านเรียกว่า",
              "พ่อ แม่ และลูกอยู่ร่วมกันเรียกว่า",
              "ถ้ามีปู่ ย่า ตา หรือยายอาศัยอยู่ด้วยเรียกว่า",
              "การทำหน้าที่ของตนเองให้สำเร็จแสดงว่าเรามีความ",
              "เราควรใช้เงินอย่าง ... และรู้จักเก็บออม",
            ].map((text, i) => (
              <label className="fill-row" key={text}>
                <span><b>{i + 1}.</b> {text}</span>
                <select value={words[i]} onChange={(e) => setWords((old) => old.map((v, n) => n === i ? e.target.value : v))}>
                  <option value="">เลือกคำ</option>
                  {wordAnswers.map((word) => <option key={word}>{word}</option>)}
                </select>
              </label>
            ))}
          </div>
        )}

        {level === 5 && (
          <div>
            <p className="instruction">ถ้าเป็นหนู หนูจะทำอย่างไร? ไม่มีคำตอบผิด ขอให้ตอบจากใจนะ</p>
            <div className="open-list">
              {openPrompts.map((prompt, i) => (
                <label key={prompt}>
                  <span><b>{i + 1}.</b> {prompt}</span>
                  <textarea
                    value={openAnswers[i]}
                    onChange={(e) => setOpenAnswers((old) => old.map((v, n) => n === i ? e.target.value : v))}
                    placeholder="พิมพ์คำตอบของหนู..."
                    rows={2}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <button className="check-button" onClick={checkCurrent}>ตรวจคำตอบและรับดาว ⭐</button>
        {message && <div className="toast" role="status">{message}</div>}
      </section>

      <section className="extras">
        <article className="bonus-card">
          <span className="section-kicker">ด่านโบนัส</span>
          <h2>🔎 เกมใบ้คำงานบ้าน</h2>
          <p>อ่านคำใบ้ แล้วพิมพ์ชื่องานบ้าน</p>
          {bonusRiddles.map(([riddle, answer], i) => {
            const isCorrect = normalize(bonus[i]) === normalize(answer);
            return (
              <label key={riddle}>
                <span>{i + 1}. {riddle}</span>
                <div>
                  <input value={bonus[i]} onChange={(e) => setBonus((old) => old.map((v, n) => n === i ? e.target.value : v))} placeholder="คำตอบ..." />
                  {bonus[i] && <i>{isCorrect ? "✅" : "ลองอีกนิด 💡"}</i>}
                </div>
              </label>
            );
          })}
        </article>

        <article className="weekly-card">
          <span className="section-kicker">ภารกิจพิเศษ</span>
          <h2>⭐ เด็กดีประจำสัปดาห์</h2>
          <p>ทำสำเร็จแล้วกดดาวให้สว่าง</p>
          <div className="week-list">
            {weekly.map((task, i) => (
              <label key={task} className={weekDone[i] ? "complete" : ""}>
                <input type="checkbox" checked={weekDone[i]} onChange={() => setWeekDone((old) => old.map((v, n) => n === i ? !v : v))} />
                <span>{weekDone[i] ? "★" : "☆"}</span>{task}
              </label>
            ))}
          </div>
          <div className="week-score">คะแนนดาว {weekDone.filter(Boolean).length} / 7 ดวง</div>
        </article>
      </section>

      <section className="finish-card">
        <div className="trophy">{completed === 6 ? "🏆" : "🌱"}</div>
        <div>
          <span className="section-kicker">สมุดสะสมดาวของ {name || "เด็กเก่ง"}</span>
          <h2>{completed === 6 ? "พิชิตสวนภารกิจเด็กดีสำเร็จ!" : "ไปต่ออีกนิด สวนรอหนูอยู่นะ"}</h2>
          <p>เก็บได้ {stars} จาก {maxStars || 36} ดาว · ผ่าน {completed} จาก 6 ด่าน</p>
        </div>
        <button onClick={resetGame}>เล่นใหม่อีกครั้ง</button>
      </section>

      <footer>ทำหน้าที่ด้วยความรับผิดชอบ บ้านของเราก็อบอุ่นและน่าอยู่ 💚</footer>
    </main>
  );
}
