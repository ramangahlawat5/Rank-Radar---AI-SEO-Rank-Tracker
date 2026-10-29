
import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const seoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.INTEGER },
        categories: {
            type: Type.OBJECT,
            properties: {
                seo: { type: Type.INTEGER },
                performance: { type: Type.INTEGER },
                accessibility: { type: Type.INTEGER },
                bestPractices: { type: Type.INTEGER },
            },
            required: [
                "seo",
                "performance",
                "accessibility",
                "bestPractices",
            ],
        },
        keywords: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                    density: { type: Type.NUMBER },
                },
                required: ["word", "count", "density"],
            },
        },
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: {
                        type: Type.STRING,
                        format: "enum",
                        enum: ["critical", "warning", "info"],
                    },
                    category: { type: Type.STRING },
                    message: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                },
                required: [
                    "severity",
                    "category",
                    "message",
                    "recommendation",
                ],
            },
        },
    },
    required: ["overallScore", "categories", "keywords", "issues"],
};

// JSON Schema for Groq's strict structured output mode.
const groqSeoSchema = {
    type: "object",
    properties: {
        overallScore: { type: "integer" },
        categories: {
            type: "object",
            properties: {
                seo: { type: "integer" },
                performance: { type: "integer" },
                accessibility: { type: "integer" },
                bestPractices: { type: "integer" },
            },
            required: [
                "seo",
                "performance",
                "accessibility",
                "bestPractices",
            ],
            additionalProperties: false,
        },
        keywords: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    word: { type: "string" },
                    count: { type: "integer" },
                    density: { type: "number" },
                },
                required: ["word", "count", "density"],
                additionalProperties: false,
            },
        },
        issues: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    severity: {
                        type: "string",
                        enum: ["critical", "warning", "info"],
                    },
                    category: { type: "string" },
                    message: { type: "string" },
                    recommendation: { type: "string" },
                },
                required: [
                    "severity",
                    "category",
                    "message",
                    "recommendation",
                ],
                additionalProperties: false,
            },
        },
    },
    required: ["overallScore", "categories", "keywords", "issues"],
    additionalProperties: false,
};

function buildSeoPrompt(scrapedData) {
    const meta = scrapedData.metaData;
    const headings = scrapedData.headings;
    const links = scrapedData.links;
    const images = scrapedData.images;

    return `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${scrapedData.url}
Load Time: ${scrapedData.loadTime}ms
Status Code: ${scrapedData.statusCode}
Page Size: ${Math.round(scrapedData.pageSize / 1024)}KB
Word Count: ${scrapedData.wordCount}

META DATA:
- Title: "${meta.title}" (${meta.title.length} chars)
- Description: "${meta.description}" (${meta.description.length} chars)
- Canonical: "${meta.canonical}"
- Robots: "${meta.robots}"
- OG Title: "${meta.ogTitle}"
- OG Description: "${meta.ogDescription}"
- OG Image: "${meta.ogImage}"
- Twitter Card: "${meta.twitterCard}"
- Viewport: "${meta.viewport}"
- Charset: "${meta.charset}"

HEADINGS:
- H1: ${headings.h1} (texts: ${JSON.stringify(headings.h1Texts)})
- H2: ${headings.h2}
- H3: ${headings.h3}
- H4: ${headings.h4}
- H5: ${headings.h5}
- H6: ${headings.h6}

LINKS:
- Internal: ${links.internal}
- External: ${links.external}
- Total: ${links.total}

IMAGES:
- Total: ${images.total}
- Missing Alt Text: ${images.missingAlt}
- With Alt Text: ${images.withAlt}

PAGE CONTENT (first 3000 chars):
${scrapedData.bodyText}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Severity levels must be exactly one of: "critical", "warning", or "info".
Provide 5-15 issues sorted by severity (critical first). Be specific and actionable with recommendations.
Extract top 10 keywords by frequency from the page content.

Return only valid JSON matching the requested schema.
Scores must be integers from 0 to 100. Keyword density must be a number.
Use empty arrays if no items are found.`;
}

async function analyzeWithGemini(prompt) {
    const response = await ai.models.generateContent({
        model: "gemma-4-31b-it",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: seoAnalysisSchema,
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response");
    }

    return JSON.parse(response.text);
}

async function analyzeWithGroq(prompt) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing from the backend .env");
    }

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [
            {
                role: "system",
                content:
                    "You are an expert SEO analyst. Analyze website data accurately and return only structured SEO audit data.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "seo_analysis",
                strict: true,
                schema: groqSeoSchema,
            },
        },
        max_completion_tokens: 6000,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Groq returned an empty response");
    }

    return JSON.parse(content);
}

export async function analyzeSeoData(scrapedData) {
    let prompt;

    try {
        prompt = buildSeoPrompt(scrapedData);
    } catch (error) {
        console.error("SEO prompt construction error:", error.message);
        return { success: false, error: error.message };
    }

    // Try Gemini first.
    try {
        const analysis = await analyzeWithGemini(prompt);

        console.log("SEO analysis completed using Gemini");

        return {
            success: true,
            data: analysis,
            provider: "gemini",
        };
    } catch (geminiError) {
        console.error(
            "Gemini analysis failed; trying Groq:",
            geminiError.message
        );
    }

    // Use Groq only if Gemini fails.
    try {
        const analysis = await analyzeWithGroq(prompt);

        console.log("SEO analysis completed using Groq fallback");

        return {
            success: true,
            data: analysis,
            provider: "groq",
        };
    } catch (groqError) {
        console.error("Groq fallback also failed:", groqError.message);

        return {
            success: false,
            error: `Both AI providers failed. Groq: ${groqError.message}`,
        };
    }
}











// Old gemini only code but due to api issues i will use gemini then if it fails groq will takeover and continue




// import { GoogleGenAI, Type } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const seoAnalysisSchema = {
//     type: Type.OBJECT,
//     properties: {
//         overallScore: { type: Type.INTEGER },
//         categories: {
//             type: Type.OBJECT,
//             properties: {
//                 seo: { type: Type.INTEGER },
//                 performance: { type: Type.INTEGER },
//                 accessibility: { type: Type.INTEGER },
//                 bestPractices: { type: Type.INTEGER },
//             },
//             required: ["seo", "performance", "accessibility", "bestPractices"],
//         },
//         keywords: {
//             type: Type.ARRAY,
//             items: {
//                 type: Type.OBJECT,
//                 properties: {
//                     word: { type: Type.STRING },
//                     count: { type: Type.INTEGER },
//                     density: { type: Type.NUMBER },
//                 },
//                 required: ["word", "count", "density"],
//             },
//         },
//         issues: {
//             type: Type.ARRAY,
//             items: {
//                 type: Type.OBJECT,
//                 properties: {
//                     severity: {
//                         type: Type.STRING,
//                         format: "enum",
//                         enum: ["critical", "warning", "info"],
//                     },

//                     category: { type: Type.STRING },
//                     message: { type: Type.STRING },
//                     recommendation: { type: Type.STRING },
//                 },
//                 required: ["severity", "category", "message", "recommendation"],
//             },
//         },
//     },
//     required: ["overallScore", "categories", "keywords", "issues"],
// };

// export async function analyzeSeoData(scrapedData) {
//     try {
//         const prompt = `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

//         Website URL: ${scrapedData.url}
//         Load Time: ${scrapedData.loadTime}ms
//         Status Code: ${scrapedData.statusCode}
//         Page Size: ${Math.round(scrapedData.pageSize / 1024)}KB
//         Word Count: ${scrapedData.wordCount}

//         META DATA:
//         - Title: "${scrapedData.metaData.title}" (${scrapedData.metaData.title.length} chars)
//         - Description: "${scrapedData.metaData.description}" (${scrapedData.metaData.description.length} chars)
//         - Canonical: "${scrapedData.metaData.canonical}"
//         - Robots: "${scrapedData.metaData.robots}"
//         - OG Title: "${scrapedData.metaData.ogTitle}"
//         - OG Description: "${scrapedData.metaData.ogDescription}"
//         - OG Image: "${scrapedData.metaData.ogImage}"
//         - Twitter Card: "${scrapedData.metaData.twitterCard}"
//         - Viewport: "${scrapedData.metaData.viewport}"
//         - Charset: "${scrapedData.metaData.charset}"

//         HEADINGS:
//         - H1: ${scrapedData.headings.h1} (texts: ${JSON.stringify(scrapedData.headings.h1Texts)})
//         - H2: ${scrapedData.headings.h2}
//         - H3: ${scrapedData.headings.h3}
//         - H4: ${scrapedData.headings.h4}
//         - H5: ${scrapedData.headings.h5}
//         - H6: ${scrapedData.headings.h6}

//         LINKS:
//         - Internal: ${scrapedData.links.internal}
//         - External: ${scrapedData.links.external}
//         - Total: ${scrapedData.links.total}

//         IMAGES:
//         - Total: ${scrapedData.images.total}
//         - Missing Alt Text: ${scrapedData.images.missingAlt}
//         - With Alt Text: ${scrapedData.images.withAlt}

//         PAGE CONTENT (first 3000 chars):
//         ${scrapedData.bodyText}

//         Scoring guidelines:
//         - Title: 50-60 chars optimal, must exist
//         - Description: 150-160 chars optimal, must exist
//         - H1: exactly 1 is ideal
//         - Images: all should have alt text
//         - Load time: <3s good, <5s ok, >5s poor
//         - Page size: <3MB good
//         - Must have viewport meta, charset, canonical
//         - OG tags and Twitter cards are important
//         - Internal linking is good for SEO
//         - Word count: >300 words for content pages
//         - Check heading hierarchy

//         Severity levels must be exactly one of: "critical", "warning", or "info".
//         Provide 5-15 issues sorted by severity (critical first). Be specific and actionable with recommendations.
//         Extract top 10 keywords by frequency from the page content.`;

//         const response = await ai.models.generateContent({
//             model: "gemma-4-31b-it",
//             contents: [{ role: "user", parts: [{ text: prompt }] }],
//             config: {
//                 responseMimeType: "application/json",
//                 responseSchema: seoAnalysisSchema,
//             },
//         });

//         const analysis = JSON.parse(response.text);

//         return { success: true, data: analysis };
//     } catch (error) {
//         console.error("Gemini analysis error:", error.message);
//         return { success: false, error: error.message };
//     }
// }
