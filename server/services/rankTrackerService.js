
const SERPER_API_URL = "https://google.serper.dev/search";

// Search Google through Serper and find the target domain's ranking.
export async function rankTracker(keyword, targetDomain) {
    try {
        if (!process.env.SERPER_API_KEY) {
            throw new Error("SERPER_API_KEY is missing from backend .env");
        }

        if (!keyword || !targetDomain) {
            throw new Error("Keyword and target domain are required");
        }

        // Normalize the target domain
        const cleanTarget = targetDomain
            .trim()
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .split("/")[0]
            .split(":")[0]
            .toLowerCase();

        // Request Google organic search results from Serper
        const response = await fetch(SERPER_API_URL, {
            method: "POST",
            headers: {
                "X-API-KEY": process.env.SERPER_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: keyword,
                gl: "in",
                hl: "en",
                num: 10,
            }),
            signal: AbortSignal.timeout(20000),
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                `Serper API error (${response.status}): ${
                    responseData.message ||
                    responseData.error ||
                    "Search request failed"
                }`
            );
        }

        const organicResults = responseData.organic || [];

        // Convert API results to the format used by your application
        const allResults = organicResults.map((result, index) => {
            let domain = "";

            try {
                domain = new URL(result.link).hostname
                    .replace(/^www\./i, "")
                    .toLowerCase();
            } catch {
                domain = (result.domain || "").replace(/^www\./i, "").toLowerCase();
            }

            return {
                url: result.link,
                domain,
                title: result.title || "",
                snippet: result.snippet || "",
                position: result.position || index + 1,
            };
        }).filter((result) => result.domain);

        // Match the exact domain or one of its subdomains
        const found = allResults.find((result) =>
            result.domain === cleanTarget ||
            result.domain.endsWith("." + cleanTarget)
        );

        const competitors = allResults
            .filter((result) =>
                result.domain !== cleanTarget &&
                !result.domain.endsWith("." + cleanTarget)
            )
            .slice(0, 10);

        return {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found?.position || null,
                page: found ? Math.ceil(found.position / 10) : null,
                title: found?.title || "",
                snippet: found?.snippet || "",
                competitors,
                totalResultsScanned: allResults.length,
            },
        };
    } catch (error) {
        console.error("Rank check error:", error.message);

        return {
            success: false,
            error: error.message,
        };
    }
}
