const RATE = 440;
const INCOME_RATE = 440;
const VAT = 1.18;
const SUMMARY_SHEET = "סיכום פיננסי";
const MONTHLY_SUMMARY_SHEET = "ריכוז חודשי";
const YEARLY_SUMMARY_SHEET = "ריכוז שנתי";
const INSTRUCTORS = ["אורית שטרית","מעיין זך","ענת דימנט","אמונה לנדאו","שרון שפירא","גליה דהן"];
const SCHOOLS = ["סלעית","רמת כרמים","שבילי רעות","יחדיו","נתיבות","עלי זהב","אגף חינוך באר טוביה","תיכון באר טוביה","שדות- באר טוביה","ייעוץ לחינוך ישראלי"];
const VISIBLE_HEADERS = ["מנחה","תאריך","גוף","פעילות","שעות"];
const ALL_HEADERS = ["מזהה","מנחה","תאריך","גוף","פעילות","שעות","חותמת זמן","סטטוס"];
const MONTH_NAMES = ["","ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const INSTRUCTOR_RATES = {
  "מעיין זך":    { rate: 280, vat: false },
  "ענת דימנט":   { rate: 280, vat: false },
  "אמונה לנדאו": { rate: 280, vat: true  },
  "שרון שפירא":  { rate: 280, vat: false },
  "גליה דהן":    { rate: 280, vat: false }
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
// פונקציית עזר: שנת לימודים מתאריך (ספטמבר–אוגוסט)
// ====================================================
function getSchoolYear(dateVal) {
  if (!dateVal) return "";
  let d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1–12
  // ספטמבר (9) ואילך = שנה"ל הבאה
  if (m >= 8) return y + "-" + (y + 1);
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

  // הוצאות מנחים
  INSTRUCTORS.forEach(name => {
    const iSheet = ss.getSheetByName(name);
    if (!iSheet || iSheet.getLastRow() < 2) return;
    const rows = iSheet.getDataRange().getValues();
    const rateInfo = INSTRUCTOR_RATES[name];
    if (!rateInfo) return;
    const hourlyRate = rateInfo.vat ? rateInfo.rate * VAT : rateInfo.rate;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][7] !== "active") continue;
      const monthKey = getMonthKey(rows[i][2]);
      if (!monthKey) continue;
      if (!monthData[monthKey]) monthData[monthKey] = { income: 0, schoolIncome: {}, expenses: {} };
      const hours = parseFloat(rows[i][5]) || 0;
      monthData[monthKey].expenses[name] = (monthData[monthKey].expenses[name] || 0) + (hours * hourlyRate);
    }
  });

  // הכנסות מגופים
  SCHOOLS.forEach(school => {
    const sSheet = ss.getSheetByName(school);
    if (!sSheet || sSheet.getLastRow() < 2) return;
    const rows = sSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][7] !== "active") continue;
      const monthKey = getMonthKey(rows[i][2]);
      if (!monthKey) continue;
      if (!monthData[monthKey]) monthData[monthKey] = { income: 0, schoolIncome: {}, expenses: {} };
      const hours = parseFloat(rows[i][5]) || 0;
      const amount = hours * INCOME_RATE;
      monthData[monthKey].income += amount;
      monthData[monthKey].schoolIncome[school] = (monthData[monthKey].schoolIncome[school] || 0) + amount;
    }
  });

  // כותרות — גופים + מנחים
  const numSchools = SCHOOLS.length;
  const numInstructors = INSTRUCTORS.filter(n => INSTRUCTOR_RATES[n]).length;
  const totalCols = 1 + numSchools + 1 + numInstructors + 1 + 1; // חודש + גופים + סהכ הכנסות + מנחים + סהכ מנחים + רווח
  const instructorNames = INSTRUCTORS.filter(n => INSTRUCTOR_RATES[n]);
  const headers = ["חודש", ...SCHOOLS, "סהכ הכנסות", ...instructorNames, "סהכ תשלומי מנחים", "רווח"];
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
      ...SCHOOLS.map(s => "₪" + Math.round(si[s] || 0).toLocaleString()),
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
// ריכוז חודשי — לשונית נפרדת לכל חודש
// ====================================================
function updateMonthlySummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entries = collectAllEntries();

  // קבץ לפי חודש
  const byMonth = {};
  entries.forEach(e => {
    const mk = getMonthKey(e.date);
    if (!mk) return;
    if (!byMonth[mk]) byMonth[mk] = [];
    byMonth[mk].push(e);
  });

  const months = Object.keys(byMonth).sort();

  months.forEach(mk => {
    const parts = mk.split("-");
    const monthName = MONTH_NAMES[parseInt(parts[1])] + " " + parts[0];
    const sheetName = "ריכוז " + monthName;

    // מחק לשונית קיימת ואצור מחדש
    const old = ss.getSheetByName(sheetName);
    if (old) ss.deleteSheet(old);
    const sheet = ss.insertSheet(sheetName);
    sheet.setRightToLeft(true);

    // כותרות
    const headers = ["מנחה", "תאריך", "גוף", "פעילות", "שעות"];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, 5)
      .setFontWeight("bold").setBackground("#1a2a5e").setFontColor("#ffffff");
    sheet.setFrozenRows(1);

    // מיון לפי מנחה ואז תאריך
    const rows = byMonth[mk].sort((a, b) => {
      if (a.instructor < b.instructor) return -1;
      if (a.instructor > b.instructor) return 1;
      return new Date(a.date) - new Date(b.date);
    });

    let currentInstructor = "";
    let instructorHours = 0;
    let grandTotal = 0;

    rows.forEach(r => {
      // שורת סיכום למנחה קודמת
      if (currentInstructor && r.instructor !== currentInstructor) {
        const sumRow = ["סהכ — " + currentInstructor, "", "", "", instructorHours];
        sheet.appendRow(sumRow);
        const lr = sheet.getLastRow();
        sheet.getRange(lr, 1, 1, 5).setBackground("#E8EAF6").setFontWeight("bold").setFontColor("#1a2a5e");
        instructorHours = 0;
      }

      currentInstructor = r.instructor;
      instructorHours += r.hours;
      grandTotal += r.hours;

      let dateStr = r.date;
      if (r.date instanceof Date) {
        dateStr = String(r.date.getDate()).padStart(2,"0") + "/" +
                  String(r.date.getMonth()+1).padStart(2,"0");
      }
      sheet.appendRow([r.instructor, dateStr, r.school, r.activity, r.hours]);

      // צביעת שורות לסירוגין
      const lr = sheet.getLastRow();
      if (lr % 2 === 0) sheet.getRange(lr, 1, 1, 5).setBackground("#F8F9FF");
    });

    // סיכום מנחה אחרון
    if (currentInstructor) {
      const sumRow = ["סהכ — " + currentInstructor, "", "", "", instructorHours];
      sheet.appendRow(sumRow);
      const lr = sheet.getLastRow();
      sheet.getRange(lr, 1, 1, 5).setBackground("#E8EAF6").setFontWeight("bold").setFontColor("#1a2a5e");
    }

    // סיכום כללי לחודש
    sheet.appendRow(["סהכ חודש " + monthName, "", "", "", grandTotal]);
    const lr = sheet.getLastRow();
    sheet.getRange(lr, 1, 1, 5).setBackground("#1a2a5e").setFontColor("#ffffff").setFontWeight("bold");

    // רוחב עמודות
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 80);
  });
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
  updateFinancialSummary();
  updateMonthlySummary();
  updateYearlySummary();
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
          date:       row[2],
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
