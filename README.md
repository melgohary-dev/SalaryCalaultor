# Salary Calculator

Simple JavaScript app to calculate any developer salary and give the employer a full report of employee work

## [`See Live Here`](https://melgohary-dev.github.io/SalaryCalaultor/)

## Made with:

- HTML5
- CSS3
- Javascript `ES6`

## Formulas

### Days

All days between the start and end date are counted by their weekday (Sun–Sat). Days that fall on a holiday (Fri & Sat by default, togglable) are excluded from work days.

```
Total Days     = workDays + holidays
Should Work    = workDays × dailyWorkHours
Overtime       = workedHours − spendTime − shouldWork
```

### Per Hour Mode

The user enters an hourly rate directly.

```
Hourly Rate    = user input
Yearly         = hourlyRate × workDaysPerWeek × dailyWorkHours × 52
Should Earn    = hourlyRate × shouldWork
Overtime Pay   = overtimeHours × hourlyRate
Your Salary    = Should Earn + Overtime Pay
```

### Per Month Mode

The user enters a monthly salary. An hourly rate is derived from it, then all earnings use that rate.

```
Yearly         = monthlySalary × 12
Hourly Rate    = yearly / (52 × workDaysPerWeek × dailyWorkHours)
Should Earn    = hourlyRate × shouldWork
Overtime Pay   = overtimeHours × hourlyRate
Your Salary    = Should Earn + Overtime Pay
```

> **Note:** `workDaysPerWeek` = number of non-holiday days in a week (default 5, Sun–Thu). `dailyWorkHours` and `workedHours` are user inputs.
