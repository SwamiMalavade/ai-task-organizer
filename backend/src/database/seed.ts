import pool from "../config/database";

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting database seeding...\n");

    console.log("🗑️  Clearing existing data...");
    await client.query("DELETE FROM raw_notes");
    await client.query("DELETE FROM tasks");
    await client.query("DELETE FROM users");
    console.log("✅ Existing data cleared\n");

    console.log("👥 Creating demo users...");
    const plainPassword = "password123";

    const users = [
      {
        email: "john.doe@example.com",
        password: plainPassword,
        name: "John Doe",
      },
      {
        email: "jane.smith@example.com",
        password: plainPassword,
        name: "Jane Smith",
      },
      {
        email: "demo@example.com",
        password: plainPassword,
        name: "Demo User",
      },
    ];

    const userIds: number[] = [];

    for (const user of users) {
      const result = await client.query(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id",
        [user.email, user.password, user.name]
      );
      const userId = result.rows[0].id;
      userIds.push(userId);
      console.log(`  ✓ Created user: ${user.name} (${user.email})`);
    }
    console.log(`✅ Created ${users.length} users\n`);

    console.log("📁 Fetching categories...");
    const categoriesResult = await client.query(
      "SELECT id, name FROM categories"
    );
    const categoryMap = new Map();
    categoriesResult.rows.forEach((cat: any) => {
      categoryMap.set(cat.name, cat.id);
      console.log(`  ✓ Found category: ${cat.name} (ID: ${cat.id})`);
    });
    console.log(`✅ Found ${categoryMap.size} categories\n`);

    console.log("📝 Creating sample tasks...");

    const sampleTasks = [
      {
        user_id: userIds[0],
        title: "Complete Q1 financial report",
        priority: "High",
        category_id: categoryMap.get("Work"),
        status: "pending",
        notes: "Need to include revenue projections and expense analysis",
      },
      {
        user_id: userIds[0],
        title: "Review AWS infrastructure costs",
        priority: "High",
        category_id: categoryMap.get("Work"),
        status: "pending",
        notes: "Check for optimization opportunities",
      },
      {
        user_id: userIds[0],
        title: "Team standup meeting",
        priority: "Medium",
        category_id: categoryMap.get("Meetings"),
        status: "completed",
        notes: "Daily sync with development team",
        completed_at: new Date(),
      },
      {
        user_id: userIds[0],
        title: "Update project documentation",
        priority: "Medium",
        category_id: categoryMap.get("Admin"),
        status: "pending",
        notes: "Add API endpoint documentation",
      },
      {
        user_id: userIds[0],
        title: "Schedule dentist appointment",
        priority: "Low",
        category_id: categoryMap.get("Personal"),
        status: "pending",
        notes: "Regular checkup",
      },
      {
        user_id: userIds[1],
        title: "Prepare presentation for client meeting",
        priority: "High",
        category_id: categoryMap.get("Work"),
        status: "pending",
        notes: "Focus on ROI and implementation timeline",
      },
      {
        user_id: userIds[1],
        title: "Code review for pull request #234",
        priority: "High",
        category_id: categoryMap.get("Work"),
        status: "pending",
        notes: "Authentication module updates",
      },
      {
        user_id: userIds[1],
        title: "Weekly team retrospective",
        priority: "Medium",
        category_id: categoryMap.get("Meetings"),
        status: "pending",
        notes: "Friday 3 PM",
      },
      {
        user_id: userIds[1],
        title: "Submit expense reports",
        priority: "Medium",
        category_id: categoryMap.get("Admin"),
        status: "completed",
        notes: "Conference travel expenses",
        completed_at: new Date(),
      },
      {
        user_id: userIds[1],
        title: "Research new frontend frameworks",
        priority: "Low",
        category_id: categoryMap.get("Work"),
        status: "pending",
        notes: "Compare React, Vue, and Svelte",
      },
      {
        user_id: userIds[2],
        title: "Fix critical bug in production",
        priority: "High",
        category_id: categoryMap.get("Work"),
        status: "completed",
        notes: "Database connection timeout issue resolved",
        completed_at: new Date(),
      },
      {
        user_id: userIds[2],
        title: "Call client about project delays",
        priority: "High",
        category_id: categoryMap.get("Meetings"),
        status: "pending",
        notes: "Need to discuss revised timeline",
      },
      {
        user_id: userIds[2],
        title: "Update resume and LinkedIn profile",
        priority: "Medium",
        category_id: categoryMap.get("Personal"),
        status: "pending",
        notes: "Add recent project achievements",
      },
      {
        user_id: userIds[2],
        title: "Organize digital files and documents",
        priority: "Low",
        category_id: categoryMap.get("Admin"),
        status: "pending",
        notes: "Clean up downloads folder",
      },
      {
        user_id: userIds[2],
        title: "Grocery shopping",
        priority: "Low",
        category_id: categoryMap.get("Personal"),
        status: "pending",
        notes: "Milk, eggs, bread, vegetables",
      },
    ];

    for (const task of sampleTasks) {
      const query = `
        INSERT INTO tasks (user_id, title, priority, category_id, status, notes, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(query, [
        task.user_id,
        task.title,
        task.priority,
        task.category_id,
        task.status,
        task.notes,
        task.completed_at || null,
      ]);
      console.log(`  ✓ Created task: "${task.title}" for user ${task.user_id}`);
    }
    console.log(`✅ Created ${sampleTasks.length} tasks\n`);

    console.log("📄 Creating sample raw notes...");

    const sampleRawNotes = [
      {
        user_id: userIds[0],
        raw_text:
          "Finish presentation by Friday, check AWS logs for errors, call client about project update, review Q4 reports",
      },
      {
        user_id: userIds[1],
        raw_text:
          "Team meeting tomorrow at 10am, code review needed for auth module, submit expense report by EOD",
      },
      {
        user_id: userIds[2],
        raw_text:
          "Fix production bug ASAP, update documentation, schedule 1-on-1 with manager, buy groceries",
      },
    ];

    for (const note of sampleRawNotes) {
      await client.query(
        "INSERT INTO raw_notes (user_id, raw_text) VALUES ($1, $2)",
        [note.user_id, note.raw_text]
      );
      console.log(`  ✓ Created raw note for user ${note.user_id}`);
    }
    console.log(`✅ Created ${sampleRawNotes.length} raw notes\n`);

    console.log("═══════════════════════════════════════════════════════");
    console.log("✨ Database seeding completed successfully!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n📊 Summary:");
    console.log(`  • Users created: ${users.length}`);
    console.log(`  • Tasks created: ${sampleTasks.length}`);
    console.log(`  • Raw notes created: ${sampleRawNotes.length}`);
    console.log("\n🔐 Demo Login Credentials:");
    console.log("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    users.forEach((user) => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: password123`);
      console.log(`  Name: ${user.name}`);
      console.log("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase()
  .then(() => {
    console.log("\n✅ Seeding process completed. Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding process failed:", error);
    process.exit(1);
  });
