const { GoogleGenAI } = require("@google/genai");

async function autoCategorize(description) {

    const prompt = `
                    You are an intelligent expense categorizer.
                    Categorize the following expense description: "${description}"
                    Choose ONLY ONE category from this list:
                    Food, Travel, Transport, Fuel, Groceries, Shopping, Entertainment, Bills, Rent, Utilities, Health, Medical, Education, Subscriptions, Maintenance, Investment, Income, Other.
                    Return ONLY the category name. No explanation.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        console.log(response.text);
        return response.text.trim() || "Other";
    } catch (err) {
        console.log("AI categorization error:", err.message);
        return "Other";
    }
}

module.exports = { autoCategorize };

