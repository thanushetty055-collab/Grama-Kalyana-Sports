import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getMatchCommentary(sport: string, matchData: any) {
  try {
    const lastEvent = matchData.lastEvent;
    let context = "";
    if (lastEvent) {
      if (sport === 'Cricket') {
        if (lastEvent.points >= 4) context = `A massive ${lastEvent.points} by ${lastEvent.player || 'the batsman'}!`;
        else if (lastEvent.points === 1) context = `Quick single taken by ${lastEvent.player || 'the batsman'}.`;
      } else if (sport === 'Kabaddi') {
        context = `Brilliant raid! ${lastEvent.player || 'The raider'} secures ${lastEvent.points} points for team ${lastEvent.team === 'A' ? matchData.teamA.name : matchData.teamB.name}.`;
      } else if (sport === 'Volleyball') {
        context = `Powerful spike! Points awarded to team ${lastEvent.team === 'A' ? matchData.teamA.name : matchData.teamB.name}.`;
      }
    }

    const prompt = `You are a professional sports commentator for a local tournament called "Grama-Kalyana Sports". 
    Provide a brief, exciting 2-sentence live commentary for the current state of a ${sport} match.
    
    Context: ${context || 'General match play'}
    Current Match Data:
    ${JSON.stringify(matchData, null, 2)}
    
    Note: If context mentions a player or specific points, emphasize that. Make it sound like a local village tournament but with high energy. Be extremely concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Commentary Error:", error);
    return "The atmosphere is electric here at the Grama-Kalyana grounds! Both teams are giving it their all.";
  }
}

export async function getMatchPrediction(sport: string, matchData: any) {
  try {
    const prompt = `Act as an AI Sports Analyst. Predict the winner and provide a quick reasoning based on the current score.
    Sport: ${sport}
    Match Data: ${JSON.stringify(matchData, null, 2)}
    
    Format JSON: { "prediction": "Team Name", "reason": "Short reason" }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { prediction: "Too close to call", reason: "Both teams are showing incredible fighting spirit." };
  }
}
