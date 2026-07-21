const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
    console.log("Logging into live API...");
    try {
        const loginRes = await fetch("https://gethotelstays.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@gethotelstays.com",
                password: "shriyanshking"
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;

        console.log("Testing bulk-promotion endpoint on live server with referer...");
        const res = await fetch("https://gethotelstays.com/api/admin/hotels/bulk-promotion", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Referer": "https://gethotelstays.com/admin/super"
            },
            body: JSON.stringify({}) // Send empty object to trigger validation error
        });

        console.log("Status Code:", res.status);
        const data = await res.json();
        console.log("Response:", data);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

main();
