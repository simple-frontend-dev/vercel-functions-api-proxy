const API_ENDPOINT = "A_THIRD_PARTY_API_ENDPOINT";
const PRIVATE_API_KEY = "A_VERY_PRIVATE_API_KEY";
const requestUrl = `${API_ENDPOINT}?key=${PRIVATE_API_KEY}`;

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  try {
    const response = await fetch(requestUrl);
    const data = await response.json();
    // post process data if necessary
    return Response.json(data, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error(error);
  }
}
