const SHEET_NAME = "דיווחים";
const RATE = 440;

const INSTRUCTORS = ["אורית שטרית","מעיין זך","ענת דימנט","אמונה לנדאו"];
const SCHOOLS = ["סלעית","רמת כרמים","שבילי רעות","יחדיו","נתיבות","עלי זהב","אגף חינוך באר טוביה","תיכון באר טוביה","שדות- באר טוביה"];

// עמודות גלויות בלבד
const VISIBLE_HEADERS = ["מנחה","תאריך","גוף","פעילות","שעות"];
// עמודות מלאות (כולל טכניות)
const ALL_HEADERS = ["מזהה","מנחה","תאריך","גוף","פעילות","שעות","חותמת זמן","סטטוס"];

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
          if (String(rows[i][0]) === String(id)) {
            sheet.getRange(i+1,8).setValue("deleted");
            break;
          }
        }
      });
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
      if (instSheet) instSheet.appendRow(row);
      const schoolSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.school);
      if (schoolSheet) schoolSheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success:false,error:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
