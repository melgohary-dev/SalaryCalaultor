/** Helpers */
const formatCurrency = (v) => (Math.round(v * 100) / 100).toFixed(2);

const WEEKS_PER_YEAR = 52;

/** DOM refs */
const dateFrom = document.querySelector("#startDate");
const dateTo = document.querySelector("#endDate");
const nameInput = document.querySelector("#name");
const workHoursInput = document.querySelector("#NumberOfWorkHours");
const salaryInput = document.querySelector("#Salary");
const workedHoursInput = document.querySelector("#WorkedHours");
const spendTimeInput = document.querySelector("#SpendTime");
const copyBtn = document.querySelector("#btnCopy");
const cardsContainer = document.querySelector("#cards-container");
const holidayBtns = document.querySelectorAll(".holiday");
const salaryModeBtns = document.querySelectorAll(".salary-mode");

const dayIndex = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

/** State */
let holidayMap = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: true, 6: true };
let report = null;
let salaryMode = "hour";

/** Count occurrences of a given weekday between two dates */
function countWeekday(startDate, endDate, targetDay) {
  let count = 0;
  let cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur < end) {
    if (cur.getDay() === targetDay) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/** Build the report object */
function getDaysDetails({ from, to, workHours, holidays, Salary, workedHours, spendTime, name }) {
  let result = {};
  for (let key in dayIndex) {
    result[key] = countWeekday(from, to, dayIndex[key]);
  }

  let restDays = 0;
  let workDays = 0;
  let allDays = 0;

  for (let key in result) {
    if (holidays.includes(dayIndex[key])) {
      restDays += result[key];
    } else {
      workDays += result[key];
    }
    allDays += result[key];
  }

  let shouldWork = workHours * workDays;

  let workDaysPerWeek = 0;
  for (let key in dayIndex) {
    if (!holidays.includes(dayIndex[key])) workDaysPerWeek++;
  }

  let hourlyRate;
  let yearlySalary;
  let baseSalary;
  let overtimeHours = +workedHours - +spendTime - +shouldWork;

  if (salaryMode === "month") {
    let monthlySalary = +Salary;
    yearlySalary = monthlySalary * 12;
    hourlyRate = yearlySalary / (WEEKS_PER_YEAR * workDaysPerWeek * (+workHours));

    baseSalary = hourlyRate * +shouldWork;
  } else {
    hourlyRate = +Salary;
    yearlySalary = hourlyRate * workDaysPerWeek * (+workHours) * WEEKS_PER_YEAR;
    baseSalary = hourlyRate * +shouldWork;
  }

  let overtimeSalary = overtimeHours * hourlyRate;
  let totalSalary = (Math.round(baseSalary * 100) + Math.round(overtimeSalary * 100)) / 100;

  report = {
    name,
    duration: { from, to },
    daysDetails: { ...result },
    daysCount: `${allDays} day`,
    holiDays: `${restDays} day`,
    workDays: `${workDays} day`,
    hoursShouldWork: `${shouldWork} Hours`,
    workedHours: `${workedHours} Hours`,
    spentTime: `${spendTime} Hours`,
    overTime: `${overtimeHours} Hours`,
    overTimeSalary: overtimeSalary,
    hourSalary: hourlyRate,
    yearlySalary,
    shouldSalary: baseSalary,
    yourSalary: +totalSalary,
  };

  return report;
}

function calculate() {
  let holidays = [];
  for (const key in holidayMap) {
    if (holidayMap[key]) holidays.push(Number(key));
  }

  if (
    workHoursInput.value &&
    salaryInput.value &&
    workedHoursInput.value &&
    spendTimeInput.value &&
    nameInput.value
  ) {
    let data = getDaysDetails({
      from: dateFrom.value,
      to: dateTo.value,
      workHours: workHoursInput.value,
      holidays,
      Salary: salaryInput.value,
      workedHours: workedHoursInput.value,
      spendTime: spendTimeInput.value,
      name: nameInput.value,
    });
    renderCards(data);
  }
}

/** Render result as visual cards */
function renderCards(data) {
  let dayBadges = "";
  for (let day in data.daysDetails) {
    let count = data.daysDetails[day];
    dayBadges += `<span class="day-badge ${count > 0 ? "active" : ""}">${day.slice(0, 3)}: ${count}</span>`;
  }

  const cards = [
    `
    <div class="card">
      <div class="card-header">Employee</div>
      <div class="card-body">
        <div class="card-row"><span class="card-label">Name</span><span class="card-value">${data.name}</span></div>
        <div class="card-row"><span class="card-label">Period</span><span class="card-value">${data.duration.from} \u2192 ${data.duration.to}</span></div>
      </div>
    </div>
    `,
    `
    <div class="card">
      <div class="card-header">Days Breakdown</div>
      <div class="card-body">
        <div class="card-row"><span class="card-label">Work Days</span><span class="card-value">${data.workDays}</span></div>
        <div class="card-row"><span class="card-label">Holidays</span><span class="card-value">${data.holiDays}</span></div>
        <div class="card-row"><span class="card-label">Total</span><span class="card-value">${data.daysCount}</span></div>
        <div class="card-divider"></div>
        <div class="card-row"><span class="card-label">Per Day</span><span class="card-value"><span class="days-detail">${dayBadges}</span></span></div>
      </div>
    </div>
    `,
    `
    <div class="card">
      <div class="card-header">Hours</div>
      <div class="card-body">
        <div class="card-row"><span class="card-label">Should Work</span><span class="card-value">${data.hoursShouldWork}</span></div>
        <div class="card-row"><span class="card-label">Worked</span><span class="card-value">${data.workedHours}</span></div>
        <div class="card-row"><span class="card-label">Spent Time</span><span class="card-value">${data.spentTime}</span></div>
        <div class="card-row"><span class="card-label">Overtime</span><span class="card-value">${data.overTime}</span></div>
      </div>
    </div>
    `,
    `
    <div class="card card-highlight">
      <div class="card-header">Salary</div>
      <div class="card-body">
        <div class="card-row"><span class="card-label">Hourly Rate</span><span class="card-value">${formatCurrency(data.hourSalary)} L.E</span></div>
        <div class="card-row"><span class="card-label">Yearly</span><span class="card-value">${formatCurrency(data.yearlySalary)} L.E</span></div>
        <div class="card-divider"></div>
        <div class="card-row"><span class="card-label">Should Earn</span><span class="card-value">${formatCurrency(data.shouldSalary)} L.E</span></div>
        <div class="card-row"><span class="card-label">Overtime Pay</span><span class="card-value">${formatCurrency(data.overTimeSalary)} L.E</span></div>
        <div class="card-divider"></div>
        <div class="card-row card-total"><span class="card-label">Your Salary</span><span class="card-value">${formatCurrency(data.yourSalary)} L.E</span></div>
      </div>
    </div>
    `,
  ];

  cardsContainer.innerHTML = cards.join("");
}

/** Plain-text summary for clipboard copy */
function formatTextReport(data) {
  return [
    `Name: ${data.name}`,
    `Period: ${data.duration.from} \u2192 ${data.duration.to}`,
    "",
    "--- Days ---",
    `Work Days: ${data.workDays}`,
    `Holidays: ${data.holiDays}`,
    `Total: ${data.daysCount}`,
    "",
    "--- Hours ---",
    `Should Work: ${data.hoursShouldWork}`,
    `Worked: ${data.workedHours}`,
    `Spent Time: ${data.spentTime}`,
    `Overtime: ${data.overTime}`,
    "",
    "--- Salary ---",
    `Hourly Rate: ${formatCurrency(data.hourSalary)} L.E`,
    `Yearly Salary: ${formatCurrency(data.yearlySalary)} L.E`,
    `Should Earn: ${formatCurrency(data.shouldSalary)} L.E`,
    `Overtime Pay: ${formatCurrency(data.overTimeSalary)} L.E`,
    `Your Salary: ${formatCurrency(data.yourSalary)} L.E`,
  ].join("\n");
}

/** Copy text to clipboard */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

/** Feedback flash on copy button */
function flashCopyBtn(type) {
  copyBtn.classList.add(type);
  setTimeout(() => copyBtn.classList.remove(type), 1000);
}

/** Event listeners */

[dateFrom, dateTo].forEach((el) => el.addEventListener("change", calculate));

[workHoursInput, salaryInput, workedHoursInput, spendTimeInput, nameInput].forEach((el) =>
  el.addEventListener("keyup", calculate),
);

copyBtn.addEventListener("click", async () => {
  if (report) {
    await copyToClipboard(formatTextReport(report));
    flashCopyBtn("success");
  } else {
    flashCopyBtn("error");
  }
});

salaryModeBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    salaryModeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    salaryMode = i === 0 ? "hour" : "month";
    calculate();
  });
});

holidayBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    holidayMap[i] = !holidayMap[i];
    calculate();
  });
});
