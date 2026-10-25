const RATE = 440;
const INCOME_RATE = 440;
const VAT = 1.18;
const SUMMARY_SHEET = "סיכום פיננסי";
const MONTHLY_SUMMARY_SHEET = "ריכוז חודשי";
const YEARLY_SUMMARY_SHEET = "ריכוז שנתי";
const INSTRUCTORS = ["אורית שטרית","מעיין זך","ענת דימנט","אמונה לנדאו","שרון שפירא","גליה דהן","ערן סעד"];
const SCHOOLS = ["יחדיו","שבילי רעות","רמת כרמים","סלעית","שדות","עלי זהב","חטיבה א","חטיבה ב","שש שנתי","אגף חינוך באר טוביה","ייעוץ לחינוך ישראלי"];
// שינויי שם של גופים: השם הישן -> השם החדש (מוחל על דיווחים מ-RENAME_START והלאה)
const SCHOOL_RENAMES = { "תיכון באר טוביה": "שש שנתי" };
const VISIBLE_HEADERS = ["מנחה","תאריך","גוף","פעילות","שעות"];
const ALL_HEADERS = ["מזהה","מנחה","תאריך","גוף","פעילות","שעות","חותמת זמן","סטטוס"];
const MONTH_NAMES = ["","ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const INSTRUCTOR_RATES = {
  "מעיין זך":    { rate: 280, vat: false },
  "ענת דימנט":   { rate: 260, vat: false },
  "אמונה לנדאו": { rate: 280, vat: true  },
  "שרון שפירא":  { rate: 280, vat: false },
  "גליה דהן":    { rate: 280, vat: false },
  "ערן סעד":     { rate: 280, vat: false }
};

// ====================================================
// פונקציית עזר: מפתח חודש מתאריך
// ====================================================
function getMonthKey(dateVal) {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, "0");
    return y + "-" + m;
  }
  const s = String(dateVal);
  if (s.length >= 7) return s.substring(0, 7);
  return "";
}

// ====================================================
// פונקציית עזר: נרמול תאריך למחרוזת YYYY-MM-DD נקייה
// (Sheets לפעמים ממיר תאריך שנכתב כטקסט לאובייקט Date אמיתי,
//  ואז getValues() מחזיר Date ולא את המחרוזת המקורית)
// ====================================================
function normalizeDateStr(dateVal) {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, "0");
    const d = String(dateVal.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(dateVal);
  // אם זו כבר מחרוזת ISO (עם או בלי שעה) - לקחת רק את חלק התאריך
  const match = s.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : s;
}

// ====================================================
// פונקציית עזר: שנת לימודים מתאריך (ספטמבר–אוגוסט)
// ====================================================
function getSchoolYear(dateVal) {
  if (!dateVal) return "";
  let d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1–12
  // ספטמבר (9) ואילך = שנה"ל הבאה
  if (m >= 9) return y + "-" + (y + 1);
  else        return (y - 1) + "-" + y;
}

// ====================================================
// איסוף כל הנתונים הפעילים
// ====================================================
function collectAllEntries() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entries = [];
  INSTRUCTORS.forEach(name => {
    const s = ss.getSheetByName(name);
    if (!s || s.getLastRow() < 2) return;
    const rows = s.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][7] !== "active") continue;
      entries.push({
        id:         String(rows[i][0]),
        instructor: rows[i][1],
        date:       rows[i][2],
        school:     rows[i][3],
        activity:   rows[i][4],
        hours:      parseFloat(rows[i][5]) || 0
      });
    }
  });
  return entries;
}

// ====================================================
// סיכום פיננסי כללי
// ====================================================
function updateFinancialSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SUMMARY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SUMMARY_SHEET);
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  }
  sheet.clear();
  sheet.setRightToLeft(true);

  const monthData = {};
  const allEntries = collectAllEntries(); // תמיד קורא מלשוניות המנחים - לא מושפע משינוי/ארכוב שם של גוף

  // הוצאות מנחים
  allEntries.forEach(en => {
    const rateInfo = INSTRUCTOR_RATES[en.instructor];
    if (!rateInfo) return;
    const hourlyRate = rateInfo.vat ? rateInfo.rate * VAT : rateInfo.rate;
    const monthKey = getMonthKey(en.date);
    if (!monthKey) return;
    if (!monthData[monthKey]) monthData[monthKey] = { income: 0, schoolIncome: {}, expenses: {} };
    monthData[monthKey].expenses[en.instructor] = (monthData[monthKey].expenses[en.instructor] || 0) + (en.hours * hourlyRate);
  });

  // הכנסות מגופים
  allEntries.forEach(en => {
    const monthKey = getMonthKey(en.date);
    if (!monthKey) return;
    if (!monthData[monthKey]) monthData[monthKey] = { income: 0, schoolIncome: {}, expenses: {} };
    const amount = en.hours * INCOME_RATE;
    monthData[monthKey].income += amount;
    monthData[monthKey].schoolIncome[en.school] = (monthData[monthKey].schoolIncome[en.school] || 0) + amount;
  });

  // כותרות — גופים + מנחים
  const finSchools = [...new Set([...SCHOOLS, ...allEntries.map(en => en.school).filter(Boolean)])];
  const numSchools = finSchools.length;
  const numInstructors = INSTRUCTORS.filter(n => INSTRUCTOR_RATES[n]).length;
  const totalCols = 1 + numSchools + 1 + numInstructors + 1 + 1; // חודש + גופים + סהכ הכנסות + מנחים + סהכ מנחים + רווח
  const instructorNames = INSTRUCTORS.filter(n => INSTRUCTOR_RATES[n]);
  const headers = ["חודש", ...finSchools, "סהכ הכנסות", ...instructorNames, "סהכ תשלומי מנחים", "רווח"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold").setBackground("#1a2a5e").setFontColor("#ffffff");
  sheet.getRange(1, 2, 1, numSchools).setBackground("#1565C0");
  sheet.getRange(1, 2 + numSchools + 1, 1, numInstructors).setBackground("#880E4F");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  const months = Object.keys(monthData).sort();
  let totalIncome = 0, totalExpenses = 0;

  months.forEach(mk => {
    const parts = mk.split("-");
    const monthName = MONTH_NAMES[parseInt(parts[1])] + " " + parts[0];
    const d = monthData[mk];
    const expenses = d.expenses;
    const totalExp = Object.values(expenses).reduce((s, v) => s + v, 0);
    const profit = d.income - totalExp;
    totalIncome += d.income;
    totalExpenses += totalExp;

    const si = d.schoolIncome || {};
    const row = [
      monthName,
      ...finSchools.map(s => "₪" + Math.round(si[s] || 0).toLocaleString()),
      "₪" + Math.round(d.income).toLocaleString(),
      ...instructorNames.map(n => "₪" + Math.round(expenses[n] || 0).toLocaleString()),
      "₪" + Math.round(totalExp).toLocaleString(),
      "₪" + Math.round(profit).toLocaleString()
    ];
    sheet.appendRow(row);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, headers.length)
      .setFontColor(profit >= 0 ? "#0a5c2e" : "#c00000").setFontWeight("bold");
  });

  // שורת סיכום
  const totalProfit = totalIncome - totalExpenses;
  const totalRow = ["סהכ", ...new Array(numSchools).fill(""),
    "₪" + Math.round(totalIncome).toLocaleString(),
    ...new Array(numInstructors).fill(""),
    "₪" + Math.round(totalExpenses).toLocaleString(),
    "₪" + Math.round(totalProfit).toLocaleString()
  ];
  sheet.appendRow(totalRow);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, headers.length).setBackground("#F0F4FF").setFontWeight("bold");

  // רוחב עמודות
  sheet.setColumnWidth(1, 110);
  for (let c = 2; c <= headers.length; c++) sheet.setColumnWidth(c, 120);
}

// ====================================================
// סלי שעות שנתיים (שנה"ל מספטמבר עד אוגוסט). null = ללא סל
// ====================================================
const INSTRUCTOR_BUDGET = {
  "מעיין זך":    180,
  "ענת דימנט":   180,
  "גליה דהן":    120,
  "שרון שפירא":  150,
  "אמונה לנדאו": 50,
  "ערן סעד":     40,
  "אורית שטרית": null
};
const SCHOOL_BUDGET = {
  "יחדיו":               120,
  "שבילי רעות":          180,
  "רמת כרמים":           130,
  "סלעית":               120,
  "שדות":                250,
  "עלי זהב":             100,
  "חטיבה א":             300,
  "חטיבה ב":             300,
  "שש שנתי":             130,
  "אגף חינוך באר טוביה": 250
};
const BUDGET_START = "2026-09"; // שעות לפני החודש הזה לא נספרות בסל
const RENAME_START = "2026-08"; // שינויי שם של גופים חלים על דיווחים מהחודש הזה
const BUDGET_SHEET = "סלים ויתרות";
const OBSOLETE_SHEETS = ["פירוט לפי גוף", "_נתונים"]; // לשוניות מגרסאות קודמות - נמחקות

// ====================================================
// הערות: לשונית "הערות" שאורית כותבת בה. הקוד אף פעם לא מוחק אותה,
// ומשלב את ההערות ב"סלים ויתרות" וב"ריכוז חודשי" בכל בנייה מחדש.
// עמודות: חודש | גוף / מנחה | הערה. חודש ריק = ההערה מופיעה בכל החודשים.
// ====================================================
const NOTES_SHEET = "הערות";

function noteMonthKey(v) {
  if (v === "" || v == null) return "";
  if (v instanceof Date) return getMonthKey(v);
  const t = String(v).trim();
  for (let i = 1; i <= 12; i++) {
    const m = t.match(new RegExp("^" + MONTH_NAMES[i] + "\\s*(\\d{4})$"));
    if (m) return m[1] + "-" + String(i).padStart(2, "0");
  }
  const n = t.match(/^(\d{1,2})[\/.\-](\d{4})$/);
  if (n) return n[2] + "-" + String(+n[1]).padStart(2, "0");
  return "?" + t; // לא זוהה - לא יוצג
}

// יוצרת את לשונית ההערות אם אינה קיימת, ומעדכנת את רשימות הבחירה (בלי לגעת בתוכן)
function ensureNotesSheet(ss, monthLabels, names) {
  let sh = ss.getSheetByName(NOTES_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NOTES_SHEET, Math.min(2, ss.getSheets().length));
    sh.setRightToLeft(true);
    sh.getRange(1, 1, 1, 4).setValues([["חודש", "גוף / מנחה", "הערה", "מזהה דיווח"]])
      .setFontWeight("bold").setBackground("#1a2a5e").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 130); sh.setColumnWidth(2, 180); sh.setColumnWidth(3, 450);
    sh.setColumnWidth(4, 120);
  }
  sh.getRange("A2:A500").setNumberFormat("@");
  if (monthLabels.length) sh.getRange("A2:A500").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(monthLabels, true).setAllowInvalid(true).build());
  sh.getRange("B2:B500").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(names, true).setAllowInvalid(true).build());
  return sh;
}

// קוראת את כל ההערות. מחזירה { of(חודש, שם), ofId(מזהה דיווח) }
function readNotes(sh) {
  const byKey = {}, byId = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(r => {
      const name = String(r[1]).trim(), text = String(r[2]).trim(), id = String(r[3]).trim();
      if (!text) return;
      if (id) { byId[id] = text; return; }
      if (!name) return;
      const key = noteMonthKey(r[0]) + "|" + name;
      (byKey[key] = byKey[key] || []).push(text);
    });
  }
  return {
    of: (mk, name) => (byKey[mk + "|" + name] || byKey["|" + name] || []).join(" · "),
    ofId: id => byId[id] || ""
  };
}

// שומרת הערה (מחליפה הערה קודמת לאותו מפתח). טקסט ריק = מחיקה.
function saveNote(mk, name, id, text) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(NOTES_SHEET) || ensureNotesSheet(ss, [], []);
  const n = sh.getLastRow() - 1;
  if (n > 0) {
    const vals = sh.getRange(2, 1, n, 4).getValues();
    for (let i = vals.length - 1; i >= 0; i--) {
      const r = vals[i], rid = String(r[3]).trim();
      const match = id ? rid === id
                       : (!rid && String(r[1]).trim() === name && noteMonthKey(r[0]) === mk);
      if (match) sh.deleteRow(i + 2);
    }
  }
  text = String(text == null ? "" : text).trim();
  if (text) sh.appendRow([mk ? monthLabelOf(mk) : "", name, text, id || ""]);
}

function monthLabelOf(mk) {
  const p = mk.split("-");
  return MONTH_NAMES[parseInt(p[1], 10)] + " " + p[0];
}

function toDateObj(dateVal) {
  if (dateVal instanceof Date) return new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
  const m = String(dateVal).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : dateVal;
}

// מחזירה לשונית ריקה בשם הנתון, באותו מיקום שבו הייתה
function freshSheet(ss, name, defaultIndex) {
  const old = ss.getSheetByName(name);
  let idx = defaultIndex;
  if (old) { idx = old.getIndex() - 1; ss.deleteSheet(old); SpreadsheetApp.flush(); }
  const sh = ss.insertSheet(name, Math.min(idx, ss.getSheets().length));
  sh.setRightToLeft(true);
  return sh;
}

// אזהרה כשמקלידים מחוץ לעמודת ההערות (שם הטקסט יימחק בבנייה הבאה)
function allowNotesOnly(sh, noteRanges) {
  try {
    const p = sh.protect().setDescription("נבנה אוטומטית - כותבים רק בעמודת הערות").setWarningOnly(true);
    p.setUnprotectedRanges(noteRanges);
  } catch (err) { Logger.log("protect: " + err); }
}

// צובעת רשימת שורות בבת אחת
function styleRows(sh, rowNums, firstCol, numCols, fn) {
  if (!rowNums.length) return;
  const a1 = rowNums.map(r => sh.getRange(r, firstCol, 1, numCols).getA1Notation());
  fn(sh.getRangeList(a1));
}

function updateMonthlySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entries = collectAllEntries().filter(e => getMonthKey(e.date));

  // ניקוי לשוניות ישנות
  const oldTab = new RegExp("^ריכוז (" + MONTH_NAMES.filter(Boolean).join("|") + ") \\d{4}$");
  ss.getSheets().forEach(sh => {
    if (oldTab.test(sh.getName()) || OBSOLETE_SHEETS.indexOf(sh.getName()) >= 0) ss.deleteSheet(sh);
  });

  const monthKeys = [...new Set(entries.map(e => getMonthKey(e.date)))].sort().reverse(); // החדש למעלה
  const allNames = [...new Set([...SCHOOLS, ...INSTRUCTORS, ...entries.map(e => e.school).filter(Boolean)])];
  const noteLabels = [...new Set([...monthKeys, getMonthKey(new Date())])].sort().reverse().map(monthLabelOf);
  const notes = readNotes(ensureNotesSheet(ss, noteLabels, allNames));

  const orderSchools = list => {
    const known = SCHOOLS.filter(s => list.indexOf(s) >= 0);
    return known.concat(list.filter(s => SCHOOLS.indexOf(s) < 0).sort());
  };

  // =========== טבלה 1: ריכוז חודשי — חודש ← גוף ← תאריכים ===========
  const t1 = [], t1Month = [], t1Head = [], t1School = [], t1Sub = [], t1Total = [];
  const W1 = 7; // F = הערות, G = מזהה דיווח (מוסתר)
  monthKeys.forEach(mk => {
    const label = monthLabelOf(mk);
    const monthEntries = entries.filter(e => getMonthKey(e.date) === mk);
    t1.push([label, "", "", "", "", "", ""]); t1Month.push(t1.length);
    t1.push(["תאריך", "מנחה", "פעילות", "שעות", "עלות", "הערות", ""]); t1Head.push(t1.length);
    let mHours = 0;
    orderSchools([...new Set(monthEntries.map(e => e.school))]).forEach(school => {
      const rows = monthEntries.filter(e => e.school === school)
        .sort((x, y) => toDateObj(x.date) - toDateObj(y.date));
      t1.push([school, "", "", "", "", notes.of(mk, school), ""]); t1School.push(t1.length);
      let h = 0;
      rows.forEach(e => { t1.push([toDateObj(e.date), e.instructor, e.activity, e.hours, "", notes.ofId(e.id), e.id]); h += e.hours; });
      t1.push(["סה״כ " + school, "", "", h, h * INCOME_RATE, "", ""]); t1Sub.push(t1.length);
      mHours += h;
    });
    t1.push(["סה״כ " + label, "", "", mHours, mHours * INCOME_RATE, "", ""]); t1Total.push(t1.length);
    t1.push(["", "", "", "", "", "", ""]);
  });

  const sh1 = freshSheet(ss, MONTHLY_SUMMARY_SHEET, 0);
  if (t1.length) {
    // עמודת התאריך: פורמט תאריך, אבל שורות כותרת החודש נשארות טקסט (אחרת "אוקטובר 2026" הופך לתאריך)
    sh1.getRange(1, 1, t1.length, 1).setNumberFormat("dd/MM/yyyy");
    styleRows(sh1, t1Month, 1, 1, r => r.setNumberFormat("@"));
    sh1.getRange(1, 1, t1.length, W1).setValues(t1);
    sh1.getRange(1, 5, t1.length, 1).setNumberFormat("₪#,##0");
    sh1.getRange(1, 6, t1.length, 1).setWrap(true);
    sh1.hideColumns(7);
    allowNotesOnly(sh1, [sh1.getRange(1, 6, t1.length + 200, 1)]);
    styleRows(sh1, t1Month, 1, W1, r => r.setBackground("#1a2a5e").setFontColor("#ffffff").setFontWeight("bold").setFontSize(12));
    styleRows(sh1, t1Head, 1, W1, r => r.setBackground("#E8EAF6").setFontColor("#1a2a5e").setFontWeight("bold"));
    styleRows(sh1, t1School, 1, W1, r => r.setBackground("#D9E1F2").setFontColor("#1a2a5e").setFontWeight("bold"));
    styleRows(sh1, t1Sub, 1, W1, r => r.setBackground("#F2F2F2").setFontWeight("bold"));
    styleRows(sh1, t1Total, 1, W1, r => r.setBackground("#1a2a5e").setFontColor("#ffffff").setFontWeight("bold"));
  }
  [[1,150],[2,140],[3,190],[4,70],[5,100],[6,260]].forEach(([c, w]) => sh1.setColumnWidth(c, w));

  // =========== טבלה 2: סלים ויתרות — לכל חודש: מנחים | גופים ===========
  const usedThrough = (mk, test) => {
    const yr = getSchoolYear(mk + "-01");
    return entries.filter(e => {
      const k = getMonthKey(e.date);
      return test(e) && k >= BUDGET_START && k <= mk && getSchoolYear(k + "-01") === yr;
    }).reduce((t, e) => t + e.hours, 0);
  };
  const sum = arr => arr.reduce((t, e) => t + e.hours, 0);

  const W2 = 12; // A-E מנחים (כולל הערה), F רווח, G-L גופים (כולל הערה)
  const t2 = [], t2Month = [], t2Head = [], t2Total = [];
  monthKeys.filter(mk => mk >= BUDGET_START).forEach(mk => {
    const label = monthLabelOf(mk);
    const monthEntries = entries.filter(e => getMonthKey(e.date) === mk);
    t2.push([label, "", "", "", "", "", "", "", "", "", "", ""]); t2Month.push(t2.length);
    t2.push(["מנחה", "שעות בחודש", "סל שנתי", "יתרה בסל", "הערות", "", "גוף", "שעות בחודש", "עלות בחודש", "סל שנתי", "יתרה בסל", "הערות"]);
    t2Head.push(t2.length);

    const instRows = INSTRUCTORS.map(n => {
      const h = sum(monthEntries.filter(e => e.instructor === n));
      const b = INSTRUCTOR_BUDGET[n];
      return [n, h, b == null ? "" : b, b == null ? "" : b - usedThrough(mk, e => e.instructor === n), notes.of(mk, n)];
    });
    const schoolNames = orderSchools([...new Set([...SCHOOLS, ...monthEntries.map(e => e.school).filter(Boolean)])]);
    const schoolRows = schoolNames.map(n => {
      const h = sum(monthEntries.filter(e => e.school === n));
      const b = SCHOOL_BUDGET[n];
      return [n, h, h * INCOME_RATE, b == null ? "" : b, b == null ? "" : b - usedThrough(mk, e => e.school === n), notes.of(mk, n)];
    });
    const n = Math.max(instRows.length, schoolRows.length);
    for (let i = 0; i < n; i++) {
      t2.push([...(instRows[i] || ["", "", "", "", ""]), "", ...(schoolRows[i] || ["", "", "", "", "", ""])]);
    }
    const ih = sum(monthEntries), sh = ih;
    t2.push(["סה״כ", ih, "", "", "", "", "סה״כ", sh, sh * INCOME_RATE, "", "", ""]); t2Total.push(t2.length);
    t2.push(["", "", "", "", "", "", "", "", "", "", "", ""]);
  });

  const sh2 = freshSheet(ss, BUDGET_SHEET, 1);
  if (t2.length) {
    sh2.getRange(1, 1, t2.length, 1).setNumberFormat("@"); // שם החודש נשאר טקסט
    sh2.getRange(1, 1, t2.length, W2).setValues(t2);
    const num = "#,##0.##;[Red]-#,##0.##";
    sh2.getRange(1, 2, t2.length, 3).setNumberFormat(num);
    sh2.getRange(1, 8, t2.length, 1).setNumberFormat(num);
    sh2.getRange(1, 9, t2.length, 1).setNumberFormat("₪#,##0");
    sh2.getRange(1, 10, t2.length, 2).setNumberFormat(num);
    sh2.getRange(1, 5, t2.length, 1).setWrap(true);
    sh2.getRange(1, 12, t2.length, 1).setWrap(true);
    allowNotesOnly(sh2, [sh2.getRange(1, 5, t2.length + 200, 1), sh2.getRange(1, 12, t2.length + 200, 1)]);
    styleRows(sh2, t2Month, 1, W2, r => r.setBackground("#1a2a5e").setFontColor("#ffffff").setFontWeight("bold").setFontSize(12));
    styleRows(sh2, t2Head, 1, W2, r => r.setBackground("#E8EAF6").setFontColor("#1a2a5e").setFontWeight("bold"));
    styleRows(sh2, t2Total, 1, W2, r => r.setBackground("#F2F2F2").setFontWeight("bold"));
    styleRows(sh2, t2Head.concat(t2Total), 6, 1, r => r.setBackground("#ffffff"));
  }
  [[1,140],[2,85],[3,70],[4,75],[5,220],[6,25],[7,170],[8,85],[9,95],[10,70],[11,75],[12,220]].forEach(([c, w]) => sh2.setColumnWidth(c, w));
}

// ====================================================
// ריכוז שנתי — לשונית אחת לכל שנת לימודים
// ====================================================
function updateYearlySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entries = collectAllEntries();

  // קבץ לפי שנת לימודים
  const byYear = {};
  entries.forEach(e => {
    const yr = getSchoolYear(e.date);
    if (!yr) return;
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(e);
  });

  const years = Object.keys(byYear).sort();

  years.forEach(yr => {
    const sheetName = "שנתי " + yr;

    const old = ss.getSheetByName(sheetName);
    if (old) ss.deleteSheet(old);
    SpreadsheetApp.flush();
    const sheet = ss.insertSheet(sheetName);
    sheet.setRightToLeft(true);

    // כותרות
    const headers = ["חודש", "מנחה", "גוף", "פעילות", "שעות"];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, 5)
      .setFontWeight("bold").setBackground("#1a2a5e").setFontColor("#ffffff");
    sheet.setFrozenRows(1);

    // מיון: חודש → מנחה
    const rows = byYear[yr].sort((a, b) => {
      const ma = getMonthKey(a.date), mb = getMonthKey(b.date);
      if (ma !== mb) return ma < mb ? -1 : 1;
      if (a.instructor < b.instructor) return -1;
      if (a.instructor > b.instructor) return 1;
      return 0;
    });

    let currentMonth = "";
    let monthHours = 0;
    let grandTotal = 0;

    rows.forEach(r => {
      const mk = getMonthKey(r.date);
      const parts = mk.split("-");
      const monthLabel = MONTH_NAMES[parseInt(parts[1])] + " " + parts[0];

      // שורת סיכום לחודש קודם
      if (currentMonth && mk !== currentMonth) {
        const cp = currentMonth.split("-");
        const cLabel = MONTH_NAMES[parseInt(cp[1])] + " " + cp[0];
        sheet.appendRow(["סהכ " + cLabel, "", "", "", monthHours]);
        const lr = sheet.getLastRow();
        sheet.getRange(lr, 1, 1, 5).setBackground("#D9E1F2").setFontWeight("bold").setFontColor("#1a2a5e");
        monthHours = 0;
      }

      currentMonth = mk;
      monthHours += r.hours;
      grandTotal += r.hours;

      let dateStr = r.date;
      if (r.date instanceof Date) {
        dateStr = String(r.date.getDate()).padStart(2,"0") + "/" +
                  String(r.date.getMonth()+1).padStart(2,"0");
      }
      sheet.appendRow([monthLabel, r.instructor, r.school, r.activity, r.hours]);

      const lr = sheet.getLastRow();
      if (lr % 2 === 0) sheet.getRange(lr, 1, 1, 5).setBackground("#F8F9FF");
    });

    // סיכום חודש אחרון
    if (currentMonth) {
      const cp = currentMonth.split("-");
      const cLabel = MONTH_NAMES[parseInt(cp[1])] + " " + cp[0];
      sheet.appendRow(["סהכ " + cLabel, "", "", "", monthHours]);
      const lr = sheet.getLastRow();
      sheet.getRange(lr, 1, 1, 5).setBackground("#D9E1F2").setFontWeight("bold").setFontColor("#1a2a5e");
    }

    // סיכום שנתי
    sheet.appendRow(["סהכ שנה״ל " + yr, "", "", "", grandTotal]);
    const lr = sheet.getLastRow();
    sheet.getRange(lr, 1, 1, 5).setBackground("#1a2a5e").setFontColor("#ffffff").setFontWeight("bold");

    // רוחב עמודות
    sheet.setColumnWidth(1, 130);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 80);
  });
}

// ====================================================
// עדכון כל הסיכומים יחד
// ====================================================
function updateAllSummaries() {
  applySchoolRenames();
  updateFinancialSummary();
  updateMonthlySummary();
  updateYearlySummary();
}

// ====================================================
// שינוי שם גוף: משנה את שם הלשונית ואת שם הגוף בדיווחים
// מאוגוסט 2026 (RENAME_START). דיווחים ישנים יותר נשארים בשמם.
// בטוח להריץ שוב ושוב - אם אין מה לשנות, לא קורה כלום.
// ====================================================
function applySchoolRenames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SCHOOL_RENAMES).forEach(oldName => {
    const newName = SCHOOL_RENAMES[oldName];
    const oldSheet = ss.getSheetByName(oldName);
    if (oldSheet && !ss.getSheetByName(newName)) oldSheet.setName(newName);
    [...INSTRUCTORS, newName].forEach(sheetName => {
      const sh = ss.getSheetByName(sheetName);
      if (!sh || sh.getLastRow() < 2) return;
      const vals = sh.getRange(2, 3, sh.getLastRow() - 1, 2).getValues(); // תאריך, גוף
      vals.forEach((r, i) => {
        if (r[1] === oldName && getMonthKey(r[0]) >= RENAME_START) {
          sh.getRange(i + 2, 4).setValue(newName);
        }
      });
    });
  });
}

// ====================================================
// שאר הפונקציות (ללא שינוי)
// ====================================================
function appendWithMonthlySummary(sheet, row, dateVal) {
  const newMonth = getMonthKey(dateVal);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const rows = sheet.getDataRange().getValues();
    let lastMonth = "";
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][7] !== "active") continue;
      lastMonth = getMonthKey(rows[i][2]);
      if (lastMonth) break;
    }
    if (lastMonth && newMonth && newMonth !== lastMonth) {
      addMonthlySummary(sheet, lastMonth);
    }
  }

  sheet.appendRow(row);
}

function addMonthlySummary(sheet, monthKey) {
  const rows = sheet.getDataRange().getValues();
  let total = 0;
  for (let i = 1; i < rows.length; i++) {
    if (getMonthKey(rows[i][2]) === monthKey && rows[i][7] === "active") {
      total += parseFloat(rows[i][5]) || 0;
    }
  }
  const parts = monthKey.split("-");
  const monthNum = parseInt(parts[1]);
  const monthName = (MONTH_NAMES[monthNum] || "") + " " + parts[0];
  const summaryRow = ["", "", monthName, "סהכ", "", total, "", "summary"];
  sheet.appendRow(summaryRow);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, 8)
    .setBackground("#F0F4FF")
    .setFontWeight("bold")
    .setFontColor("#1a2a5e");
}

function setupSheet(sheet, headerColor) {
  if (!sheet) return;
  headerColor = headerColor || "#2B4BAA";
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ALL_HEADERS);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground(headerColor).setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  sheet.setRightToLeft(true);
  sheet.hideColumns(1);
  sheet.hideColumns(7);
  sheet.hideColumns(8);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 80);
  return sheet;
}

function getOrCreateSheet(name, headerColor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    setupSheet(sheet, headerColor);
  }
  return sheet;
}

function ensureAllSheets() {
  INSTRUCTORS.forEach(i => getOrCreateSheet(i, "#C2185B"));
  SCHOOLS.forEach(s => getOrCreateSheet(s, "#1565C0"));
}

// ====================================================
// הרצה חד-פעמית לתחילת שנה"ל תשפ"ז:
// מעבירה לארכיון (משנה שם) את הגיליונות הישנים של גופים
// שחוזרים באותו שם השנה, כדי שהנתונים החדשים יתחילו בגיליון
// נקי ולא יתערבבו עם הנתונים הישנים. אגף חינוך באר טוביה
// לא מוזז - הוא ממשיך לצבור נתונים ברצף כרגיל.
// יש להריץ פעם אחת מעורך ה-Apps Script (Run > archiveSchoolsForNewYear)
// ====================================================
function archiveSchoolsForNewYear() {
  const namesToArchive = ["סלעית", "שבילי רעות", "יחדיו", "עלי זהב", "תיכון באר טוביה", "ייעוץ לחינוך ישראלי"];
  const noLongerActive = ["רמת כרמים", "נתיבות"];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const archived = [];
  const skipped = [];
  namesToArchive.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) { skipped.push(name + " (לא נמצא)"); return; }
    const newName = name + " (עד תשפ\"ו)";
    if (ss.getSheetByName(newName)) { skipped.push(name + " (כבר קיים ארכיון בשם הזה)"); return; }
    sheet.setName(newName);
    sheet.hideSheet(); // מסתיר את הלשונית הישנה מהתצוגה כדי לשמור על סרגל לשוניות נקי
    archived.push(name + " -> " + newName + " (מוסתר)");
  });
  noLongerActive.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) { skipped.push(name + " (לא נמצאה לשונית בשם הזה בדיוק)"); return; }
    if (!sheet.isSheetHidden()) { sheet.hideSheet(); archived.push(name + " (מוסתר, לא פעיל יותר)"); }
    else { skipped.push(name + " (כבר הייתה מוסתרת)"); }
  });
  Logger.log("--- כל שמות הלשוניות הקיימות בגיליון ---");
  Logger.log(ss.getSheets().map(s => s.getName() + (s.isSheetHidden() ? " [מוסתר]" : "")).join("\n"));
  Logger.log("הועברו לארכיון/הוסתרו:\n" + archived.join("\n"));
  if (skipped.length) Logger.log("דולגו:\n" + skipped.join("\n"));
  ensureAllSheets(); // יוצר גיליונות חדשים ונקיים וגלויים לכל גופי תשפ"ז
  SpreadsheetApp.flush();
  reorderTabs(); // מסדרת את הלשוניות: גופים, מנחים, ריכוזים, ואז השאר
  return { archived, skipped };
}

// ====================================================
// מסדרת את סדר הלשוניות בתחתית הגיליון: קודם לשוניות
// הריכוז הכוללות (חודשי, שנתי, פיננסי), אחר כך הגופים
// המלווים (לפי הסדר ב-SCHOOLS), ואז המנחים (לפי הסדר
// ב-INSTRUCTORS). כל לשונית אחרת (כולל ארכיון מוסתר) עוברת לסוף.
// אפשר להריץ בכל עת כדי לסדר מחדש.
// ====================================================
function reorderTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const desiredOrder = [].concat([MONTHLY_SUMMARY_SHEET, BUDGET_SHEET, NOTES_SHEET, YEARLY_SUMMARY_SHEET, SUMMARY_SHEET], SCHOOLS, INSTRUCTORS);
  let pos = 1;
  desiredOrder.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) { ss.setActiveSheet(sheet); ss.moveActiveSheet(pos); pos++; }
  });
  const remaining = ss.getSheets().filter(sh => desiredOrder.indexOf(sh.getName()) === -1);
  remaining.sort((a, b) => a.getName().localeCompare(b.getName(), "he"));
  remaining.forEach(sh => { ss.setActiveSheet(sh); ss.moveActiveSheet(pos); pos++; });
}

// ====================================================
// ניקוי חד-פעמי: מוחקת לשוניות ריכוז ישנות שנוצרו לפי
// חודש בנפרד (למשל "ריכוז ינואר 2026"), לפני שעברנו ללשונית
// מאוחדת אחת "ריכוז חודשי". הנתונים בהן נגזרים מהדיווחים
// עצמם ולא מקוריים, ולכן בטוח למחוק - הם ייבנו מחדש
// אוטומטית בלשונית המאוחדת. יש להריץ פעם אחת (Run > cleanupOldMonthlyTabs).
// ====================================================
function cleanupOldMonthlyTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const deleted = [];
  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    if (name.indexOf("ריכוז ") === 0 && name !== MONTHLY_SUMMARY_SHEET && name !== YEARLY_SUMMARY_SHEET) {
      ss.deleteSheet(sheet);
      deleted.push(name);
    }
  });
  Logger.log("נמחקו לשוניות ריכוז ישנות:\n" + deleted.join("\n"));
  SpreadsheetApp.flush();
  updateAllSummaries(); // בונה מחדש את "ריכוז חודשי" ו"ריכוז שנתי" הנכונים
  SpreadsheetApp.flush();
  reorderTabs();
  return deleted;
}

function doGet(e) {
  try {
    if (e.parameter && e.parameter.action === "save") {
      const data = {
        id:         e.parameter.id,
        instructor: e.parameter.instructor,
        date:       e.parameter.date,
        school:     e.parameter.school,
        activity:   e.parameter.activity,
        hours:      parseFloat(e.parameter.hours),
        ts:         e.parameter.ts
      };
      ensureAllSheets();
      const row = [data.id, data.instructor, data.date, data.school, data.activity, data.hours, data.ts, "active"];
      const instSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.instructor);
      if (instSheet) appendWithMonthlySummary(instSheet, row, data.date);
      const schoolSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.school);
      if (schoolSheet) appendWithMonthlySummary(schoolSheet, row, data.date);
      updateAllSummaries();
      return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
    }

    if (e.parameter && e.parameter.action === "delete") {
      const id = e.parameter.id;
      const instructor = e.parameter.instructor;
      const school = e.parameter.school;
      [instructor, school].forEach(sheetName => {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet || sheet.getLastRow() < 2) return;
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][7] === "summary") continue;
          if (String(rows[i][0]) === String(id)) {
            sheet.deleteRow(i+1);
            break;
          }
        }
      });
      updateAllSummaries();
      return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const allRows = [];
    INSTRUCTORS.forEach(name => {
      const s = ss.getSheetByName(name);
      if (!s || s.getLastRow() < 2) return;
      const rows = s.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) allRows.push(rows[i]);
    });
    const entries = [];
    allRows.forEach(row => {
      if (row[7] === "active") {
        entries.push({
          id:         String(row[0]),
          instructor: row[1],
          date:       normalizeDateStr(row[2]),
          school:     row[3],
          activity:   row[4],
          hours:      row[5],
          ts:         row[6]
        });
      }
    });
    return ContentService.createTextOutput(JSON.stringify({success:true,entries})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let data;
    try { data = JSON.parse(e.postData.contents); }
    catch(_) { data = JSON.parse(e.parameter.data); }

    ensureAllSheets();

    if (data.action === "delete") {
      [data.instructor, data.school].forEach(sheetName => {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) return;
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === String(data.id)) {
            sheet.getRange(i+1,8).setValue("deleted");
            break;
          }
        }
      });
    } else {
      const row = [data.id, data.instructor, data.date, data.school, data.activity, data.hours, data.ts, "active"];
      const instSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.instructor);
      if (instSheet) appendWithMonthlySummary(instSheet, row, data.date);
      const schoolSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.school);
      if (schoolSheet) appendWithMonthlySummary(schoolSheet, row, data.date);
      updateAllSummaries();
    }

    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function resetFinancialSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const old = ss.getSheetByName(SUMMARY_SHEET);
  if (old) ss.deleteSheet(old);
  INSTRUCTORS.forEach(name => {
    const s = ss.getSheetByName(name);
    if (!s || s.getLastRow() < 2) return;
    const rows = s.getDataRange().getValues();
    for (let i = rows.length - 1; i >= 1; i--) {
      if (!rows[i][0] && !rows[i][1] && !rows[i][5]) {
        s.deleteRow(i + 1);
      }
    }
  });
  updateAllSummaries();
}

// ====================================================
// ליווי שוטף: שעות קבועות בכל חודש לכל גוף, על שם אורית
// נרשמות ב-1 לכל חודש, כדי שיופיעו בריכוז ובתזרים כבר מתחילת החודש.
// השעות יורדות מהסל של הגוף. בטוח להריץ שוב: מה שכבר נרשם לא יירשם פעמיים.
// הפעלה חד-פעמית: Run > setupMonthlyFixedTrigger, ואז Run > addFixedHoursOctober2026
// ====================================================
const MONTHLY_FIXED = {
  instructor: "אורית שטרית",
  activity:   "ליווי שוטף",
  // גוף: מספר שעות בחודש (שש שנתי, רמת כרמים וייעוץ לחינוך ישראלי לא נכללים)
  schools: {
    "סלעית":               2,
    "שדות":                2,
    "עלי זהב":             2,
    "חטיבה א":             2,
    "חטיבה ב":             2,
    "אגף חינוך באר טוביה": 4,
    "יחדיו":               2,
    "שבילי רעות":          2
  }
};

// רצה כל בוקר; רושמת פעם אחת בחודש (ב-1 לחודש, או ביום הראשון שבו הריצה הצליחה).
// אחרי שחודש נרשם הוא מסומן, כך שאם מוחקים דיווח קבוע של גוף מסוים, הוא לא יחזור.
function monthlyFixedDaily() {
  const mk = getMonthKey(new Date());
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty("fixed-done-" + mk)) return;
  addMonthlyFixedHoursFor(mk);
}

// מוסיפה את ליווי שוטף לחודש נתון ("2026-10"), בתאריך ה-1 לחודש
function addMonthlyFixedHoursFor(mk) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dateStr = mk + "-01";
  const instSheet = ss.getSheetByName(MONTHLY_FIXED.instructor);
  if (!instSheet) return;
  const existing = instSheet.getLastRow() > 1
    ? instSheet.getRange(2, 1, instSheet.getLastRow() - 1, 1).getValues().map(r => String(r[0]))
    : [];
  let added = 0;
  Object.keys(MONTHLY_FIXED.schools).forEach(school => {
    const id = "fixed-" + mk + "-" + school;
    if (existing.indexOf(id) >= 0) return;
    const row = [id, MONTHLY_FIXED.instructor, dateStr, school, MONTHLY_FIXED.activity, MONTHLY_FIXED.schools[school], Date.now(), "active"];
    appendWithMonthlySummary(instSheet, row, dateStr);
    const schoolSheet = ss.getSheetByName(school);
    if (schoolSheet) appendWithMonthlySummary(schoolSheet, row, dateStr);
    added++;
  });
  PropertiesService.getScriptProperties().setProperty("fixed-done-" + mk, "1");
  if (added) updateAllSummaries();
  Logger.log("ליווי שוטף " + mk + ": נוספו " + added + " דיווחים");
}

// הפעלה חד-פעמית: יוצרת את ההפעלה האוטומטית היומית (מחליפה הפעלה קודמת אם קיימת)
function setupMonthlyFixedTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "monthlyFixedDaily")
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("monthlyFixedDaily").timeBased().everyDays(1).atHour(6)
    .inTimezone("Asia/Jerusalem").create();
}

// להשלמת אוקטובר 2026 (פעם אחת): Run > addFixedHoursOctober2026
function addFixedHoursOctober2026() { addMonthlyFixedHoursFor("2026-10"); }

// ====================================================
// עדכון אוטומטי כשכותבים בלשונית "הערות" בגיליון
// ====================================================
function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet(), name = sh.getName();
  if (name === NOTES_SHEET) {
    if (e.range.getRow() < 2) return;
    updateMonthlySummary(); // בונה מחדש עם ההערות
    sh.activate(); e.range.activate();
    return;
  }
  if (name !== MONTHLY_SUMMARY_SHEET && name !== BUDGET_SHEET) return;
  const col = e.range.getColumn(), noteCols = name === BUDGET_SHEET ? [5, 12] : [6];
  if (noteCols.indexOf(col) < 0) return;
  const values = e.range.getValues();
  for (let i = 0; i < values.length; i++) captureNote(sh, e.range.getRow() + i, col, values[i][0]);
}

// שומרת הערה שהוקלדה ישירות בטבלה, לפי השורה שבה נכתבה
function captureNote(sh, row, col, text) {
  const colA = sh.getRange(1, 1, row, 1).getValues();
  let mk = "";
  for (let r = row - 1; r >= 0 && !mk; r--) {           // החודש: כותרת החודש הקרובה מעל
    const k = noteMonthKey(colA[r][0]);
    if (k && k[0] !== "?") mk = k;
  }
  if (!mk) return;
  if (sh.getName() === BUDGET_SHEET) {
    const who = String(sh.getRange(row, col === 5 ? 1 : 7).getValue()).trim();
    if (!who || ["מנחה", "גוף", "סה״כ"].indexOf(who) >= 0) return;
    saveNote(mk, who, "", text);
    return;
  }
  // ריכוז חודשי
  const id = String(sh.getRange(row, 7).getValue()).trim();
  if (id) { saveNote(mk, "", id, text); return; }       // הערה על דיווח מסוים
  let school = String(colA[row - 1][0]).trim();
  if (school.indexOf("סה״כ ") === 0) school = school.slice(5);
  if (SCHOOLS.indexOf(school) < 0 && !school) return;
  if (["תאריך"].indexOf(school) >= 0 || noteMonthKey(school)[0] !== "?") return;
  saveNote(mk, school, "", text);                        // הערה על הגוף באותו חודש
}

// תפריט בגיליון: "דיווחי שעות" > "עדכון הטבלאות"
function onOpen() {
  SpreadsheetApp.getUi().createMenu("דיווחי שעות")
    .addItem("עדכון הטבלאות", "updateAllSummaries")
    .addToUi();
}
