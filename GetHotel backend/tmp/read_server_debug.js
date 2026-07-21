const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
    console.log("Fetching debug info from unzip.php...");
    try {
        const res = await fetch("https://gethotelstays.com/unzip.php?action=debug");
        const text = await res.text();
        console.log(text);
    } catch (err) {
        console.error("Failed to fetch debug info:", err);
    }
}

main();
