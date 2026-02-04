const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, "data", "tasks.db");
const db = new sqlite3.Database(DB_PATH);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DEFAULT_TASKS = [
  {
    task_id: "BatStateU001",
    name: "Monthly Report",
    description: "Prepare, consolidate, and submit the Monthly Report of the Office of Student Development (OSD) by collecting and validating data on programs, activities, and services conducted during the reporting period. Ensure that all information is accurate, complete, and aligned with institutional reporting guidelines. The report shall be properly formatted, reviewed, and submitted within the prescribed timeline.",
    category: "OSD",
    priority: "Can Wait",
    status: "Submitted",
    start_date: "Feb 02, 2026",
    due_date: "Feb 02, 2026",
    est_time: "2hrs",
    act_time: "30 mins",
    remarks: "Waiting for Maam Carmela's Signature"
  },
  {
    task_id: "BatStateU002",
    name: "Monthly Report",
    description: "Prepare and submit the Monthly Statement of Account (SOA) Report by consolidating all financial transactions and billing records for the reporting period. Ensure accuracy, completeness, and proper reconciliation of accounts in coordination with the concerned offices. Verify that all entries comply with institutional financial policies and documentation standards. The finalized report shall be reviewed and submitted within the prescribed timeline.",
    category: "SOA",
    priority: "Can Wait",
    status: "On Going",
    start_date: "Feb 02, 2026",
    due_date: "Feb 03, 2026",
    est_time: "1hr",
    act_time: "",
    remarks: ""
  },
  {
    task_id: "BatStateU003",
    name: "Naga Competition Consulatation",
    description: "Conduct a consultation meeting for the NAGA Competition to provide guidance and technical advice to participating students. The activity includes discussing competition guidelines, requirements, timelines, and evaluation criteria, as well as addressing students’ concerns and clarifying expectations to ensure proper preparation and compliance with competition standards.",
    category: "SOA",
    priority: "Urgent",
    status: "Done",
    start_date: "Feb 02, 2026",
    due_date: "Feb 02, 2026",
    est_time: "30 mins",
    act_time: "30 mins",
    remarks: "waiting for the Final Video"
  },
  {
    task_id: "BatStateU004",
    name: "Drafting a Request Letter for a Client Interview for the Capstone Project",
    description: "Prepare a formal request letter addressed to the identified client, seeking permission to conduct an interview for the Capstone Project. The task includes clearly stating the purpose of the interview, the scope of the project, proposed schedule, and ensuring that the letter adheres to institutional communication standards prior to endorsement and submission.",
    category: "Capstone",
    priority: "Urgent",
    status: "Done",
    start_date: "Feb 02, 2026",
    due_date: "Feb 02, 2026",
    est_time: "20 mins",
    act_time: "30 mins",
    remarks: "Uploaded to google Classroom"
  },
  {
    task_id: "BatStateU005",
    name: "Update the Capstone Progress Tracker",
    description: "Review and update the Capstone Progress Tracker by recording the latest project milestones, deliverables, and completion status of each Capstone group. Ensure that all entries are accurate, current, and aligned with the approved project timelines and requirements. The updated tracker shall serve as a reference for monitoring student progress and for reporting purposes.",
    category: "Capstone",
    priority: "Can Wait",
    status: "Done",
    start_date: "Feb 02, 2026",
    due_date: "Feb 03, 2026",
    est_time: "4 hrs",
    act_time: "",
    remarks: ""
  },
  {
    task_id: "BatStateU006",
    name: "Remind the faculty regarding to the absenteeism proceedure",
    description: "Coordinate and disseminate reminders to faculty members regarding the institutional absenteeism procedures. Ensure that faculty are informed of the proper guidelines, documentation requirements, and enforcement protocols, including the admission slip requirement for students returning from absences.",
    category: "Program Coordinator",
    priority: "Can Wait",
    status: "Done",
    start_date: "Feb 02, 2026",
    due_date: "Feb 02, 2026",
    est_time: "1 hr",
    act_time: "30 mins",
    remarks: "already sent to the GC"
  },
  {
    task_id: "BatStateU007",
    name: "Check 3 Captone Proposal",
    description: "Checked Capstone Proposals by reviewing project titles, objectives, scope, methodology, and feasibility to ensure alignment with program outcomes, institutional guidelines, and approval requirements.",
    category: "Capstone",
    priority: "Urgent",
    status: "Done",
    start_date: "Feb 03, 2026",
    due_date: "Feb 03, 2026",
    est_time: "2 hrs",
    act_time: "2 hrs",
    remarks: "Provide comments and recommendation to the students proposal"
  },
  {
    task_id: "BatStateU008",
    name: "Follow up the Class Syllabus at CICS Alangilan",
    description: "Followed up the class syllabi at CICS Alangilan to ensure submission, completeness, and compliance with approved academic standards and institutional requirements.",
    category: "Program Coordinator",
    priority: "Can Wait",
    status: "On Going",
    start_date: "Feb 03, 2026",
    due_date: "Feb 03, 2026",
    est_time: "30 mins",
    act_time: "",
    remarks: ""
  },
  {
    task_id: "BatStateU009",
    name: "Accomplishment of Certificate of Compensation Payment/ Tax withheld (BIR FORM 2316)",
    description: "Accomplished the Certificate of Compensation Payment / Tax Withheld (BIR Form 2316) by accurately completing required employee and compensation details in compliance with BIR regulations and institutional payroll guidelines.",
    category: "Faculty",
    priority: "Urgent",
    status: "Submitted",
    start_date: "Feb 03, 2026",
    due_date: "Feb 03, 2026",
    est_time: "30 mins",
    act_time: "10 mins",
    remarks: "Sumitted to Ma'am Abby for Printing"
  }
];

function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT,
        name TEXT,
        description TEXT,
        category TEXT,
        priority TEXT,
        status TEXT,
        start_date TEXT,
        due_date TEXT,
        est_time TEXT,
        act_time TEXT,
        remarks TEXT
      )`
    );

    db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
      if (err) {
        console.error("Failed to count tasks", err);
        return;
      }
      if (row.count === 0) {
        const stmt = db.prepare(
          `INSERT INTO tasks
          (task_id, name, description, category, priority, status, start_date, due_date, est_time, act_time, remarks)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        DEFAULT_TASKS.forEach((task) => {
          stmt.run(
            task.task_id,
            task.name,
            task.description,
            task.category,
            task.priority,
            task.status,
            task.start_date,
            task.due_date,
            task.est_time,
            task.act_time,
            task.remarks
          );
        });
        stmt.finalize();
      }
    });
  });
}

app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY id DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch tasks" });
      return;
    }
    res.json(rows);
  });
});

app.post("/api/tasks", (req, res) => {
  const task = req.body || {};
  const values = [
    task.task_id || "",
    task.name || "",
    task.description || "",
    task.category || "",
    task.priority || "",
    task.status || "",
    task.start_date || "",
    task.due_date || "",
    task.est_time || "",
    task.act_time || "",
    task.remarks || ""
  ];

  db.run(
    `INSERT INTO tasks
    (task_id, name, description, category, priority, status, start_date, due_date, est_time, act_time, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    , values,
    function (err) {
      if (err) {
        res.status(500).json({ error: "Failed to create task" });
        return;
      }
      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (getErr, row) => {
        if (getErr) {
          res.status(500).json({ error: "Failed to fetch created task" });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put("/api/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  if (!taskId) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  const task = req.body || {};
  const values = [
    task.task_id || "",
    task.name || "",
    task.description || "",
    task.category || "",
    task.priority || "",
    task.status || "",
    task.start_date || "",
    task.due_date || "",
    task.est_time || "",
    task.act_time || "",
    task.remarks || "",
    taskId
  ];

  db.run(
    `UPDATE tasks SET
      task_id = ?,
      name = ?,
      description = ?,
      category = ?,
      priority = ?,
      status = ?,
      start_date = ?,
      due_date = ?,
      est_time = ?,
      act_time = ?,
      remarks = ?
    WHERE id = ?`,
    values,
    function (err) {
      if (err) {
        res.status(500).json({ error: "Failed to update task" });
        return;
      }
      db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (getErr, row) => {
        if (getErr) {
          res.status(500).json({ error: "Failed to fetch updated task" });
          return;
        }
        res.json(row);
      });
    }
  );
});

app.delete("/api/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  if (!taskId) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  db.run("DELETE FROM tasks WHERE id = ?", [taskId], function (err) {
    if (err) {
      res.status(500).json({ error: "Failed to delete task" });
      return;
    }
    res.json({ success: true });
  });
});

initDb();

app.listen(PORT, () => {
  console.log(`Task tracker running on http://localhost:${PORT}`);
});
