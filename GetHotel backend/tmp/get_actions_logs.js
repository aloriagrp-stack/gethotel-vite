const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
    console.log("Fetching workflow runs from GitHub API...");
    try {
        const res = await fetch("https://api.github.com/repos/aloriagrp-stack/gethotel-vite/actions/runs");
        const data = await res.json();
        
        if (!data.workflow_runs || data.workflow_runs.length === 0) {
            console.log("No runs found");
            return;
        }

        const latestRun = data.workflow_runs[0];
        console.log(`Latest Run Details:`);
        console.log(`- ID: ${latestRun.id}`);
        console.log(`- Commit: ${latestRun.head_commit.message}`);
        console.log(`- Status: ${latestRun.status}`);
        console.log(`- Conclusion: ${latestRun.conclusion}`);
        console.log(`- Event: ${latestRun.event}`);
        console.log(`- URL: ${latestRun.html_url}`);

        // Fetch jobs to see outputs
        const jobsRes = await fetch(`https://api.github.com/repos/aloriagrp-stack/gethotel-vite/actions/runs/${latestRun.id}/jobs`);
        const jobsData = await jobsRes.json();
        
        console.log("\nJobs List:");
        jobsData.jobs.forEach(job => {
            console.log(`- Job: ${job.name} | Status: ${job.status} | Conclusion: ${job.conclusion}`);
            console.log("  Steps:");
            job.steps.forEach(step => {
                console.log(`    * ${step.name}: ${step.status} | ${step.conclusion}`);
            });
        });
    } catch (err) {
        console.error("Failed to fetch runs:", err);
    }
}

main();
