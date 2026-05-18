const SHEET_NAME = "דיווחים";
const RATE = 440;
const INCOME_RATE = 440;
const VAT = 1.18;
const SUMMARY_SHEET = "סיכום פיננסי";
const INSTRUCTORS = ["אורית שטרית","מעיין זך","ענת דימנט","אמונה לנדאו"];
const SCHOOLS = ["סלעית","רמת כרמים","שבילי רעות","יחדיו","נתיבות","עלי זהב","אגף חינוך באר טוביה","תיכון באר טוביה","שדות- באר טוביה","ייעוץ לחינוך ישראלי","בכר- אבן יהודה"];
const VISIBLE_HEADERS = ["מנחה","תאריך","גוף","פעילות","שעות"];
const ALL_HEADERS = ["מזהה","מנחה","תאריך","גוף","פעילות","שעות","חותמת זמן","סטטוס"];
const MONTH_NAMES = ["","ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const INSTRUCTOR_RATES = {
  "מעיין זך":   { rate: 280, vat: false },
  "ענת דימנט":  { rate: 280, vat: false },
  "אמונה לנדאו":{ rate: 280, vat: true  }
};

function updateFinancialSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get or create summary sheet
  let sheet = ss.getSheetByName(SUMMARY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SUMMARY_SHEET);
    // Move to first position
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  }
  sheet.clear();
  sheet.setRightToLeft(true);

  // Collect all data from instructor sheets
  const monthData = {}; // { "2026-01": { income: 0, expenses: { name: amount } } }

  // הוצאות מנחים — מלשוניות המנחים
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
      // הוצאה = מה שמשלמים למנחה
      monthData[monthKey].expenses[name] = (monthData[monthKey].expenses[name] || 0) + (hours * hourlyRate);
    }
  });

  // הכנסות מגופים — ₪440 לשעה
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
      const amount = hours * INCOME_RATE; // ₪440
      monthData[monthKey].income += amount;
      monthData[monthKey].schoolIncome[school] = (monthData[monthKey].schoolIncome[school] || 0) + amount;
    }
  });

  // Write headers
  const headers = ["חודש", ...SCHOOLS, "סהכ הכנסות", "מעיין זך", "ענת דימנט", "אמונה לנדאו", "סהכ תשלומי מנחים", "רווח"];
  sheet.appendRow(headers);
  sheet.getRange(1,1,1,16).setFontWeight("bold").setBackground("#1a2a5e").setFontColor("#ffffff");
  // צבע שונה לעמודות הכנסות וגופים
  sheet.getRange(1,2,1,9).setBackground("#1565C0");
  // צבע שונה לעמודות מנחים
  sheet.getRange(1,12,1,4).setBackground("#880E4F");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  // Write monthly data sorted
  const months = Object.keys(monthData).sort();
  let totalIncome = 0, totalExpenses = 0;

  months.forEach(mk => {
    const parts = mk.split("-");
    const monthName = MONTH_NAMES[parseInt(parts[1])] + " " + parts[0];
    const d = monthData[mk];
    const expenses = d.expenses;
    const totalExp = Object.values(expenses).reduce((s,v)=>s+v, 0);
    const profit = d.income - totalExp;
    totalIncome += d.income;
    totalExpenses += totalExp;

    const si = d.schoolIncome || {};
    const row = [
      monthName,
      ...SCHOOLS.map(s => "₪" + Math.round(si[s] || 0).toLocaleString()),
      "₪" + Math.round(d.income).toLocaleString(),
      "₪" + Math.round(expenses["מעיין זך"] || 0).toLocaleString(),
      "₪" + Math.round(expenses["ענת דימנט"] || 0).toLocaleString(),
      "₪" + Math.round(expenses["אמונה לנדאו"] || 0).toLocaleString(),
      "₪" + Math.round(totalExp).toLocaleString(),
      "₪" + Math.round(profit).toLocaleString(),
    ];
    sheet.appendRow(row);
    const lastRow = sheet.getLastRow();
    // Color profit cell
    sheet.getRange(lastRow, 16).setFontColor(profit >= 0 ? "#0a5c2e" : "#c00000").setFontWeight("bold");
  });

  // Total row
  const totalProfit = totalIncome - totalExpenses;
  const totalRow = ["סהכ", ...new Array(9).fill(""), "₪"+Math.round(totalIncome).toLocaleString(), "", "", "", "₪"+Math.round(totalExpenses).toLocaleString(), "₪"+Math.round(totalProfit).toLocaleString()];
  sheet.appendRow(totalRow);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, 16).setBackground("#F0F4FF").setFontWeight("bold");

  // Column widths
  sheet.setColumnWidth(1, 100); // חודש
  for (let c = 2; c <= 10; c++) sheet.setColumnWidth(c, 120); // גופים
  sheet.setColumnWidth(11, 120); // סהכ הכנסות
  sheet.setColumnWidth(12, 110); // מעיין
  sheet.setColumnWidth(13, 110); // ענת
  sheet.setColumnWidth(14, 120); // אמונה
  sheet.setColumnWidth(15, 140); // סהכ מנחים
  sheet.setColumnWidth(16, 100); // רווח
}



function getMonthKey(dateVal) {
  if (!dateVal) return "";
  // Handle Date object
  if (dateVal instanceof Date) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, "0");
    return y + "-" + m;
  }
  // Handle string YYYY-MM-DD
  const s = String(dateVal);
  if (s.length >= 7) return s.substring(0, 7);
  return "";
}

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
    // Only add summary if month actually changed
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
  // Style the summary row
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, 8)
    .setBackground("#F0F4FF")
    .setFontWeight("bold")
    .setFontColor("#1a2a5e");
}



// עמודות גלויות בלבד
// עמודות מלאות (כולל טכניות)

function setupSheet(sheet, headerColor) {
  if (!sheet) return;
  headerColor = headerColor || "#2B4BAA";
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ALL_HEADERS);
    // עיצוב כותרות
    sheet.getRange(1,1,1,8).setFontWeight("bold").setBackground(headerColor).setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  sheet.setRightToLeft(true);
  // הסתרת עמודות טכניות: מזהה (1), חותמת זמן (7), סטטוס (8)
  sheet.hideColumns(1);
  sheet.hideColumns(7);
  sheet.hideColumns(8);
  // רוחב עמודות גלויות
  sheet.setColumnWidth(2, 140); // מנחה
  sheet.setColumnWidth(3, 100); // תאריך
  sheet.setColumnWidth(4, 180); // גוף
  sheet.setColumnWidth(5, 180); // פעילות
  sheet.setColumnWidth(6, 80);  // שעות
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
  INSTRUCTORS.forEach(i => getOrCreateSheet(i, "#C2185B"));  // ורוד — מנחות
  SCHOOLS.forEach(s => getOrCreateSheet(s, "#1565C0"));      // כחול — גופים
}

function doGet(e) {
  try {
    // שמירה דרך GET
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
      updateFinancialSummary();
      return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
    }

    // מחיקה דרך GET (עוקף CORS)
    if (e.parameter && e.parameter.action === "delete") {
      const id = e.parameter.id;
      const instructor = e.parameter.instructor;
      const school = e.parameter.school;
      [instructor, school].forEach(sheetName => {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet || sheet.getLastRow() < 2) return;
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][7] === "summary") continue; // דלג על שורות סיכום
          if (String(rows[i][0]) === String(id)) {
            sheet.deleteRow(i+1);
            break;
          }
        }
      });
      updateFinancialSummary();
      return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
    }
    // קרא מכל הלשוניות
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const allRows = [];
    INSTRUCTORS.forEach(name => {
      const s = ss.getSheetByName(name);
      if (!s || s.getLastRow() < 2) return;
      const rows = s.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) allRows.push(rows[i]);
    });
    const rows = allRows;
    const entries = [];
    rows.forEach(row => {
      if (row[7] === "active" && row[7] !== "summary") {
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
      updateFinancialSummary();
    }

    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function resetFinancialSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // מחק וצור מחדש לשונית סיכום
  const old = ss.getSheetByName("סיכום פיננסי");
  if (old) ss.deleteSheet(old);
  // נקה שורות ריקות מלשוניות מנחים
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
  updateFinancialSummary();
}
