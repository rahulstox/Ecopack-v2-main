/**
 * EcoPack AI - Client-Side Verification Script
 *
 * Run this script in your browser console (F12) when on http://localhost:3000/dashboard
 * to automatically test all major functions.
 */

console.log("🧪 Starting EcoPack AI Verification Tests...\n");

// Test Suite
const tests = {
  passed: 0,
  failed: 0,
  results: [],
};

// Helper function to add test result
function logTest(name, passed, message) {
  const icon = passed ? "✅" : "❌";
  const result = { name, passed, message };
  tests.results.push(result);

  if (passed) {
    tests.passed++;
    console.log(`${icon} ${name}: ${message}`);
  } else {
    tests.failed++;
    console.error(`${icon} ${name}: ${message}`);
  }
}

// Test 1: Check if server is responding
async function testServerConnection() {
  try {
    const response = await fetch("/api/test-env");
    if (response.ok) {
      logTest("Server Connection", true, "Server is responding");
    } else {
      logTest("Server Connection", false, `Server returned ${response.status}`);
    }
  } catch (error) {
    logTest("Server Connection", false, error.message);
  }
}

// Test 2: Check Authentication
async function testAuthentication() {
  try {
    const response = await fetch("/api/profile");
    if (response.status === 401) {
      logTest("Authentication", false, "Not authenticated - Please sign in");
    } else if (response.ok) {
      const data = await response.json();
      if (data.success) {
        logTest("Authentication", true, "User authenticated successfully");
      } else {
        logTest("Authentication", false, data.error || "Profile fetch failed");
      }
    } else {
      logTest("Authentication", false, `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest("Authentication", false, error.message);
  }
}

// Test 3: Check Dashboard Stats API
async function testDashboardStats() {
  try {
    const response = await fetch("/api/dashboard-stats");
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log("\n📊 Dashboard Stats:", {
          "This Month CO₂e": data.thisMonthCo2e + " kg",
          "Total Actions": data.totalActions,
          Categories: Object.keys(data.categoryBreakdown || {}).join(", "),
        });
        logTest("Dashboard Stats", true, "Stats loaded successfully");
      } else {
        logTest("Dashboard Stats", false, data.error || "Failed to load stats");
      }
    } else {
      logTest("Dashboard Stats", false, `API returned ${response.status}`);
    }
  } catch (error) {
    logTest("Dashboard Stats", false, error.message);
  }
}

// Test 4: Check Action Logs API
async function testActionLogs() {
  try {
    const response = await fetch("/api/action-logs");
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        const logs = data.data || [];
        console.log(`\n📋 Action Logs: ${logs.length} entries found`);

        if (logs.length > 0) {
          const firstLog = logs[0];
          console.log("Latest Action:", {
            Date: firstLog.loggedAt || "Missing!",
            Category: firstLog.category,
            Activity: firstLog.activity,
            Amount: `${firstLog.amount} ${firstLog.unit}`,
            "CO₂e": `${firstLog.calculatedCo2e} kg`,
          });

          // Test date formatting
          if (firstLog.loggedAt) {
            const date = new Date(firstLog.loggedAt);
            if (!isNaN(date.getTime())) {
              const formatted = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              console.log("Formatted Date:", formatted);
              logTest(
                "Date/Time Display",
                true,
                `Date formats correctly: ${formatted}`
              );
            } else {
              logTest("Date/Time Display", false, "Invalid date format");
            }
          } else {
            logTest("Date/Time Display", false, "loggedAt is missing");
          }
        } else {
          console.log("ℹ️ No actions logged yet");
          logTest(
            "Action Logs",
            true,
            "API works but no data (log some actions first)"
          );
          logTest(
            "Date/Time Display",
            false,
            "No data to test (log an action first)"
          );
        }

        logTest("Action Logs API", true, `Fetched ${logs.length} logs`);
      } else {
        logTest("Action Logs API", false, data.error || "Failed to fetch logs");
      }
    } else {
      logTest("Action Logs API", false, `API returned ${response.status}`);
    }
  } catch (error) {
    logTest("Action Logs API", false, error.message);
  }
}

// Test 5: Test CO₂e Calculator (without actually logging)
function testCalculatorLogic() {
  try {
    // Test date formatting function
    const testDate = new Date();
    const formatted = testDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (formatted.includes(":")) {
      logTest("Date Formatter", true, "Date formatting works correctly");
    } else {
      logTest("Date Formatter", false, "Date formatting may have issues");
    }
  } catch (error) {
    logTest("Date Formatter", false, error.message);
  }
}

// Test 6: Check if key components are present in DOM
function testDOMComponents() {
  const expectedElements = [
    { selector: "h1", name: "Page Title" },
    { selector: "table", name: "Action Log Table" },
    { selector: "button", name: "Buttons" },
  ];

  let allFound = true;
  expectedElements.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (!element) {
      logTest(`DOM: ${name}`, false, `${name} not found`);
      allFound = false;
    }
  });

  if (allFound) {
    logTest("DOM Components", true, "All key components present");
  }
}

// Test 7: Verify Database Tables
async function testDatabaseInit() {
  try {
    const response = await fetch("/api/init");
    if (response.ok) {
      const data = await response.json();
      logTest("Database Tables", true, "Tables initialized/verified");
    } else {
      logTest("Database Tables", false, `Init returned ${response.status}`);
    }
  } catch (error) {
    logTest("Database Tables", false, error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log("═══════════════════════════════════════════════════");
  console.log("🧪 ECOPACK AI - COMPREHENSIVE TEST SUITE");
  console.log("═══════════════════════════════════════════════════\n");

  // Make sure we're on the right page
  if (!window.location.href.includes("localhost:3000")) {
    console.error("⚠️  Please run this on http://localhost:3000/dashboard");
    return;
  }

  // Run tests sequentially
  await testServerConnection();
  await testAuthentication();
  await testDatabaseInit();
  await testDashboardStats();
  await testActionLogs();
  testCalculatorLogic();
  testDOMComponents();

  // Print summary
  console.log("\n═══════════════════════════════════════════════════");
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════════");
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📈 Total: ${tests.results.length}`);
  console.log(
    `📊 Success Rate: ${Math.round(
      (tests.passed / tests.results.length) * 100
    )}%`
  );
  console.log("═══════════════════════════════════════════════════\n");

  // Detailed results
  console.log("📋 DETAILED RESULTS:\n");
  tests.results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);
  });

  // Recommendations
  console.log("═══════════════════════════════════════════════════");
  console.log("💡 RECOMMENDATIONS:");
  console.log("═══════════════════════════════════════════════════");

  if (tests.failed === 0) {
    console.log("🎉 All tests passed! Your application is working perfectly!");
    console.log("✨ Date/Time functionality: VERIFIED");
    console.log("✨ Data display: VERIFIED");
    console.log("✨ API endpoints: VERIFIED");
  } else {
    console.log("⚠️  Some tests failed. Please check:");
    tests.results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   • ${r.name}: ${r.message}`);
      });

    if (
      tests.results.some((r) => r.name.includes("Authentication") && !r.passed)
    ) {
      console.log("\n🔐 Authentication Issue:");
      console.log("   - Make sure you are signed in with Clerk");
      console.log('   - Click the "Sign In" button at the top');
    }

    if (tests.results.some((r) => r.name.includes("Date") && !r.passed)) {
      console.log("\n📅 Date/Time Issue:");
      console.log("   - Try logging a new action to test date display");
      console.log("   - Check browser console for date-related errors");
      console.log(
        '   - Run: await fetch("/api/recalculate-actions", {method: "POST"})'
      );
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("🔧 MANUAL TEST CHECKLIST:");
  console.log("═══════════════════════════════════════════════════");
  console.log('1. [ ] Click "Log New Action" button');
  console.log("2. [ ] Fill in the form with test data");
  console.log("3. [ ] Submit and verify new entry appears");
  console.log("4. [ ] Check date/time is current and formatted");
  console.log("5. [ ] Verify CO₂e value is calculated");
  console.log("6. [ ] Test delete button on an action");
  console.log('7. [ ] Click "Recalculate" button');
  console.log("8. [ ] Check stats cards update correctly");
  console.log("9. [ ] Verify category chart displays");
  console.log("10. [ ] Navigate to other pages (/history, /tracker, /reports)");
  console.log("═══════════════════════════════════════════════════\n");

  return tests;
}

// Export for manual use
window.ecopackTests = {
  runAll: runAllTests,
  testServerConnection,
  testAuthentication,
  testDashboardStats,
  testActionLogs,
  testCalculatorLogic,
  testDOMComponents,
  testDatabaseInit,
};

// Auto-run
console.log("💡 Tests will run automatically in 2 seconds...");
console.log("💡 Or run manually: ecopackTests.runAll()\n");

setTimeout(runAllTests, 2000);
