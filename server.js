const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL or POSTGRES_URL environment variable.");
}

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined
});

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

let dbInitPromise = null;
function initDb() {
  if (dbInitPromise) return dbInitPromise;
  dbInitPromise = (async () => {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
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

    const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM tasks");
    if (countResult.rows[0].count === 0) {
      const columns = [
        "task_id",
        "name",
        "description",
        "category",
        "priority",
        "status",
        "start_date",
        "due_date",
        "est_time",
        "act_time",
        "remarks"
      ];
      const values = [];
      const rows = DEFAULT_TASKS.map((task, rowIndex) => {
        const base = rowIndex * columns.length;
        values.push(
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
        const placeholders = columns.map((_, colIndex) => `$${base + colIndex + 1}`);
        return `(${placeholders.join(", ")})`;
      });

      await pool.query(
        `INSERT INTO tasks (${columns.join(", ")}) VALUES ${rows.join(", ")}`,
        values
      );
    }
  })();
  return dbInitPromise;
}

app.use("/api", async (req, res, next) => {
  try {
    await initDb();
    next();
  } catch (error) {
    console.error("Failed to initialize database", error);
    res.status(500).json({ error: "Failed to initialize database" });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch tasks", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
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

    const result = await pool.query(
      `INSERT INTO tasks
      (task_id, name, description, category, priority, status, start_date, due_date, est_time, act_time, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create task", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  const taskId = Number(req.params.id);
  if (!taskId) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  try {
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

    const result = await pool.query(
      `UPDATE tasks SET
        task_id = $1,
        name = $2,
        description = $3,
        category = $4,
        priority = $5,
        status = $6,
        start_date = $7,
        due_date = $8,
        est_time = $9,
        act_time = $10,
        remarks = $11
      WHERE id = $12
      RETURNING *`,
      values
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update task", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = Number(req.params.id);
  if (!taskId) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [taskId]);
    if (!result.rows[0]) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

initDb().catch((error) => {
  console.error("Database initialization failed", error);
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Task tracker running on http://localhost:${PORT}`);
  });
}

module.exports = app;
